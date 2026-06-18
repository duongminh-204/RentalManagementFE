import { useMemo, useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import jsQR from 'jsqr';
import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  CheckCircle2,
  ChevronsUpDown,
  ImageUp,
  LoaderCircle,
  Plus,
  QrCode,
  ReceiptText,
  RotateCcw,
  Save,
  Star,
  Trash2,
  WalletCards,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { recordDebtPayment, restoreDebtItem } from '../api/dashboardApi';
import { useDashboard } from '../hooks/useDashboard';
import { formatCount, formatCurrency } from '../utils/dashboardFormat';
import { parseWalletAccountFromQrPayload } from '../../../utils/qrPayload';
import { buildPaymentMethodPreviewQrUrl } from '../../../utils/vietqr';
import { getPaymentMethodWalletAccount, getPaymentMethodIdentifier, isWalletVirtualAccountNumber } from '../../../utils/paymentMethods';
import { useConfirmDelete } from '../../../hooks/useConfirmDelete';
import { deleteConfirmPresets } from '../../../utils/deleteConfirmPresets';

const QR_STORAGE_KEY = 'rentalDebtBankQr';
const PAYMENT_METHODS_STORAGE_KEY = 'rentalDebtPaymentMethods';

const createPaymentMethod = (overrides = {}) => {
  const id = overrides.id || `payment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    type: 'bank',
    provider: '',
    accountName: '',
    accountNumber: '',
    phoneNumber: '',
    walletAccountNumber: '',
    qrImageUrl: '',
    enabled: true,
    isDefault: false,
    ...overrides,
    id,
  };
};

const paymentTypeOptions = [
  { type: 'bank', label: 'Ngân hàng', provider: '' },
  { type: 'momo', label: 'MoMo', provider: 'MoMo' },
  { type: 'zalopay', label: 'ZaloPay', provider: 'ZaloPay' },
];

const providerLabels = {
  bank: 'Ngân hàng',
  momo: 'MoMo',
  zalopay: 'ZaloPay',
};

const defaultPaymentMethod = createPaymentMethod({
  id: 'payment-bank-default',
  isDefault: true,
});

const defaultQrConfig = {
  bankName: '',
  accountName: '',
  accountNumber: '',
  qrImageUrl: '',
};

const bankOptions = [
  { name: 'ACB', icon: 'ACB', logoCode: 'ACB', iconClassName: 'bg-[#0b5aa6] text-white' },
  { name: 'Agribank', icon: 'AGB', logoCode: 'VBA', iconClassName: 'bg-[#8c1638] text-white' },
  { name: 'BIDV', icon: 'BIDV', logoCode: 'BIDV', iconClassName: 'bg-[#007d7b] text-white' },
  { name: 'MBBank', icon: 'MB', logoCode: 'MB', iconClassName: 'bg-[#1f4e9a] text-white' },
  { name: 'MSB', icon: 'MSB', logoCode: 'MSB', iconClassName: 'bg-[#f05a28] text-white' },
  { name: 'OCB', icon: 'OCB', logoCode: 'OCB', iconClassName: 'bg-[#0b8f3c] text-white' },
  { name: 'Sacombank', icon: 'STB', logoCode: 'STB', iconClassName: 'bg-[#005baa] text-white' },
  { name: 'SeABank', icon: 'SEAB', logoCode: 'SEAB', iconClassName: 'bg-[#d71920] text-white' },
  { name: 'Techcombank', icon: 'TCB', logoCode: 'TCB', iconClassName: 'bg-[#e31e24] text-white' },
  { name: 'TPBank', icon: 'TPB', logoCode: 'TPB', iconClassName: 'bg-[#6d2c91] text-white' },
  { name: 'VIB', icon: 'VIB', logoCode: 'VIB', iconClassName: 'bg-[#f58220] text-white' },
  { name: 'Vietcombank', icon: 'VCB', logoCode: 'VCB', iconClassName: 'bg-[#007a3d] text-white' },
  { name: 'VietinBank', icon: 'CTG', logoCode: 'ICB', iconClassName: 'bg-[#005bac] text-white' },
  { name: 'VPBank', icon: 'VPB', logoCode: 'VPB', iconClassName: 'bg-[#00853f] text-white' },
];

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
  value
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

const getMatchedBankName = (bankName) => bankNameLookup[normalizeBankName(bankName)] || '';

const getBankOption = (bankName) => {
  const matchedBankName = getMatchedBankName(bankName);
  return bankOptions.find((option) => option.name === matchedBankName);
};

const BankBrandIcon = ({ bankName }) => {
  const bankOption = getBankOption(bankName);
  const [imageFailed, setImageFailed] = useState(false);

  if (!bankOption || imageFailed) {
    return (
      <span className={`flex h-8 w-12 shrink-0 items-center justify-center rounded-lg text-[10px] font-black ${bankOption?.iconClassName || 'bg-[#f1edf5] text-muted'}`}>
        {bankOption?.icon || 'BANK'}
      </span>
    );
  }

  return (
    <span className="flex h-8 w-12 shrink-0 items-center justify-center rounded-lg border border-[#eadff2] bg-white px-1 shadow-sm">
      <img
        src={`https://api.vietqr.io/img/${bankOption.logoCode}.png`}
        alt={`${bankOption.name} logo`}
        className="max-h-6 max-w-10 object-contain"
        onError={() => setImageFailed(true)}
      />
    </span>
  );
};

