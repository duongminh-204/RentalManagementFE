import QRCode from 'qrcode';
import { QRPay, BanksObject } from 'vietnam-qr-pay';
import { getBankOption } from './paymentMethods';
import { formatMonthYearLabel } from './dateHelpers';
import {
  isWalletVirtualAccount,
  resolveWalletAccountFromPaymentMethod,
} from './qrPayload';

const BANVIET_BIN = BanksObject.banviet.bin;

const removeDiacritics = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const sanitizeVietQrText = (value, maxLength) =>
  removeDiacritics(value)
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);

const normalizePhoneNumber = (phone) => {
  const cleaned = String(phone || '').replace(/\s/g, '');
  if (cleaned.startsWith('+84')) {
    return `0${cleaned.slice(3)}`;
  }
  return cleaned;
};

export const buildInvoiceTransferContent = (invoice = {}) => {
  const roomName = sanitizeVietQrText(invoice.roomName || 'Phong', 20);
  const period = sanitizeVietQrText(formatMonthYearLabel(invoice.monthYear), 20);
  const invoiceId = invoice.invoiceId ? `HD${invoice.invoiceId}` : 'Thanh toan hoa don';

  return sanitizeVietQrText(`${invoiceId} ${roomName} ${period}`, 50);
};

export const buildVietQrImageUrl = ({
  bankId,
  accountNumber,
  accountName = '',
  amount = 0,
  addInfo = '',
  template = 'compact',
}) => {
  const cleanedAccount = String(accountNumber || '').trim();
  const cleanedBankId = String(bankId || '').trim();

  if (!cleanedBankId || !cleanedAccount) {
    return '';
  }

  const params = new URLSearchParams();
  const normalizedAmount = Math.max(0, Math.round(Number(amount) || 0));

  if (normalizedAmount > 0) {
    params.set('amount', String(normalizedAmount));
  }

  const cleanedAddInfo = sanitizeVietQrText(addInfo, 50);
  if (cleanedAddInfo) {
    params.set('addInfo', cleanedAddInfo);
  }

  const cleanedAccountName = sanitizeVietQrText(accountName, 50);
  if (cleanedAccountName) {
    params.set('accountName', cleanedAccountName);
  }

  const query = params.toString();
  const baseUrl = `https://img.vietqr.io/image/${cleanedBankId}-${cleanedAccount}-${template}.png`;

  return query ? `${baseUrl}?${query}` : baseUrl;
};

export const buildQrImageFromData = async (data, size = 240) => {
  if (!data) {
    return '';
  }

  try {
    return await QRCode.toDataURL(data, {
      width: size,
      margin: 2,
      errorCorrectionLevel: 'M',
    });
  } catch {
    return '';
  }
};

const buildWalletEmvPayload = (paymentMethod, invoice, walletAccount) => {
  const amount = Math.max(0, Math.round(Number(invoice.totalAmount) || 0));
  const purpose = buildInvoiceTransferContent(invoice);

  const qr = QRPay.initVietQR({
    bankBin: BANVIET_BIN,
    bankNumber: walletAccount,
    amount: amount > 0 ? String(amount) : undefined,
    purpose: purpose || undefined,
  });

  if (paymentMethod.type === 'momo' && /^(?:99MM|PSP)/i.test(walletAccount)) {
    qr.additionalData.reference = `MOMOW2W${walletAccount.slice(-8)}`;
    const phoneSuffix = normalizePhoneNumber(paymentMethod.phoneNumber).slice(-3);
    if (phoneSuffix) {
      qr.setUnreservedField('80', phoneSuffix);
    }
  }

  return qr.build();
};

const buildWalletPaymentQrImageUrl = async (paymentMethod, invoice, walletAccount) => {
  if (!walletAccount) {
    return '';
  }

  // VietQR EMV qua BVBank (99MM/PSP/99ZP) — app ngân hàng, MoMo và ZaloPay đều quét được
  const emvPayload = buildWalletEmvPayload(paymentMethod, invoice, walletAccount);
  return buildQrImageFromData(emvPayload);
};

export const buildInvoiceVietQrImageUrl = (paymentMethod, invoice = {}) => {
  if (!paymentMethod || paymentMethod.type !== 'bank') {
    return '';
  }

  const bankOption = getBankOption(paymentMethod.provider || paymentMethod.bankName);
  if (!bankOption) {
    return '';
  }

  return buildVietQrImageUrl({
    bankId: bankOption.logoCode,
    accountNumber: paymentMethod.accountNumber,
    accountName: paymentMethod.accountName,
    amount: invoice.totalAmount,
    addInfo: buildInvoiceTransferContent(invoice),
    template: 'compact',
  });
};

export const buildInvoicePaymentQrImageUrlAsync = async (paymentMethod, invoice = {}, walletAccount = '') => {
  if (!paymentMethod) {
    return '';
  }

  if (paymentMethod.type === 'bank') {
    return buildInvoiceVietQrImageUrl(paymentMethod, invoice);
  }

  if (paymentMethod.type === 'momo' || paymentMethod.type === 'zalopay') {
    const resolvedWalletAccount =
      walletAccount ||
      (await resolveWalletAccountFromPaymentMethod(paymentMethod));

    if (!resolvedWalletAccount) {
      return '';
    }

    return buildWalletPaymentQrImageUrl(
      paymentMethod,
      invoice,
      resolvedWalletAccount.toUpperCase()
    );
  }

  return '';
};

export const canAutoFillInvoiceAmount = (paymentMethod, walletAccount = '') => {
  if (!paymentMethod) {
    return false;
  }

  if (paymentMethod.type === 'bank') {
    return true;
  }

  const resolvedWalletAccount =
    walletAccount ||
    String(paymentMethod.walletAccountNumber || '').trim() ||
    (isWalletVirtualAccount(paymentMethod.accountNumber) ? paymentMethod.accountNumber : '');

  return Boolean(resolvedWalletAccount);
};

export const getPaymentQrScanHint = (paymentMethod, walletAccount = '') => {
  if (!paymentMethod) {
    return '';
  }

  const hasWallet =
    walletAccount ||
    String(paymentMethod.walletAccountNumber || '').trim() ||
    isWalletVirtualAccount(paymentMethod.accountNumber);

  if (paymentMethod.type === 'bank') {
    return 'Quét bằng app ngân hàng, MoMo hoặc ZaloPay để tự điền số tiền và nội dung.';
  }

  if ((paymentMethod.type === 'momo' || paymentMethod.type === 'zalopay') && hasWallet) {
    return 'Quét bằng app ngân hàng, MoMo hoặc ZaloPay — mã VietQR đa năng qua BVBank.';
  }

  if (paymentMethod.type === 'momo' || paymentMethod.type === 'zalopay') {
    return 'Cần số ví VietQR (PSP... / 99MM... / 99ZP...) để tạo mã quét được từ app ngân hàng. Upload QR từ app MoMo/ZaloPay hoặc nhập thủ công.';
  }

  return 'Quét bằng ứng dụng tương ứng để thanh toán.';
};
