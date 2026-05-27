import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import jsQR from 'jsqr';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ImageUp,
  LoaderCircle,
  QrCode,
  ReceiptText,
  RotateCcw,
  Save,
  WalletCards,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { recordDebtPayment, restoreDebtItem } from '../api/dashboardApi';
import { useDashboard } from '../hooks/useDashboard';
import { formatCompactCurrency, formatCount, formatCurrency } from '../utils/dashboardFormat';

const QR_STORAGE_KEY = 'rentalDebtBankQr';

const defaultQrConfig = {
  bankName: '',
  accountName: '',
  accountNumber: '',
  qrImageUrl: '',
};

const bankBinNames = {
  970403: 'Sacombank',
  970405: 'Agribank',
  970407: 'Techcombank',
  970415: 'VietinBank',
  970416: 'ACB',
  970418: 'BIDV',
  970422: 'MBBank',
  970423: 'TPBank',
  970426: 'MSB',
  970432: 'VPBank',
  970436: 'Vietcombank',
  970440: 'SeABank',
  970441: 'VIB',
  970448: 'OCB',
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const qrCropCandidates = [
  { x: 0, y: 0, width: 1, height: 1 },
  { x: 0.1, y: 0.12, width: 0.8, height: 0.58 },
  { x: 0.14, y: 0.18, width: 0.72, height: 0.5 },
  { x: 0.17, y: 0.2, width: 0.66, height: 0.46 },
  { x: 0.18, y: 0.22, width: 0.64, height: 0.42 },
];

const drawCropToCanvas = (imageBitmap, crop) => {
  const sourceX = Math.max(Math.floor(imageBitmap.width * crop.x), 0);
  const sourceY = Math.max(Math.floor(imageBitmap.height * crop.y), 0);
  const sourceWidth = Math.min(Math.floor(imageBitmap.width * crop.width), imageBitmap.width - sourceX);
  const sourceHeight = Math.min(Math.floor(imageBitmap.height * crop.height), imageBitmap.height - sourceY);
  const maxSize = 1200;
  const scale = Math.min(maxSize / Math.max(sourceWidth, sourceHeight), 2);
  const canvas = document.createElement('canvas');

  canvas.width = Math.max(Math.floor(sourceWidth * scale), 1);
  canvas.height = Math.max(Math.floor(sourceHeight * scale), 1);

  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(imageBitmap, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);

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

const decodeCanvasWithBarcodeDetector = async (canvas) => {
  if (typeof window.BarcodeDetector !== 'function') {
    return '';
  }

  try {
    const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
    const results = await detector.detect(canvas);
    return results[0]?.rawValue || '';
  } catch {
    return '';
  }
};

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
  const accountMatch = decodedPayload.match(/(?:970\d{3})[-_/](\d{5,})/i);
  const bankBinMatch = decodedPayload.match(/(970\d{3})/);

  if (!accountMatch && !bankBinMatch) {
    return {};
  }

  const bankBin = bankBinMatch?.[1] || '';
  return {
    accountNumber: accountMatch?.[1] || '',
    bankName: bankBin ? bankBinNames[bankBin] || bankBin : '',
  };
};

const parseVietQrPayload = (payload) => {
  if (!payload) {
    return {};
  }

  if (/^https?:\/\//i.test(payload)) {
    return parseQrUrlPayload(payload);
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
    Object.values(merchantMap).find((value) => /^\d{5,}$/.test(value) && !/^970\d{3}$/.test(value)) ||
    '';
  const accountName = topLevel['59'] && !topLevel['59'].toLowerCase().includes('napas') ? topLevel['59'] : '';

  return {
    bankName: bankBin ? bankBinNames[bankBin] || bankBin : '',
    accountName,
    accountNumber,
  };
};

const decodeQrImage = async (file) => {
  if (false) {
    throw new Error('Trình duyệt này chưa hỗ trợ đọc QR từ ảnh. Bạn vẫn có thể lưu ảnh QR và nhập thông tin thủ công.');
  }

  const imageBitmap = await createImageBitmap(file);
  try {
    for (const crop of qrCropCandidates) {
      const canvas = drawCropToCanvas(imageBitmap, crop);
      const barcodePayload = await decodeCanvasWithBarcodeDetector(canvas);

      if (barcodePayload) {
        return barcodePayload;
      }

      const jsQrPayload = decodeCanvasWithJsQr(canvas);
      if (jsQrPayload) {
        return jsQrPayload;
      }
    }

    return '';
  } finally {
    imageBitmap.close?.();
  }
};

const ocrCropCandidates = [
  { x: 0.04, y: 0.7, width: 0.92, height: 0.22 },
  { x: 0.18, y: 0.72, width: 0.64, height: 0.18 },
  { x: 0.18, y: 0.08, width: 0.64, height: 0.12 },
];

const normalizeOcrText = (text = '') =>
  text
    .replace(/[^\dA-ZÀ-Ỹ\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();

const parseBankInfoFromOcr = (text = '') => {
  const normalizedText = normalizeOcrText(text);
  const lines = text
    .split(/\r?\n/)
    .map(normalizeOcrText)
    .filter(Boolean);
  const accountNumber = normalizedText.match(/\b\d{6,20}\b/)?.[0] || '';
  const accountName =
    lines.find(
      (line) =>
        /^[A-ZÀ-Ỹ\s]{5,}$/.test(line) &&
        !line.includes('VIETCOMBANK') &&
        !line.includes('VIETQR') &&
        !line.includes('NAPAS') &&
        !line.includes('CHIA') &&
        !line.includes('SHARE')
    ) || '';
  const bankName = normalizedText.includes('VIETCOMBANK') ? 'Vietcombank' : '';

  return {
    bankName,
    accountName,
    accountNumber,
  };
};

const recognizeQrScreenshotText = async (file) => {
  const [{ createWorker }, imageBitmap] = await Promise.all([
    import('tesseract.js'),
    createImageBitmap(file),
  ]);
  const worker = await createWorker('eng');

  try {
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ',
      preserve_interword_spaces: '1',
    });

    const texts = [];
    for (const crop of ocrCropCandidates) {
      const canvas = drawCropToCanvas(imageBitmap, crop);
      const result = await worker.recognize(canvas);
      texts.push(result.data.text || '');
    }

    return parseBankInfoFromOcr(texts.join('\n'));
  } finally {
    await worker.terminate();
    imageBitmap.close?.();
  }
};

const loadQrConfig = () => {
  if (typeof window === 'undefined') {
    return defaultQrConfig;
  }

  try {
    return {
      ...defaultQrConfig,
      ...JSON.parse(window.localStorage.getItem(QR_STORAGE_KEY) || '{}'),
    };
  } catch {
    return defaultQrConfig;
  }
};

const formatMonthYearLabel = (monthYear) => {
  if (!monthYear || !/^\d{4}-\d{2}$/.test(monthYear)) {
    return 'Chưa rõ tháng';
  }

  const [year, month] = monthYear.split('-');
  return `Tháng ${month}/${year}`;
};

const formatDueDate = (dueDate) => {
  if (!dueDate) {
    return 'Chưa đặt hạn';
  }

  const parsed = new Date(dueDate);
  if (Number.isNaN(parsed.getTime())) {
    return 'Chưa đặt hạn';
  }

  return parsed.toLocaleDateString('vi-VN');
};

const formatDebtTransferContent = (room, monthYear) => {
  const roomLabel = String(room || '').trim() || 'SO PHONG';
  const monthLabel = String(monthYear || '').trim() || 'THANG';
  return `TIEN TRO - ${roomLabel} - ${monthLabel}`;
};

const getStatusLabel = (status) => {
  const normalizedStatus = String(status || '').toLowerCase();

  if (
    normalizedStatus.includes('partial') ||
    normalizedStatus.includes('một phần') ||
    normalizedStatus.includes('mot phan')
  ) {
    return 'Thu một phần';
  }

  if (normalizedStatus === 'paid' || normalizedStatus.includes('đã thanh toán')) {
    return 'Đã thu';
  }

  return 'Còn nợ';
};

const fallbackDebtItems = (debtMonth) => [
  { itemKey: 'room', itemName: 'Tiền trọ', amount: debtMonth.roomFee },
  { itemKey: 'electric', itemName: 'Tiền điện', amount: debtMonth.electricFee },
  { itemKey: 'water', itemName: 'Tiền nước', amount: debtMonth.waterFee },
  { itemKey: 'service', itemName: 'Dịch vụ', amount: debtMonth.serviceFee },
  { itemKey: 'parking', itemName: 'Gửi xe', amount: debtMonth.parkingFee },
  { itemKey: 'other', itemName: 'Khoản khác', amount: debtMonth.otherFee },
]
  .map((item) => ({
    ...item,
    amount: Number(item.amount) || 0,
    paidAmount: 0,
    outstandingAmount: Number(item.amount) || 0,
    canRestore: false,
  }))
  .filter((item) => item.amount > 0);

const getDebtItems = (debtMonth) => {
  const debtItems = Array.isArray(debtMonth.debtItems) ? debtMonth.debtItems : [];
  return (debtItems.length ? debtItems : fallbackDebtItems(debtMonth))
    .slice()
    .sort((first, second) => {
      const firstOutstanding = Number(first.outstandingAmount) || 0;
      const secondOutstanding = Number(second.outstandingAmount) || 0;

      if (firstOutstanding > 0 && secondOutstanding <= 0) {
        return -1;
      }

      if (firstOutstanding <= 0 && secondOutstanding > 0) {
        return 1;
      }

      return 0;
    });
};

const DebtDetailsPage = () => {
  const { debtInfo, loading, error, refetch } = useDashboard();
  const [payingTarget, setPayingTarget] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [qrConfig, setQrConfig] = useState(loadQrConfig);
  const [qrSaved, setQrSaved] = useState(false);
  const [qrScanMessage, setQrScanMessage] = useState('');
  const [qrScanError, setQrScanError] = useState('');

  const debtors = useMemo(() => {
    const allDebtors = Array.isArray(debtInfo?.debtors) ? debtInfo.debtors : [];
    const topDebtors = Array.isArray(debtInfo?.topDebtors) ? debtInfo.topDebtors : [];
    return allDebtors.length ? allDebtors : topDebtors;
  }, [debtInfo]);

  const unpaidRoomsCount = Number(debtInfo?.unpaidRoomsCount ?? debtInfo?.unpaidTenantsCount ?? debtors.length);
  const totalDebt = Number(debtInfo?.totalDebt ?? 0);
  const totalDebtMonths = debtors.reduce((total, debtor) => total + (debtor.debtMonths?.length || 0), 0);
  const hasDebt = unpaidRoomsCount > 0 || totalDebt > 0 || debtors.length > 0;

  const handleQrChange = (field, value) => {
    setQrSaved(false);
    setQrConfig((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSaveQrConfig = () => {
    window.localStorage.setItem(QR_STORAGE_KEY, JSON.stringify(qrConfig));
    setQrSaved(true);
  };

  const handleQrImageUpload = async (event) => {
    const [file] = event.target.files || [];
    event.target.value = '';

    if (!file) {
      return;
    }

    try {
      setQrSaved(false);
      setQrScanError('');
      setQrScanMessage('Đang đọc QR ngân hàng...');

      const qrImageUrl = await readFileAsDataUrl(file);
      setQrConfig((current) => ({
        ...current,
        qrImageUrl,
      }));

      const rawPayload = await decodeQrImage(file);
      if (false && !rawPayload) {
        setQrScanError('Không đọc được mã QR trong ảnh này. Ảnh vẫn được lưu để hiển thị, bạn có thể nhập thông tin thủ công.');
        setQrScanMessage('');
        return;
      }

      const parsedInfo = parseVietQrPayload(rawPayload);
      const needsOcr = !parsedInfo.bankName || !parsedInfo.accountName || !parsedInfo.accountNumber;
      const ocrInfo = needsOcr ? await recognizeQrScreenshotText(file) : {};
      const mergedInfo = {
        bankName: parsedInfo.bankName || ocrInfo.bankName,
        accountName: parsedInfo.accountName || ocrInfo.accountName,
        accountNumber: parsedInfo.accountNumber || ocrInfo.accountNumber,
      };
      const hasParsedInfo = Object.values(mergedInfo).some(Boolean);

      setQrConfig((current) => ({
        ...current,
        qrImageUrl,
        bankName: mergedInfo.bankName || current.bankName,
        accountName: mergedInfo.accountName || current.accountName,
        accountNumber: mergedInfo.accountNumber || current.accountNumber,
      }));

      setQrScanMessage(
        hasParsedInfo
          ? 'Đã đọc QR và tự điền thông tin tìm thấy.'
          : 'Đã đọc QR, nhưng mã này không chứa đủ thông tin tài khoản. Bạn có thể nhập bổ sung.'
      );
    } catch (err) {
      setQrScanError(err.message || 'Không thể đọc QR từ ảnh này. Ảnh vẫn có thể được lưu và nhập thông tin thủ công.');
      setQrScanMessage('');
    }
  };

  const handleMarkPaid = async (debtMonth, debtItem = null) => {
    const targetKey = debtItem ? `${debtMonth.invoiceId}-${debtItem.itemKey}` : `${debtMonth.invoiceId}-all`;
    const outstandingAmount = Number(debtItem?.outstandingAmount ?? debtMonth.outstandingAmount) || 0;

    if (!debtMonth.invoiceId || outstandingAmount <= 0) {
      return;
    }

    try {
      setPayingTarget(targetKey);
      setPaymentError('');
      setPaymentMessage('');

      const result = await recordDebtPayment(debtMonth.invoiceId, {
        amount: outstandingAmount,
        debtItemKey: debtItem?.itemKey,
        paymentMethod: 'Cash',
        note: debtItem
          ? `Gạch nợ khoản ${debtItem.itemName} ${formatMonthYearLabel(debtMonth.monthYear)}`
          : `Gạch toàn bộ công nợ ${formatMonthYearLabel(debtMonth.monthYear)}`,
      });

      setPaymentMessage(result.message || 'Đã gạch nợ và cập nhật trạng thái hóa đơn.');
      await refetch();
    } catch (err) {
      setPaymentError(err.response?.data?.message || 'Không thể gạch nợ lúc này. Vui lòng thử lại.');
    } finally {
      setPayingTarget(null);
    }
  };

  const handleRestoreDebtItem = async (debtMonth, debtItem) => {
    const targetKey = `${debtMonth.invoiceId}-${debtItem.itemKey}-restore`;

    try {
      setPayingTarget(targetKey);
      setPaymentError('');
      setPaymentMessage('');

      const result = await restoreDebtItem(debtMonth.invoiceId, debtItem.itemKey);
      setPaymentMessage(result.message || 'Đã khôi phục khoản nợ.');
      await refetch();
    } catch (err) {
      setPaymentError(err.response?.data?.message || 'Không thể khôi phục khoản nợ lúc này.');
    } finally {
      setPayingTarget(null);
    }
  };

  return (
    <div className="dashboard-shell min-h-screen w-full flex-1 bg-surface-light">
      <div className="page-content page-content--wide">
        <motion.section
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="dashboard-hero-main"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="dashboard-hero-badge">Theo dõi công nợ</span>
              <h1 className="mt-4 text-3xl font-bold leading-tight text-ink-deep sm:text-4xl">
                Công nợ tiền trọ, điện nước theo từng phòng
              </h1>
            </div>
            <Link to="/dashboard" className="dashboard-action-button">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="dashboard-hero-metric">
              <p className="text-sm font-semibold text-muted">Tổng công nợ hiện tại</p>
              <p className="mt-2 text-2xl font-bold text-accent-pink">{formatCompactCurrency(totalDebt)}</p>
              <p className="mt-1 text-sm text-muted">{formatCurrency(totalDebt)}</p>
            </div>
            <div className="dashboard-hero-metric">
              <p className="text-sm font-semibold text-muted">Phòng còn nợ</p>
              <p className="mt-2 text-2xl font-bold text-ink-deep">{formatCount(unpaidRoomsCount)}</p>
              <p className="mt-1 text-sm text-muted">phòng cần đối chiếu</p>
            </div>
            <div className="dashboard-hero-metric">
              <p className="text-sm font-semibold text-muted">Kỳ chưa thanh toán</p>
              <p className="mt-2 text-2xl font-bold text-ink-deep">{formatCount(totalDebtMonths)}</p>
              <p className="mt-1 text-sm text-muted">hóa đơn còn dư nợ</p>
            </div>
            <div className="dashboard-hero-metric">
              <p className="text-sm font-semibold text-muted">Trạng thái thu</p>
              <p className="mt-2 text-2xl font-bold text-ink-deep">{totalDebt > 0 ? 'Cần xử lý' : 'Đã đủ'}</p>
              <p className="mt-1 text-sm text-muted">{totalDebt > 0 ? 'Có khoản chưa thu đủ' : 'Không còn khoản treo'}</p>
            </div>
          </div>
        </motion.section>

        <section className="dashboard-section-card mt-8">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#fff1f6] p-3 text-accent-pink">
                <QrCode className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-ink-deep">QR thanh toán ngân hàng</h2>
                <p className="text-sm text-muted">Lưu mã QR để người thuê quét khi còn công nợ.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <label className="dashboard-action-button cursor-pointer">
                <ImageUp className="h-4 w-4" />
                Upload QR
                <input type="file" accept="image/*" className="hidden" onChange={handleQrImageUpload} />
              </label>
              <button type="button" onClick={handleSaveQrConfig} className="dashboard-action-button dashboard-action-button--primary">
              <Save className="h-4 w-4" />
              {qrSaved ? 'Đã lưu' : 'Lưu QR'}
              </button>
            </div>
          </div>

          {qrScanMessage ? (
            <div className="mb-4 rounded-2xl border border-[#cfe7be] bg-[#f8fff0] px-4 py-3 text-sm font-semibold text-ink-deep">
              {qrScanMessage}
            </div>
          ) : null}

          {qrScanError ? (
            <div className="mb-4 rounded-2xl border border-[#f3c3d3] bg-[#fff6f9] px-4 py-3 text-sm font-semibold text-ink-deep">
              {qrScanError}
            </div>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="qr-bank-field block rounded-2xl border border-[#eadff2] bg-white px-4 py-3.5">
                <span className="block text-xs font-semibold text-muted/70">Ngân hàng</span>
                <input
                  value={qrConfig.bankName}
                  onChange={(event) => handleQrChange('bankName', event.target.value)}
                  placeholder="Vietcombank"
                  className="mt-1 w-full bg-transparent text-base font-semibold text-ink-deep outline-none placeholder:text-muted/40"
                />
              </label>
              <label className="qr-bank-field block rounded-2xl border border-[#eadff2] bg-white px-4 py-3.5">
                <span className="block text-xs font-semibold text-muted/70">Tên chủ tài khoản</span>
                <input
                  value={qrConfig.accountName}
                  onChange={(event) => handleQrChange('accountName', event.target.value)}
                  placeholder="LE MINH HOANG"
                  className="mt-1 w-full bg-transparent text-base font-semibold text-ink-deep outline-none placeholder:text-muted/40"
                />
              </label>
              <label className="qr-bank-field block rounded-2xl border border-[#eadff2] bg-white px-4 py-3.5">
                <span className="block text-xs font-semibold text-muted/70">Số tài khoản</span>
                <input
                  value={qrConfig.accountNumber}
                  onChange={(event) => handleQrChange('accountNumber', event.target.value)}
                  placeholder="3363335999"
                  className="mt-1 w-full bg-transparent text-base font-semibold text-ink-deep outline-none placeholder:text-muted/40"
                />
              </label>
            </div>

            <div className="rounded-2xl border border-[#eadff2] bg-[#faf7fc] p-3">
              {qrConfig.qrImageUrl ? (
                <img
                  src={qrConfig.qrImageUrl}
                  alt="QR thanh toán ngân hàng"
                  className="mx-auto aspect-square w-full rounded-xl bg-white object-contain"
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center rounded-xl border border-dashed border-[#d8c7df] bg-white text-center text-sm font-semibold text-muted">
                  Chưa có QR
                </div>
              )}
              <div className="mt-3 space-y-1 text-center text-sm">
                <p className="font-bold text-ink-deep">{qrConfig.accountName || 'Tên chủ tài khoản'}</p>
                <p className="text-muted">{qrConfig.bankName || 'Ngân hàng'} · {qrConfig.accountNumber || 'Số tài khoản'}</p>
              </div>
            </div>
          </div>
        </section>

        {paymentMessage ? (
          <div className="mt-6 rounded-2xl border border-[#cfe7be] bg-[#f8fff0] px-4 py-3 text-sm font-semibold text-ink-deep">
            {paymentMessage}
          </div>
        ) : null}

        {paymentError ? (
          <div className="mt-6 rounded-2xl border border-[#f3c3d3] bg-[#fff6f9] px-4 py-3 text-sm font-semibold text-ink-deep">
            {paymentError}
          </div>
        ) : null}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-hairline-cloud border-t-primary" />
            <p className="mt-4 text-base font-semibold text-muted">Đang tải công nợ...</p>
          </div>
        ) : (
          <section className="mt-8">
            {error ? (
              <div className="mb-5 rounded-2xl border border-[#f3c3d3] bg-[#fff6f9] px-4 py-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-accent-pink" />
                  <p className="text-sm font-semibold text-ink-deep">Không tải được dữ liệu công nợ: {error}</p>
                </div>
              </div>
            ) : null}

            {hasDebt ? (
              <div className="space-y-5">
                {debtors.map((debtor) => (
                  <article key={`${debtor.roomId}-${debtor.tenantId ?? 'room'}`} className="dashboard-section-card">
                    <div className="flex flex-col gap-4 border-b border-[#efe6f2] pb-5 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1f6] text-accent-pink">
                          <ReceiptText className="h-6 w-6" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-ink-deep">Phòng {debtor.room || 'chưa rõ'}</h2>
                          <p className="mt-1 text-sm text-muted">{debtor.name || 'Chưa có tên khách'}</p>
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
                        <div className="dashboard-callout dashboard-callout--danger py-3">
                          <p className="text-xs font-semibold text-muted">Còn nợ</p>
                          <p className="mt-1 text-lg font-bold text-accent-pink">{formatCurrency(debtor.amount)}</p>
                        </div>
                        <div className="dashboard-callout py-3">
                          <p className="text-xs font-semibold text-muted">Số kỳ</p>
                          <p className="mt-1 text-lg font-bold text-ink-deep">{formatCount(debtor.debtMonths?.length || 0)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 space-y-4">
                      {debtor.debtMonths?.map((debtMonth) => {
                        const monthTargetKey = `${debtMonth.invoiceId}-all`;
                        const isPayingMonth = payingTarget === monthTargetKey;
                        const monthOutstandingAmount = Number(debtMonth.outstandingAmount) || 0;
                        const debtItems = getDebtItems(debtMonth);
                        const transferContent = formatDebtTransferContent(debtor.room, debtMonth.monthYear);

                        return (
                          <div key={debtMonth.invoiceId} className="overflow-hidden rounded-2xl border border-[#efe6f2] bg-white">
                            <div className="grid gap-4 bg-[#faf7fc] px-4 py-4 lg:grid-cols-[1fr_0.8fr_0.8fr_0.8fr_auto] lg:items-center">
                              <div>
                                <p className="text-base font-bold text-ink-deep">{formatMonthYearLabel(debtMonth.monthYear)}</p>
                                <p className="mt-1 text-sm text-muted">Hạn thu: {formatDueDate(debtMonth.dueDate)}</p>
                                <span className="mt-2 inline-flex rounded-full bg-[#f4eef8] px-3 py-1 text-xs font-bold text-accent-violet-deep">
                                  {getStatusLabel(debtMonth.status)}
                                </span>
                              </div>

                              <div>
                                <p className="text-xs font-semibold text-muted">Tổng hóa đơn</p>
                                <p className="mt-1 text-sm font-bold text-ink-deep">{formatCurrency(debtMonth.totalAmount)}</p>
                              </div>

                              <div>
                                <p className="text-xs font-semibold text-muted">Đã thu</p>
                                <p className="mt-1 text-sm font-bold text-ink-deep">{formatCurrency(debtMonth.paidAmount)}</p>
                              </div>

                              <div>
                                <p className="text-xs font-semibold text-muted">Còn nợ</p>
                                <p className="mt-1 text-sm font-bold text-accent-pink">{formatCurrency(monthOutstandingAmount)}</p>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleMarkPaid(debtMonth)}
                                disabled={isPayingMonth || monthOutstandingAmount <= 0}
                                className="dashboard-action-button dashboard-action-button--primary justify-center whitespace-nowrap"
                              >
                                {isPayingMonth ? (
                                  <LoaderCircle className="h-4 w-4 animate-spin" />
                                ) : (
                                  <WalletCards className="h-4 w-4" />
                                )}
                                {isPayingMonth ? 'Đang thu...' : 'Gạch cả tháng'}
                              </button>
                            </div>

                            {qrConfig.qrImageUrl && monthOutstandingAmount > 0 ? (
                              <div className="grid gap-4 border-t border-[#efe6f2] bg-white px-4 py-4 lg:grid-cols-[120px_minmax(0,1fr)] lg:items-center">
                                <img
                                  src={qrConfig.qrImageUrl}
                                  alt="QR thanh toán cho người thuê"
                                  className="h-28 w-28 rounded-xl border border-[#eadff2] bg-white object-contain"
                                />
                                <div>
                                  <p className="text-sm font-bold text-ink-deep">QR thanh toán cho {formatMonthYearLabel(debtMonth.monthYear)}</p>
                                  <p className="mt-1 text-sm text-muted">
                                    Số tiền cần thanh toán: <span className="font-bold text-accent-pink">{formatCurrency(monthOutstandingAmount)}</span>
                                  </p>
                                  <p className="mt-1 text-sm text-muted">
                                    Nội dung chuyển khoản: <span className="font-bold text-ink-deep">{transferContent}</span>
                                  </p>
                                  <p className="mt-1 text-xs text-muted">
                                    {qrConfig.bankName || 'Ngân hàng'} · {qrConfig.accountNumber || 'Số tài khoản'} · {qrConfig.accountName || 'Chủ tài khoản'}
                                  </p>
                                </div>
                              </div>
                            ) : null}

                            <div className="divide-y divide-[#efe6f2]">
                              {debtItems.map((debtItem) => {
                                const itemTargetKey = `${debtMonth.invoiceId}-${debtItem.itemKey}`;
                                const restoreTargetKey = `${debtMonth.invoiceId}-${debtItem.itemKey}-restore`;
                                const isPayingItem = payingTarget === itemTargetKey;
                                const isRestoringItem = payingTarget === restoreTargetKey;
                                const itemOutstandingAmount = Number(debtItem.outstandingAmount) || 0;
                                const itemPaidAmount = Number(debtItem.paidAmount) || 0;
                                const isSettled = itemOutstandingAmount <= 0 && itemPaidAmount > 0;
                                const canRestore = Boolean(debtItem.canRestore);

                                return (
                                  <div
                                    key={debtItem.itemKey}
                                    className={`grid gap-3 px-4 py-3 lg:grid-cols-[1fr_0.8fr_0.8fr_0.8fr_auto] lg:items-center ${
                                      isSettled ? 'bg-[#fbfafc] opacity-60' : 'bg-white'
                                    }`}
                                  >
                                    <div>
                                      <p className="text-sm font-bold text-ink-deep">{debtItem.itemName}</p>
                                      <p className="mt-1 text-xs text-muted">{formatMonthYearLabel(debtMonth.monthYear)}</p>
                                    </div>
                                    <p className="text-sm text-muted">Phải thu: {formatCurrency(debtItem.amount)}</p>
                                    <p className="text-sm text-muted">Đã thu: {formatCurrency(itemPaidAmount)}</p>
                                    <p className={`text-sm font-bold ${isSettled ? 'text-muted' : 'text-accent-pink'}`}>
                                      {isSettled ? 'Đã gạch' : `Còn nợ: ${formatCurrency(itemOutstandingAmount)}`}
                                    </p>
                                    {isSettled && canRestore ? (
                                      <button
                                        type="button"
                                        onClick={() => handleRestoreDebtItem(debtMonth, debtItem)}
                                        disabled={isRestoringItem}
                                        className="dashboard-action-button justify-center whitespace-nowrap"
                                      >
                                        {isRestoringItem ? (
                                          <LoaderCircle className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <RotateCcw className="h-4 w-4" />
                                        )}
                                        {isRestoringItem ? 'Đang khôi phục...' : 'Khôi phục'}
                                      </button>
                                    ) : isSettled ? (
                                      <button
                                        type="button"
                                        disabled
                                        className="dashboard-action-button justify-center whitespace-nowrap"
                                      >
                                        <CheckCircle2 className="h-4 w-4" />
                                        Đã thu
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleMarkPaid(debtMonth, debtItem)}
                                        disabled={isPayingItem || itemOutstandingAmount <= 0}
                                        className="dashboard-action-button justify-center whitespace-nowrap"
                                      >
                                        {isPayingItem ? (
                                          <LoaderCircle className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <WalletCards className="h-4 w-4" />
                                        )}
                                        {isPayingItem ? 'Đang thu...' : 'Gạch khoản'}
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <article className="dashboard-section-card">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-[#f8fff0] p-3 text-[#4d7a14]">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-ink-deep">Không còn công nợ</h2>
                    <p className="mt-2 text-sm leading-6 text-muted">Các hóa đơn hiện tại đã được đối chiếu đủ thanh toán.</p>
                  </div>
                </div>
              </article>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default DebtDetailsPage;
