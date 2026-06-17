import jsQR from 'jsqr';
import { QRPay } from 'vietnam-qr-pay';

const qrCropCandidates = [
  { x: 0, y: 0, width: 1, height: 1 },
  { x: 0.1, y: 0.12, width: 0.8, height: 0.58 },
  { x: 0.14, y: 0.18, width: 0.72, height: 0.5 },
  { x: 0.17, y: 0.2, width: 0.66, height: 0.46 },
];

const readTlvMap = (payload = '') => {
  const map = {};
  let index = 0;

  while (index + 4 <= payload.length) {
    const tag = payload.slice(index, index + 2);
    const length = Number.parseInt(payload.slice(index + 2, index + 4), 10);
    const valueStart = index + 4;
    const valueEnd = valueStart + length;

    if (!/^\d{2}$/.test(tag) || Number.isNaN(length) || valueEnd > payload.length) {
      break;
    }

    map[tag] = payload.slice(valueStart, valueEnd);
    index = valueEnd;
  }

  return map;
};

const parseQrUrlPayload = (payload) => {
  const decodedPayload = decodeURIComponent(payload);
  const accountMatch = decodedPayload.match(/(?:970\d{3})[-_/]([A-Za-z0-9]{5,})/i);
  const bankBinMatch = decodedPayload.match(/(970\d{3})/);

  if (!accountMatch && !bankBinMatch) {
    return {};
  }

  return {
    accountNumber: accountMatch?.[1] || '',
    bankBin: bankBinMatch?.[1] || '',
  };
};

const parseMoMoPipePayload = (payload) => {
  if (!payload.startsWith('2|99|')) {
    return {};
  }

  const parts = payload.split('|');
  return {
    phoneNumber: parts[2] || '',
    accountName: parts[3] || '',
  };
};

const extractWalletAccountFromRawPayload = (payload = '') => {
  if (!payload) {
    return '';
  }

  const walletMatch = payload.match(/(?:99(?:MM|ZP)|PSP)[A-Z0-9]{8,}/i);
  if (walletMatch) {
    return walletMatch[0].toUpperCase();
  }

  try {
    const qrPay = new QRPay(payload);
    if (qrPay.isValid) {
      const bankNumber = String(qrPay.consumer?.bankNumber || '').trim();
      if (isWalletVirtualAccount(bankNumber)) {
        return bankNumber.toUpperCase();
      }
    }
  } catch {
    // ignore parser errors
  }

  return '';
};

export const parseVietQrPayload = (payload) => {
  if (!payload) {
    return {};
  }

  if (payload.startsWith('2|99|')) {
    return parseMoMoPipePayload(payload);
  }

  if (/^https?:\/\//i.test(payload)) {
    return parseQrUrlPayload(payload);
  }

  const walletAccount = extractWalletAccountFromRawPayload(payload);
  if (walletAccount) {
    return { accountNumber: walletAccount, bankBin: '970454' };
  }

  const topLevel = readTlvMap(payload);
  const merchantInfo = Object.entries(topLevel)
    .filter(([tag]) => Number(tag) >= 26 && Number(tag) <= 51)
    .map(([, value]) => value)
    .find((value) => value.includes('A000000727') || value.includes('970'));

  if (!merchantInfo) {
    return {};
  }

  const merchantMap = readTlvMap(merchantInfo);
  const consumerMap = readTlvMap(merchantMap['01'] || '');
  const bankBin = consumerMap['00'] || Object.values(merchantMap).find((value) => /^970\d{3}$/.test(value)) || '';
  const accountNumber =
    consumerMap['01'] ||
    Object.values(merchantMap).find(
      (value) => /^[A-Za-z0-9]{5,}$/.test(value) && !/^970\d{3}$/.test(value)
    ) ||
    '';

  return {
    bankBin,
    accountName: topLevel['59'] && !topLevel['59'].toLowerCase().includes('napas') ? topLevel['59'] : '',
    accountNumber,
  };
};

export const isWalletVirtualAccount = (value) =>
  /^(?:99(?:MM|ZP)|PSP)[A-Z0-9]{8,}$/i.test(String(value || '').trim());

export const extractWalletAccount = (parsed = {}) => {
  const accountNumber = String(parsed.accountNumber || '').trim();
  return isWalletVirtualAccount(accountNumber) ? accountNumber.toUpperCase() : '';
};

const drawCropToCanvas = (image, crop, maxSize = 1200) => {
  const sourceX = Math.max(Math.floor(image.width * crop.x), 0);
  const sourceY = Math.max(Math.floor(image.height * crop.y), 0);
  const sourceWidth = Math.min(Math.floor(image.width * crop.width), image.width - sourceX);
  const sourceHeight = Math.min(Math.floor(image.height * crop.height), image.height - sourceY);
  const scale = Math.min(maxSize / Math.max(sourceWidth, sourceHeight), 2);
  const canvas = document.createElement('canvas');

  canvas.width = Math.max(Math.floor(sourceWidth * scale), 1);
  canvas.height = Math.max(Math.floor(sourceHeight * scale), 1);

  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);

  return canvas;
};

const decodeCanvasWithJsQr = (canvas) => {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const result = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'attemptBoth',
  });

  return result?.data || '';
};

const loadImageFromDataUrl = (dataUrl) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Không thể đọc ảnh QR'));
    image.src = dataUrl;
  });

export const decodeQrFromDataUrl = async (dataUrl) => {
  if (!dataUrl || typeof dataUrl !== 'string') {
    return '';
  }

  try {
    const image = await loadImageFromDataUrl(dataUrl);

    for (const crop of qrCropCandidates) {
      const canvas = drawCropToCanvas(image, crop);
      const payload = decodeCanvasWithJsQr(canvas);
      if (payload) {
        return payload;
      }
    }

    return '';
  } catch {
    return '';
  }
};

export const parseWalletAccountFromQrPayload = (payload = '') => {
  const walletFromRaw = extractWalletAccountFromRawPayload(payload);
  if (walletFromRaw) {
    return walletFromRaw;
  }

  return extractWalletAccount(parseVietQrPayload(payload));
};

export const resolveWalletAccountFromPaymentMethod = async (paymentMethod) => {
  if (!paymentMethod) {
    return '';
  }

  const storedWalletAccount = String(paymentMethod.walletAccountNumber || '').trim();
  if (isWalletVirtualAccount(storedWalletAccount)) {
    return storedWalletAccount.toUpperCase();
  }

  const directAccount = String(paymentMethod.accountNumber || '').trim();
  if (isWalletVirtualAccount(directAccount)) {
    return directAccount.toUpperCase();
  }

  if (!paymentMethod.qrImageUrl) {
    return '';
  }

  const rawPayload = await decodeQrFromDataUrl(paymentMethod.qrImageUrl);
  if (!rawPayload) {
    return '';
  }

  const walletFromRaw = extractWalletAccountFromRawPayload(rawPayload);
  if (walletFromRaw) {
    return walletFromRaw;
  }

  const parsed = parseVietQrPayload(rawPayload);
  return extractWalletAccount(parsed);
};