const MethodBrandIcon = ({ method }) => {
  if (method.type === 'bank') {
    return <BankBrandIcon bankName={method.provider} />;
  }

  if (method.type === 'momo') {
    return (
      <span className="flex h-8 w-12 shrink-0 items-center justify-center rounded-lg bg-[#a50064] text-[10px] font-black text-white">
        MoMo
      </span>
    );
  }

  return (
    <span className="flex h-8 w-12 shrink-0 items-center justify-center rounded-lg bg-[#0068ff] text-[10px] font-black text-white">
      ZLP
    </span>
  );
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
  const walletAccount =
    normalizedText.match(/\b(?:99(?:MM|ZP)|PSP)[A-Z0-9]{8,}\b/)?.[0] ||
    normalizedText.match(/\bPSP\d{10,}\b/)?.[0] ||
    '';
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
    walletAccountNumber: walletAccount,
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

const hasPaymentMethodDetails = (method) =>
  Boolean(
    method.qrImageUrl ||
      method.accountName ||
      method.accountNumber ||
      method.phoneNumber ||
      (method.type === 'bank' && method.provider)
  );

const isValidVietnamPhoneNumber = (phoneNumber) => /^(0|\+84)(3|5|7|8|9)\d{8}$/.test(phoneNumber.replace(/\s/g, ''));

const validatePaymentMethod = (method) => {
  const errors = {};

  if (method.type === 'bank' && !method.provider) {
    errors.provider = 'Vui lòng chọn ngân hàng';
  }

  if (!method.accountName) {
    errors.accountName = 'Vui lòng nhập tên tài khoản';
  }

  if (method.type === 'bank') {
    if (!method.accountNumber) {
      errors.accountNumber = 'Vui lòng nhập số tài khoản';
    } else if (!/^\d{6,20}$/.test(method.accountNumber)) {
      errors.accountNumber = 'Số tài khoản phải gồm 6-20 chữ số';
    }
  } else if (!method.phoneNumber) {
    errors.phoneNumber = 'Vui lòng nhập số điện thoại';
  } else if (!isValidVietnamPhoneNumber(method.phoneNumber)) {
    errors.phoneNumber = 'Số điện thoại không đúng định dạng';
  }

  if (method.type === 'momo' || method.type === 'zalopay') {
    const walletAccount = getPaymentMethodWalletAccount(method);
    if (!walletAccount && !method.qrImageUrl) {
      errors.walletAccountNumber =
        'Cần số ví VietQR (PSP... / 99MM... / 99ZP...) hoặc upload ảnh QR từ app để sinh mã quét được từ app ngân hàng';
    } else if (method.walletAccountNumber && !isWalletVirtualAccountNumber(method.walletAccountNumber)) {
      errors.walletAccountNumber = 'Số ví phải bắt đầu bằng PSP, 99MM hoặc 99ZP';
    }
  }

  return errors;
};

const getPaymentMethodValidationErrors = (methods) =>
  methods.reduce((errorsByMethod, method) => {
    if (hasPaymentMethodDetails(method)) {
      const errors = validatePaymentMethod(method);
      if (Object.keys(errors).length) {
        errorsByMethod[method.id] = errors;
      }
    }

    return errorsByMethod;
  }, {});

const normalizePaymentMethod = (method, index = 0) => {
  const type = paymentTypeOptions.some((option) => option.type === method?.type) ? method.type : 'bank';
  const provider = type === 'bank' ? getMatchedBankName(method?.provider || method?.bankName || '') : providerLabels[type];

  return createPaymentMethod({
    id: method?.id || `payment-method-${index + 1}`,
    type,
    provider,
    accountName: String(method?.accountName || '').trim(),
    accountNumber: String(method?.accountNumber || '').trim(),
    phoneNumber: String(method?.phoneNumber || '').trim(),
    walletAccountNumber: String(method?.walletAccountNumber || '').trim(),
    qrImageUrl: method?.qrImageUrl || '',
    enabled: method?.enabled !== false,
    isDefault: Boolean(method?.isDefault),
  });
};

const normalizePaymentMethods = (methods) => {
  const normalizedMethods = methods.map(normalizePaymentMethod);
  const defaultMethod =
    normalizedMethods.find((method) => method.isDefault && method.enabled) ||
    normalizedMethods.find((method) => method.enabled) ||
    normalizedMethods[0];

  if (defaultMethod) {
    return normalizedMethods.map((method) => ({
      ...method,
      isDefault: method.id === defaultMethod.id,
    }));
  }

  return [defaultPaymentMethod];
};

const loadPaymentMethods = () => {
  if (typeof window === 'undefined') {
    return [defaultPaymentMethod];
  }

  try {
    const savedMethods = JSON.parse(window.localStorage.getItem(PAYMENT_METHODS_STORAGE_KEY) || '[]');

    if (Array.isArray(savedMethods) && savedMethods.length) {
      return normalizePaymentMethods(savedMethods);
    }

    const legacyQrConfig = {
      ...defaultQrConfig,
      ...JSON.parse(window.localStorage.getItem(QR_STORAGE_KEY) || '{}'),
    };

    if (Object.values(legacyQrConfig).some(Boolean)) {
      return [
        createPaymentMethod({
          id: 'payment-legacy-bank',
          type: 'bank',
          provider: getMatchedBankName(legacyQrConfig.bankName) || legacyQrConfig.bankName,
          accountName: legacyQrConfig.accountName,
          accountNumber: legacyQrConfig.accountNumber,
          qrImageUrl: legacyQrConfig.qrImageUrl,
          isDefault: true,
        }),
      ];
    }

    return [defaultPaymentMethod];
  } catch {
    return [defaultPaymentMethod];
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
  const { confirmDelete, ConfirmDeleteDialog } = useConfirmDelete();
  const { debtInfo, loading, error, refetch } = useDashboard();
  const [payingTarget, setPayingTarget] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [paymentMethods, setPaymentMethods] = useState(loadPaymentMethods);
  const [methodsSaved, setMethodsSaved] = useState(false);
  const [qrScanMessage, setQrScanMessage] = useState('');
  const [qrScanError, setQrScanError] = useState('');
  const [bankMenuOpen, setBankMenuOpen] = useState(null);
  const [activePaymentMethodId, setActivePaymentMethodId] = useState('');
  const [paymentMethodErrors, setPaymentMethodErrors] = useState({});
  const [selectedPaymentMethodIds, setSelectedPaymentMethodIds] = useState([]);
  const [multiSelectPaymentMode, setMultiSelectPaymentMode] = useState(false);
  const [sortPaymentMode, setSortPaymentMode] = useState(false);

  const debtors = useMemo(() => {
    const allDebtors = Array.isArray(debtInfo?.debtors) ? debtInfo.debtors : [];
    const topDebtors = Array.isArray(debtInfo?.topDebtors) ? debtInfo.topDebtors : [];
    return allDebtors.length ? allDebtors : topDebtors;
  }, [debtInfo]);

  const unpaidRoomsCount = Number(debtInfo?.unpaidRoomsCount ?? debtInfo?.unpaidTenantsCount ?? debtors.length);
  const totalDebt = Number(debtInfo?.totalDebt ?? 0);
  const totalDebtMonths = debtors.reduce((total, debtor) => total + (debtor.debtMonths?.length || 0), 0);
  const hasDebt = unpaidRoomsCount > 0 || totalDebt > 0 || debtors.length > 0;
  const activePaymentMethod = paymentMethods.find((method) => method.id === activePaymentMethodId) || paymentMethods[0];
  const activePaymentMethodErrors = activePaymentMethod ? paymentMethodErrors[activePaymentMethod.id] || {} : {};
  const selectedPaymentMethodCount = selectedPaymentMethodIds.length;

  const updatePaymentMethod = (methodId, updates) => {
    setMethodsSaved(false);
    setPaymentMethodErrors((currentErrors) => {
      if (!currentErrors[methodId]) {
        return currentErrors;
      }

      const nextMethodErrors = { ...currentErrors[methodId] };
      Object.keys(updates).forEach((field) => {
        delete nextMethodErrors[field];
      });

      return {
        ...currentErrors,
        [methodId]: nextMethodErrors,
      };
    });
    setPaymentMethods((currentMethods) =>
      currentMethods.map((method) => (method.id === methodId ? { ...method, ...updates } : method))
    );
  };

  const handlePaymentTypeChange = (methodId, type) => {
    const nextType = paymentTypeOptions.find((option) => option.type === type) || paymentTypeOptions[0];
    const currentMethod = paymentMethods.find((method) => method.id === methodId);

    if (!currentMethod || currentMethod.type === nextType.type) {
      return;
    }

    if (hasPaymentMethodDetails(currentMethod)) {
      const existingMethod = paymentMethods.find((method) => method.type === nextType.type);

      if (existingMethod) {
        setActivePaymentMethodId(existingMethod.id);
      } else {
        const nextMethod = createPaymentMethod({
          type: nextType.type,
          provider: nextType.type === 'bank' ? '' : nextType.provider,
        });
        setPaymentMethods((currentMethods) => [...currentMethods, nextMethod]);
        setActivePaymentMethodId(nextMethod.id);
      }

      setMethodsSaved(false);
      setQrScanError('');
      return;
    }

    setPaymentMethodErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[methodId];
      return nextErrors;
    });
    updatePaymentMethod(methodId, {
      type: nextType.type,
      provider: nextType.type === 'bank' ? '' : nextType.provider,
    });
    setQrScanError('');
  };

  const handleBankSelect = (methodId, bankName) => {
    updatePaymentMethod(methodId, { provider: bankName });
    setQrScanError('');
    setBankMenuOpen(null);
  };

  const handleAddPaymentMethod = () => {
    const nextMethod = createPaymentMethod();
    setMethodsSaved(false);
    setPaymentMethods((currentMethods) => [...currentMethods, { ...nextMethod, isDefault: currentMethods.length === 0 }]);
    setActivePaymentMethodId(nextMethod.id);
  };

  const handleRemovePaymentMethods = (methodIds) => {
    const methodIdSet = new Set(methodIds);
    if (!methodIdSet.size) {
      return;
    }

    setMethodsSaved(false);
    setPaymentMethodErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      methodIdSet.forEach((methodId) => {
        delete nextErrors[methodId];
      });
      return nextErrors;
    });
    const remainingMethods = paymentMethods.filter((method) => !methodIdSet.has(method.id));

    let nextMethods = remainingMethods;
    if (!nextMethods.length) {
      nextMethods = [createPaymentMethod({ isDefault: true })];
    } else if (!nextMethods.some((method) => method.isDefault)) {
      nextMethods = nextMethods.map((method, index) => ({
        ...method,
        isDefault: index === 0,
      }));
    }

    setPaymentMethods(nextMethods);
    setSelectedPaymentMethodIds((currentIds) => currentIds.filter((methodId) => !methodIdSet.has(methodId)));
    if (activePaymentMethod?.id && methodIdSet.has(activePaymentMethod.id)) {
      setActivePaymentMethodId(nextMethods[0]?.id || '');
    }
  };

  const handleRemovePaymentMethod = (methodId) => {
    handleRemovePaymentMethods([methodId]);
  };

  const confirmRemovePaymentMethods = async (methodIds) => {
    const methods = paymentMethods.filter((method) => methodIds.includes(method.id));
    const confirmed = await confirmDelete(
      deleteConfirmPresets.paymentMethod(methods[0], methodIds.length)
    );
    if (!confirmed) return;
    handleRemovePaymentMethods(methodIds);
  };

  const confirmRemovePaymentMethod = async (methodId) => {
    await confirmRemovePaymentMethods([methodId]);
  };

  const confirmClearQrImage = async (methodId) => {
    const method = paymentMethods.find((item) => item.id === methodId);
    const confirmed = await confirmDelete(deleteConfirmPresets.paymentQrImage(method));
    if (!confirmed) return;
    handleClearQrImage(methodId);
  };

  const handleTogglePaymentMethodSelection = (methodId, checked) => {
    setSelectedPaymentMethodIds((currentIds) => {
      if (checked) {
        return currentIds.includes(methodId) ? currentIds : [...currentIds, methodId];
      }

      return currentIds.filter((currentId) => currentId !== methodId);
    });
  };

  const handleToggleMultiSelectPaymentMode = () => {
    setMultiSelectPaymentMode((currentMode) => {
      if (currentMode) {
        setSelectedPaymentMethodIds([]);
      } else {
        setSortPaymentMode(false);
      }

      return !currentMode;
    });
  };

  const handleToggleSortPaymentMode = () => {
    setSortPaymentMode((currentMode) => {
      if (!currentMode) {
        setMultiSelectPaymentMode(false);
        setSelectedPaymentMethodIds([]);
      }

      return !currentMode;
    });
  };

  const handlePaymentMethodRowClick = (methodId) => {
    if (multiSelectPaymentMode) {
      handleTogglePaymentMethodSelection(methodId, !selectedPaymentMethodIds.includes(methodId));
      return;
    }

    setActivePaymentMethodId(methodId);
  };

  const handleReorderPaymentMethods = (nextMethods) => {
    if (!sortPaymentMode) {
      return;
    }
    setMethodsSaved(false);
    setPaymentMethods(nextMethods);
  };

  const handleSetDefaultMethod = (methodId) => {
    setMethodsSaved(false);
    setPaymentMethods((currentMethods) =>
      currentMethods.map((method) => ({
        ...method,
        isDefault: method.id === methodId,
      }))
    );
  };

  const handleSavePaymentMethods = () => {
    const normalizedMethods = paymentMethods.map((method, index) => normalizePaymentMethod(method, index));
    const validationErrors = getPaymentMethodValidationErrors(normalizedMethods);

    if (Object.keys(validationErrors).length) {
      setMethodsSaved(false);
      setQrScanMessage('');
      setQrScanError('');
      setPaymentMethodErrors(validationErrors);
      setActivePaymentMethodId(Object.keys(validationErrors)[0]);
      return;
    }

    setPaymentMethodErrors({});
    let savableMethods = normalizedMethods.filter(hasPaymentMethodDetails);

    if (savableMethods.length) {
      const defaultMethod =
        savableMethods.find((method) => method.isDefault && method.enabled) ||
        savableMethods.find((method) => method.enabled) ||
        savableMethods[0];
      savableMethods = savableMethods.map((method) => ({
        ...method,
        isDefault: method.id === defaultMethod.id,
      }));
      window.localStorage.setItem(PAYMENT_METHODS_STORAGE_KEY, JSON.stringify(savableMethods));
    } else {
      window.localStorage.removeItem(PAYMENT_METHODS_STORAGE_KEY);
      window.localStorage.removeItem(QR_STORAGE_KEY);
    }

    const nextMethods = savableMethods.length ? savableMethods : [createPaymentMethod({ isDefault: true })];
    setPaymentMethods(nextMethods);
    if (!nextMethods.some((method) => method.id === activePaymentMethod?.id)) {
      setActivePaymentMethodId(nextMethods[0]?.id || '');
    }
    setMethodsSaved(true);
  };

  const handleClearQrImage = (methodId) => {
    updatePaymentMethod(methodId, { qrImageUrl: '' });
  };

  const handleQrImageUpload = async (event, methodId) => {
    const [file] = event.target.files || [];
    event.target.value = '';

    if (!file) {
      return;
    }

    const targetMethod = paymentMethods.find((method) => method.id === methodId);
    if (!targetMethod) {
      return;
    }

    try {
      setMethodsSaved(false);
      setQrScanError('');
      setQrScanMessage(targetMethod.type === 'bank' ? 'Đang đọc QR ngân hàng...' : 'Đang lưu ảnh QR...');

      const qrImageUrl = await readFileAsDataUrl(file);
      const rawPayload = await decodeQrImage(file);
      const parsedInfo = parseVietQrPayload(rawPayload);

      if (targetMethod.type !== 'bank') {
        const walletAccount = parseWalletAccountFromQrPayload(rawPayload);
        const needsOcr = !walletAccount;
        const ocrInfo = needsOcr ? await recognizeQrScreenshotText(file) : {};
        const mergedWallet =
          walletAccount ||
          ocrInfo.walletAccountNumber ||
          '';

        updatePaymentMethod(methodId, {
          qrImageUrl,
          walletAccountNumber: mergedWallet,
          accountName: parsedInfo.accountName || ocrInfo.accountName || targetMethod.accountName,
        });

        setQrScanMessage(
          mergedWallet
            ? `Đã lưu QR và số ví ${mergedWallet}. Hóa đơn sẽ sinh mã VietQR quét được từ app ngân hàng.`
            : 'Chưa đọc được số ví VietQR (PSP... / 99MM... / 99ZP...). Upload ảnh QR rõ nét từ app MoMo/ZaloPay hoặc nhập số ví thủ công.'
        );
        return;
      }

      const needsOcr = !parsedInfo.bankName || !parsedInfo.accountName || !parsedInfo.accountNumber;
      const ocrInfo = needsOcr ? await recognizeQrScreenshotText(file) : {};
      const mergedInfo = {
        bankName: parsedInfo.bankName || ocrInfo.bankName,
        accountName: parsedInfo.accountName || ocrInfo.accountName,
        accountNumber: parsedInfo.accountNumber || ocrInfo.accountNumber,
      };
      const hasParsedInfo = Object.values(mergedInfo).some(Boolean);

      setPaymentMethods((currentMethods) =>
        currentMethods.map((method) =>
          method.id === methodId
            ? {
                ...method,
                provider: getMatchedBankName(mergedInfo.bankName) || mergedInfo.bankName || method.provider,
                accountName: mergedInfo.accountName || method.accountName,
                accountNumber: mergedInfo.accountNumber || method.accountNumber,
                qrImageUrl,
              }
            : method
        )
      );

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

  const activeSelectedBankOption = activePaymentMethod ? getBankOption(activePaymentMethod.provider) : null;
  const activeMethodTitle =
    activePaymentMethod?.type === 'bank'
      ? activeSelectedBankOption?.name || 'Chọn ngân hàng'
      : providerLabels[activePaymentMethod?.type] || 'Phương thức';
  const activeAccountIdentifier =
    activePaymentMethod?.type === 'bank'
      ? activePaymentMethod.accountNumber
      : getPaymentMethodIdentifier(activePaymentMethod) || activePaymentMethod?.phoneNumber;
  const activePreviewQrUrl = activePaymentMethod ? buildPaymentMethodPreviewQrUrl(activePaymentMethod) : '';
  const activeUsesUniversalVietQr =
    Boolean(activePreviewQrUrl) &&
    (activePaymentMethod?.type === 'bank'
      ? Boolean(activePaymentMethod.accountNumber)
      : Boolean(getPaymentMethodWalletAccount(activePaymentMethod)));

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
                Người thuê trọ còn nợ tiền
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
              <p className="mt-2 text-2xl font-bold text-accent-pink">{formatCurrency(totalDebt)}</p>
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
          <div className="mb-5 flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[#fff1f6] p-3 text-accent-pink">
                <QrCode className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-ink-deep">Phương thức thanh toán</h2>
                <p className="text-sm text-muted">Chỉ phương thức đang bật mới hiển thị cho người thuê dùng để chuyển khoản.</p>
              </div>
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

          {activePaymentMethod ? (
            <div className="grid items-start gap-5 xl:grid-cols-[minmax(280px,360px)_minmax(280px,340px)_minmax(280px,1fr)]">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={handleAddPaymentMethod} className="dashboard-action-button h-12 justify-center">
                    <Plus className="h-4 w-4" />
                    Thêm phương thức
                  </button>
                  <button type="button" onClick={handleSavePaymentMethods} className="dashboard-action-button dashboard-action-button--primary h-12 justify-center">
                    <Save className="h-4 w-4" />
                    {methodsSaved ? 'Đã lưu' : 'Lưu'}
                  </button>
                </div>
                <div className="grid gap-2">
                  {paymentTypeOptions.map((option) => (
                    <button
                      key={option.type}
                      type="button"
                      onClick={() => handlePaymentTypeChange(activePaymentMethod.id, option.type)}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-bold transition ${
                        activePaymentMethod.type === option.type
                          ? 'border-accent-pink bg-[#fff1f6] text-accent-pink'
                          : 'border-[#eadff2] bg-white text-muted hover:text-ink-deep'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                {activePaymentMethod.type === 'bank' ? (
                  <div>
                    <div
                      className={`qr-bank-field relative cursor-pointer rounded-2xl border bg-white px-4 py-3 ${
                        activePaymentMethodErrors.provider ? 'border-accent-pink' : 'border-[#eadff2]'
                      }`}
                      onClick={() => setBankMenuOpen(activePaymentMethod.id)}
                    >
                      <span className="block text-xs font-semibold text-muted/70">Ngân hàng</span>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setBankMenuOpen((current) => (current === activePaymentMethod.id ? null : activePaymentMethod.id));
                        }}
                        className="mt-1 flex min-h-8 w-full items-center justify-between gap-3 text-left text-base font-semibold text-ink-deep outline-none"
                      >
                        <span className={activeSelectedBankOption ? 'text-ink-deep' : 'text-muted/60'}>
                          {activeSelectedBankOption?.name || 'Chọn ngân hàng'}
                        </span>
                        <span className="flex items-center gap-2">
                          {activeSelectedBankOption ? <BankBrandIcon bankName={activeSelectedBankOption.name} /> : null}
                          <ChevronDown className={`h-4 w-4 text-muted transition ${bankMenuOpen === activePaymentMethod.id ? 'rotate-180' : ''}`} />
                        </span>
                      </button>

                      {bankMenuOpen === activePaymentMethod.id ? (
                        <div
                          className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 max-h-72 overflow-y-auto rounded-2xl border border-[#eadff2] bg-white p-2 shadow-xl"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleBankSelect(activePaymentMethod.id, '')}
                            className="mb-1 flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-muted transition hover:bg-[#fff8fb] hover:text-ink-deep"
                          >
                            <span>Bỏ chọn ngân hàng</span>
                            <X className="h-4 w-4" />
                          </button>
                          {bankOptions.map((bankOption) => (
                            <button
                              key={bankOption.name}
                              type="button"
                              onClick={() => handleBankSelect(activePaymentMethod.id, bankOption.name)}
                              className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold transition hover:bg-[#fff8fb] ${
                                activeSelectedBankOption?.name === bankOption.name ? 'bg-[#fff1f6] text-accent-pink' : 'text-ink-deep'
                              }`}
                            >
                              <span>{bankOption.name}</span>
                              <BankBrandIcon bankName={bankOption.name} />
                            </button>
                          ))}
                        </div>
                      ) : null}
                      {activePaymentMethodErrors.provider ? (
                        <p className="mt-1 text-xs font-normal text-accent-pink">{activePaymentMethodErrors.provider}</p>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                <div>
                  <label className={`qr-bank-field block rounded-2xl border bg-white px-4 py-3 ${activePaymentMethodErrors.accountName ? 'border-accent-pink' : 'border-[#eadff2]'}`}>
                    <span className="block text-xs font-semibold text-muted/70">Tên tài khoản</span>
                    <input
                      value={activePaymentMethod.accountName}
                      onChange={(event) => updatePaymentMethod(activePaymentMethod.id, { accountName: event.target.value })}
                      className="mt-1 w-full bg-transparent text-base font-semibold text-ink-deep outline-none placeholder:text-muted/40"
                    />
                    {activePaymentMethodErrors.accountName ? (
                      <span className="mt-1 block text-xs font-normal text-accent-pink">{activePaymentMethodErrors.accountName}</span>
                    ) : null}
                  </label>
                </div>

                <div>
                  <label className={`qr-bank-field block rounded-2xl border bg-white px-4 py-3 ${
                    activePaymentMethodErrors.accountNumber || activePaymentMethodErrors.phoneNumber ? 'border-accent-pink' : 'border-[#eadff2]'
                  }`}>
                    <span className="block text-xs font-semibold text-muted/70">{activePaymentMethod.type === 'bank' ? 'Số tài khoản' : 'Số điện thoại'}</span>
                    <input
                      value={activeAccountIdentifier || ''}
                      onChange={(event) =>
                        updatePaymentMethod(activePaymentMethod.id, {
                          [activePaymentMethod.type === 'bank' ? 'accountNumber' : 'phoneNumber']: event.target.value,
                        })
                      }
                      className="mt-1 w-full bg-transparent text-base font-semibold text-ink-deep outline-none placeholder:text-muted/40"
                    />
                    {activePaymentMethodErrors.accountNumber || activePaymentMethodErrors.phoneNumber ? (
                      <span className="mt-1 block text-xs font-normal text-accent-pink">
                        {activePaymentMethodErrors.accountNumber || activePaymentMethodErrors.phoneNumber}
                      </span>
                    ) : null}
                  </label>
                </div>

                {activePaymentMethod.type !== 'bank' ? (
                  <div>
                    <label className={`qr-bank-field block rounded-2xl border bg-white px-4 py-3 ${
                      activePaymentMethodErrors.walletAccountNumber ? 'border-accent-pink' : 'border-[#eadff2]'
                    }`}>
                      <span className="block text-xs font-semibold text-muted/70">
                        Số ví VietQR (PSP... / 99MM... / 99ZP...)
                      </span>
                      <input
                        value={activePaymentMethod.walletAccountNumber || ''}
                        onChange={(event) =>
                          updatePaymentMethod(activePaymentMethod.id, {
                            walletAccountNumber: event.target.value.toUpperCase(),
                          })
                        }
                        placeholder="VD: PSP2616812000000210 — lấy từ STK dưới QR nhận tiền trong app"
                        className="mt-1 w-full bg-transparent text-base font-semibold text-ink-deep outline-none placeholder:text-muted/40"
                      />
                      <span className="mt-2 block text-xs font-normal text-muted/80">
                        Bắt buộc để sinh mã QR quét được từ mọi app ngân hàng (VietQR qua BVBank). Số điện thoại chỉ dùng trong app MoMo/ZaloPay.
                      </span>
                      {activePaymentMethodErrors.walletAccountNumber ? (
                        <span className="mt-1 block text-xs font-normal text-accent-pink">
                          {activePaymentMethodErrors.walletAccountNumber}
                        </span>
                      ) : null}
                    </label>
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-[#eadff2] bg-[#faf7fc] p-4">
                {activePreviewQrUrl || activePaymentMethod.qrImageUrl ? (
                  <div className="relative">
                    {activePaymentMethod.qrImageUrl ? (
                      <button
                        type="button"
                        onClick={() => confirmClearQrImage(activePaymentMethod.id)}
                        className="absolute left-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#eadff2] bg-white/95 text-ink-deep shadow-sm transition hover:bg-[#fff1f6] hover:text-accent-pink"
                        aria-label="Xóa ảnh QR"
                        title="Xóa ảnh QR"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}
                    <img
                      src={activePreviewQrUrl || activePaymentMethod.qrImageUrl}
                      alt={`QR ${activeMethodTitle}`}
                      className="mx-auto aspect-square w-full rounded-xl bg-white object-contain"
                    />
                    {activeUsesUniversalVietQr ? (
                      <p className="mt-2 text-center text-xs font-semibold text-[#2f7d4f]">
                        VietQR đa năng — quét được từ mọi app ngân hàng, MoMo và ZaloPay
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <label className="flex aspect-square w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#d8c7df] bg-white text-center text-sm font-semibold text-muted transition hover:border-accent-pink hover:bg-[#fff8fb] hover:text-ink-deep">
                    <span className="inline-flex items-center gap-2">
                      <ImageUp className="h-4 w-4" />
                      Upload QR
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={(event) => handleQrImageUpload(event, activePaymentMethod.id)} />
                  </label>
                )}
                <div className="mt-3 space-y-1 text-center text-sm">
                  <p className="font-bold text-ink-deep">{activePaymentMethod.accountName || 'Tên tài khoản'}</p>
                  <p className="text-muted">{activeMethodTitle} · {activeAccountIdentifier || (activePaymentMethod.type === 'bank' ? 'Số tài khoản' : 'Số điện thoại')}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#eadff2] bg-white p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-ink-deep">Danh sách tài khoản</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleToggleMultiSelectPaymentMode}
                      className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                        multiSelectPaymentMode
                          ? 'border-accent-pink bg-[#fff1f6] text-accent-pink'
                          : 'border-[#eadff2] text-ink-deep hover:bg-[#fff8fb] hover:text-accent-pink'
                      }`}
                    >
                      Chọn nhiều tài khoản
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleSortPaymentMode}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
                        sortPaymentMode
                          ? 'border-accent-pink bg-[#fff1f6] text-accent-pink'
                          : 'border-[#eadff2] text-ink-deep hover:bg-[#fff8fb] hover:text-accent-pink'
                      }`}
                      title="Sắp xếp thứ tự tài khoản"
                    >
                      <ChevronsUpDown className="h-4 w-4" />
                    </button>
                    {multiSelectPaymentMode && selectedPaymentMethodCount > 0 ? (
                      <button
                        type="button"
                        onClick={() => confirmRemovePaymentMethods(selectedPaymentMethodIds)}
                        className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-[#f3c3d3] bg-[#fff6f9] px-3 text-xs font-bold text-accent-pink transition hover:bg-[#fff1f6]"
                        title={`Xóa ${selectedPaymentMethodCount} tài khoản đã chọn`}
                      >
                        <Trash2 className="h-4 w-4" />
                        Xóa ({selectedPaymentMethodCount})
                      </button>
                    ) : null}
                  </div>
                </div>

                <Reorder.Group
                  as="div"
                  axis="y"
                  values={paymentMethods}
                  onReorder={handleReorderPaymentMethods}
                  className="m-0 max-h-[360px] space-y-2 overflow-y-auto p-0 pr-1"
                >
                  {paymentMethods.map((method) => {
                    const listBankOption = getBankOption(method.provider);
                    const listTitle = method.type === 'bank' ? listBankOption?.name || 'Chọn ngân hàng' : providerLabels[method.type];
                    const listIdentifier = method.type === 'bank' ? method.accountNumber : method.phoneNumber;
                    const isActive = method.id === activePaymentMethod.id;
                    const isSelected = selectedPaymentMethodIds.includes(method.id);

                    return (
                      <Reorder.Item
                        key={method.id}
                        value={method}
                        drag={sortPaymentMode ? 'y' : false}
                        whileDrag={{ zIndex: 40 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                        as="div"
                        className="list-none"
                      >
                        <button
                        type="button"
                        onClick={() => handlePaymentMethodRowClick(method.id)}
                        className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                          isActive ? 'border-accent-pink bg-[#fff1f6]' : 'border-[#eadff2] bg-white hover:bg-[#fff8fb]'
                        } ${sortPaymentMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
                      >
                        {multiSelectPaymentMode ? (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(event) => {
                              event.stopPropagation();
                              handleTogglePaymentMethodSelection(method.id, event.target.checked);
                            }}
                            onClick={(event) => event.stopPropagation()}
                            className="h-4 w-4 shrink-0 accent-[#ff6c9e]"
                            aria-label={`Chọn ${listTitle} để xóa`}
                          />
                        ) : null}
                        <span className="flex min-w-0 flex-1 items-center gap-3 text-left">
                          <MethodBrandIcon method={method} />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span className="truncate text-sm font-bold text-ink-deep">{listTitle}</span>
                              {method.isDefault ? <Star className="h-3.5 w-3.5 shrink-0 fill-current text-accent-pink" /> : null}
                            </span>
                            <span className="mt-0.5 block truncate text-xs font-semibold text-muted">
                              {method.accountName || 'Tên tài khoản'} · {listIdentifier || (method.type === 'bank' ? 'Số tài khoản' : 'Số điện thoại')}
                            </span>
                            <span className={`mt-1 block text-xs font-bold ${method.enabled ? 'text-[#4f8a2b]' : 'text-muted'}`}>
                              {method.enabled ? 'Hiển thị cho người thuê' : 'Ẩn khỏi người thuê'}
                            </span>
                          </span>
                          <span
                            className={`h-2.5 w-2.5 shrink-0 rounded-full ${method.enabled ? 'bg-[#7bbf4b]' : 'bg-[#c8c1d0]'}`}
                            title={method.enabled ? 'Người thuê có thể dùng để chuyển khoản' : 'Người thuê không thấy phương thức này'}
                          />
                        </span>
                        </button>
                      </Reorder.Item>
                    );
                  })}
                </Reorder.Group>

                <div className="mt-3 grid gap-2">
                  <label className="dashboard-action-button cursor-pointer justify-center">
                    <input
                      type="checkbox"
                      checked={activePaymentMethod.enabled}
                      onChange={(event) => updatePaymentMethod(activePaymentMethod.id, { enabled: event.target.checked })}
                      className="h-4 w-4 accent-[#ff6c9e]"
                    />
                    Hiển thị cho người thuê để chuyển khoản
                  </label>
                  <button type="button" onClick={() => handleSetDefaultMethod(activePaymentMethod.id)} className="dashboard-action-button justify-center">
                    <Star className="h-4 w-4" />
                    Đặt làm tài khoản mặc định
                  </button>
                  <button type="button" onClick={() => confirmRemovePaymentMethod(activePaymentMethod.id)} className="dashboard-action-button justify-center">
                    <Trash2 className="h-4 w-4" />
                    Xóa tài khoản
                  </button>
                </div>
              </div>
            </div>
          ) : null}
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
      <ConfirmDeleteDialog />
    </div>
  );
};

export default DebtDetailsPage;
