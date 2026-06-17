export const PAYMENT_METHODS_STORAGE_KEY = 'rentalDebtPaymentMethods';
export const QR_STORAGE_KEY = 'rentalDebtBankQr';

export const PAYMENT_PROVIDER_LABELS = {
  bank: 'Ngân hàng',
  momo: 'MoMo',
  zalopay: 'ZaloPay',
};

export const BANK_OPTIONS = [
  { name: 'ACB', logoCode: 'ACB', bin: '970416' },
  { name: 'Agribank', logoCode: 'VBA', bin: '970405' },
  { name: 'BIDV', logoCode: 'BIDV', bin: '970418' },
  { name: 'MBBank', logoCode: 'MB', bin: '970422' },
  { name: 'MSB', logoCode: 'MSB', bin: '970426' },
  { name: 'OCB', logoCode: 'OCB', bin: '970448' },
  { name: 'Sacombank', logoCode: 'STB', bin: '970403' },
  { name: 'SeABank', logoCode: 'SEAB', bin: '970440' },
  { name: 'Techcombank', logoCode: 'TCB', bin: '970407' },
  { name: 'TPBank', logoCode: 'TPB', bin: '970423' },
  { name: 'VIB', logoCode: 'VIB', bin: '970441' },
  { name: 'Vietcombank', logoCode: 'VCB', bin: '970436' },
  { name: 'VietinBank', logoCode: 'ICB', bin: '970415' },
  { name: 'VPBank', logoCode: 'VPB', bin: '970432' },
];

const bankNameAliases = {
  ACB: ['ACB', 'Asia Commercial Bank'],
  Agribank: ['Agribank', 'Vietnam Bank for Agriculture and Rural Development'],
  BIDV: ['BIDV', 'Bank for Investment and Development of Vietnam'],
  MBBank: ['MBBank', 'MB Bank', 'MB', 'Military Bank'],
  MSB: ['MSB', 'Maritime Bank'],
  OCB: ['OCB', 'Orient Commercial Bank'],
  Sacombank: ['Sacombank'],
  SeABank: ['SeABank', 'SEA Bank'],
  Techcombank: ['Techcombank', 'TCB', 'Techcom Bank'],
  TPBank: ['TPBank', 'TP Bank', 'Tien Phong Bank'],
  VIB: ['VIB', 'Vietnam International Bank'],
  Vietcombank: ['Vietcombank', 'VCB', 'Vietcom Bank'],
  VietinBank: ['VietinBank', 'Vietin Bank', 'CTG'],
  VPBank: ['VPBank', 'VP Bank'],
};

const normalizeBankName = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');

const bankNameLookup = Object.entries(bankNameAliases).reduce((lookup, [bankName, aliases]) => {
  aliases.forEach((alias) => {
    lookup[normalizeBankName(alias)] = bankName;
  });
  return lookup;
}, {});

export const getMatchedBankName = (bankName) => bankNameLookup[normalizeBankName(bankName)] || '';

export const getBankOption = (bankName) => {
  const matchedBankName = getMatchedBankName(bankName);
  return BANK_OPTIONS.find((option) => option.name === matchedBankName) || null;
};

const hasPaymentMethodDetails = (method) => {
  if (!method || method.enabled === false) {
    return false;
  }

  if (method.type === 'bank') {
    return (
      Boolean(getMatchedBankName(method.provider || method.bankName)) &&
      Boolean(String(method.accountNumber || '').trim())
    );
  }

  if (method.type === 'momo' || method.type === 'zalopay') {
    return Boolean(
      method.walletAccountNumber ||
        method.qrImageUrl ||
        String(method.phoneNumber || '').trim() ||
        String(method.accountNumber || '').trim()
    );
  }

  return false;
};

export const loadPaymentMethods = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const savedMethods = JSON.parse(window.localStorage.getItem(PAYMENT_METHODS_STORAGE_KEY) || '[]');

    if (Array.isArray(savedMethods) && savedMethods.length) {
      return savedMethods.filter(hasPaymentMethodDetails);
    }

    const legacyQrConfig = JSON.parse(window.localStorage.getItem(QR_STORAGE_KEY) || '{}');
    if (!legacyQrConfig.accountNumber) {
      return [];
    }

    const provider = getMatchedBankName(legacyQrConfig.bankName) || legacyQrConfig.bankName;
    if (!provider) {
      return [];
    }

    return [
      {
        id: 'payment-legacy-bank',
        type: 'bank',
        provider,
        accountName: legacyQrConfig.accountName || '',
        accountNumber: legacyQrConfig.accountNumber,
        enabled: true,
        isDefault: true,
      },
    ];
  } catch {
    return [];
  }
};

export const getDefaultPaymentMethod = (methods = []) => {
  if (!methods.length) {
    return null;
  }

  return (
    methods.find((method) => method.isDefault && method.enabled !== false) ||
    methods.find((method) => method.enabled !== false) ||
    methods[0]
  );
};

export const getPaymentMethodTitle = (method) => {
  if (!method) {
    return '';
  }

  if (method.type === 'bank') {
    return getBankOption(method.provider)?.name || method.provider || PAYMENT_PROVIDER_LABELS.bank;
  }

  return PAYMENT_PROVIDER_LABELS[method.type] || method.provider || 'Thanh toán';
};

const isWalletVirtualAccount = (value) =>
  /^(?:99(?:MM|ZP)|PSP)[A-Z0-9]{8,}$/i.test(String(value || '').trim());

export const getPaymentMethodWalletAccount = (method) => {
  if (!method) {
    return '';
  }

  const walletAccount = String(method.walletAccountNumber || '').trim();
  if (isWalletVirtualAccount(walletAccount)) {
    return walletAccount.toUpperCase();
  }

  const directAccount = String(method.accountNumber || '').trim();
  if (isWalletVirtualAccount(directAccount)) {
    return directAccount.toUpperCase();
  }

  return '';
};

export const getPaymentMethodIdentifier = (method) => {
  if (!method) {
    return '';
  }

  if (method.type === 'bank') {
    return method.accountNumber || '';
  }

  return getPaymentMethodWalletAccount(method) || method.phoneNumber || method.accountNumber || '';
};

export const getPaymentMethodIdentifierLabel = (method) => {
  if (!method) {
    return '';
  }

  if (method.type === 'bank') {
    return 'Số tài khoản';
  }

  return getPaymentMethodWalletAccount(method) ? 'Số ví VietQR' : 'Số điện thoại';
};

// Giữ tương thích code cũ chỉ dùng ngân hàng
export const loadBankPaymentMethods = () =>
  loadPaymentMethods().filter((method) => method.type === 'bank');

export const getDefaultBankPaymentMethod = getDefaultPaymentMethod;
