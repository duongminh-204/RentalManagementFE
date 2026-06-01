import { useEffect, useMemo, useState } from 'react';
import { useRooms } from '../../rooms/hooks/useRooms';
import { getStoredUser } from '../../../hooks/useAuth';
import { formatCurrency } from '../../rooms/utils/roomHelpers';
import * as invoicesApi from '../api/invoicesApi';
import { 
  Zap, 
  Droplet, 
  Search, 
  RefreshCw, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  DollarSign, 
  PlusCircle, 
  CreditCard, 
  ArrowRight, 
  Eye, 
  X,
  Printer,
  ChevronRight,
  TrendingUp,
  Percent,
  MessageSquare,
  Building,
  Info,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getCurrentUserId = (user) => {
  if (!user) return null;
  return (
    user?.userId ||
    user?.id ||
    user?.UserId ||
    user?.Id ||
    user?.tenantId ||
    user?.TenantId ||
    null
  );
};

const formatNumberField = (value) => {
  const number = Number(value);
  return Number.isNaN(number) ? 0 : number;
};

const InvoicesPage = () => {
  const { rooms, loading: roomsLoading, error: roomsError } = useRooms();
  const storedUser = getStoredUser();
  const currentUserId = getCurrentUserId(storedUser);

  const [formData, setFormData] = useState({
    roomId: '',
    monthYear: new Date().toISOString().slice(0, 7),
    electricNumberBf: '',
    electricNumberAt: '',
    waterNumberBf: '',
    waterNumberAt: '',
    otherFee: '0',
    discountAmount: '0',
    parkingFeeOverride: '',
    note: '',
  });
  
  const [invoiceResult, setInvoiceResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [invoiceHistory, setInvoiceHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');
  
  const [historyFilters, setHistoryFilters] = useState({
    search: '',
    tenantName: '',
    roomId: '',
    monthFrom: '',
    monthTo: '',
    status: ''
  });

  const selectedRoom = useMemo(
    () => rooms.find((room) => String(room.id) === String(formData.roomId)),
    [rooms, formData.roomId]
  );

  const electricConsumed = Math.max(
    0,
    formatNumberField(formData.electricNumberAt) - formatNumberField(formData.electricNumberBf)
  );
  const waterConsumed = Math.max(
    0,
    formatNumberField(formData.waterNumberAt) - formatNumberField(formData.waterNumberBf)
  );

  const roomFee = selectedRoom ? formatNumberField(selectedRoom.price) : 0;
  const electricPrice = selectedRoom
    ? formatNumberField(selectedRoom.electricityPrice || selectedRoom.electricPrice)
    : 0;
  const waterPrice = selectedRoom ? formatNumberField(selectedRoom.waterPrice) : 0;
  const serviceFee = selectedRoom
    ? (selectedRoom.roomServices || []).reduce(
        (sum, item) => sum + formatNumberField(item.unitPrice) * formatNumberField(item.quantity),
        0
      )
    : 0;
  const otherFee = formatNumberField(formData.otherFee);
  const discountAmount = formatNumberField(formData.discountAmount);
  const parkingFeeOverride = formData.parkingFeeOverride
    ? formatNumberField(formData.parkingFeeOverride)
    : null;

  const previewElectricFee = electricConsumed * electricPrice;
  const previewWaterFee = waterConsumed * waterPrice;
  const previewTotal = Math.max(
    roomFee + previewElectricFee + previewWaterFee + serviceFee + otherFee - discountAmount,
    0
  );

  const getStatusBadgeClasses = (status) => {
    if (status === 'Paid') return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    if (status === 'Overdue') return 'bg-rose-50 text-rose-700 border border-rose-200';
    return 'bg-amber-50 text-amber-700 border border-amber-200'; // Unpaid
  };

  const getStatusIcon = (status) => {
    if (status === 'Paid') return <CheckCircle className="w-3.5 h-3.5 shrink-0" />;
    if (status === 'Overdue') return <AlertTriangle className="w-3.5 h-3.5 shrink-0" />;
    return <Clock className="w-3.5 h-3.5 shrink-0" />; // Unpaid
  };

  const getStatusLabel = (status) => {
    if (status === 'Paid') return 'Đã thanh toán';
    if (status === 'Overdue') return 'Quá hạn';
    return 'Chưa thanh toán'; // Unpaid
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
    setSuccessMessage('');
  };

  const handleHistoryFilterChange = (event) => {
    const { name, value } = event.target;
    setHistoryFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setHistoryError('');
  };

  const loadInvoiceHistory = async () => {
    setHistoryLoading(true);
    setHistoryError('');

    try {
      const results = await invoicesApi.searchInvoices({
        roomId: historyFilters.roomId || undefined,
        tenantName: historyFilters.tenantName || undefined,
        monthFrom: historyFilters.monthFrom || undefined,
        monthTo: historyFilters.monthTo || undefined,
        status: historyFilters.status || undefined,
        search: historyFilters.search || undefined,
      });
      setInvoiceHistory(results);
    } catch (searchError) {
      console.error('Lỗi khi tải lịch sử hoá đơn:', searchError);
      setHistoryError(
        searchError.response?.data?.message || searchError.message ||
          'Không thể tải lịch sử hoá đơn. Vui lòng thử lại.'
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleHistorySearch = async (event) => {
    event.preventDefault();
    await loadInvoiceHistory();
  };

  const resetHistoryFilters = async () => {
    setHistoryFilters({
      search: '',
      tenantName: '',
      roomId: '',
      monthFrom: '',
      monthTo: '',
      status: ''
    });
    setTimeout(loadInvoiceHistory, 0);
  };

  const handleViewInvoiceDetails = async (historyItem) => {
    setLoading(true);
    setError('');
    try {
      // Try to load the full invoice detail using the API by roomId and monthYear
      const fullInvoice = await invoicesApi.getInvoiceByRoomAndMonth(
        historyItem.roomId || historyItem.RoomId,
        historyItem.monthYear || historyItem.MonthYear
      );
      setInvoiceResult(fullInvoice);
      setSuccessMessage('');
    } catch (err) {
      console.error('Lỗi khi tải chi tiết hoá đơn:', err);
      // Fallback: use historyItem directly
      setInvoiceResult(historyItem);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    setSuccessMessage('');
    setInvoiceResult(null);

    if (!selectedRoom) {
      setError('Vui lòng chọn phòng trước khi lập hoá đơn.');
      setLoading(false);
      return;
    }

    if (formatNumberField(formData.electricNumberAt) < formatNumberField(formData.electricNumberBf)) {
      setError('Số điện cuối kỳ phải lớn hơn hoặc bằng số điện đầu kỳ.');
      setLoading(false);
      return;
    }

    if (formatNumberField(formData.waterNumberAt) < formatNumberField(formData.waterNumberBf)) {
      setError('Số nước cuối kỳ phải lớn hơn hoặc bằng số nước đầu kỳ.');
      setLoading(false);
      return;
    }

    if (!currentUserId) {
      setError('Không thể xác định người dùng hiện tại để tạo hoá đơn. Vui lòng đăng nhập lại.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        roomId: Number(selectedRoom.id),
        userId: Number(currentUserId),
        monthYear: formData.monthYear,
        electricNumberBf: formatNumberField(formData.electricNumberBf),
        electricNumberAt: formatNumberField(formData.electricNumberAt),
        waterNumberBf: formatNumberField(formData.waterNumberBf),
        waterNumberAt: formatNumberField(formData.waterNumberAt),
        otherFee,
        discountAmount,
        parkingFeeOverride,
        note: formData.note,
        forceRecreate: false,
      };

      const invoice = await invoicesApi.createInvoiceFromUtilityUsage(payload);
      setInvoiceResult(invoice);
      setSuccessMessage('Hoá đơn đã được tạo thành công! Chi tiết biên nhận đã sẵn sàng.');
      
      // Auto refresh invoice history list
      loadInvoiceHistory();
    } catch (submitError) {
      console.error('Lỗi khi tạo hoá đơn:', submitError);
      setError(
        submitError.response?.data?.message || submitError.message ||
          'Xảy ra lỗi khi tạo hoá đơn. Vui lòng kiểm tra lại dữ liệu và thử lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoiceHistory();
  }, []);

  return (
    <div className="page-content page-content--wide">
      {/* Title Header Section with Sentri Design styling */}
      <div className="mb-8 overflow-hidden rounded-[2rem] border border-hairline-cloud bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <span className="eyebrow">Hệ Thống Giao Dịch & Dịch Vụ</span>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink-deep font-display">
              Quản lý & Lập <span className="chip-lime">Hóa Đơn</span>
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted font-sans">
              Hệ thống lập hóa đơn tự động nhanh chóng. Nhập số điện nước mới, xem trước đơn giá & hóa đơn ước tính trực quan ở chế độ phân cực Terminal cao cấp và lưu trữ lịch sử hóa đơn bảo mật.
            </p>
          </div>
          
          {/* Floating Quick Stats Widget */}
          <div className="flex gap-4">
            <div className="rounded-2xl border border-hairline-cloud bg-surface-light p-4 shadow-sm min-w-[140px] transition duration-300 hover:translate-y-[-2px] hover:border-accent-violet/30">
              <p className="text-xs uppercase tracking-wider text-muted font-semibold flex items-center gap-1.5">
                <ClipboardList className="w-3.5 h-3.5 text-accent-violet" /> Hóa đơn đã lập
              </p>
              <p className="mt-1 text-2xl font-bold text-ink-deep font-display">{invoiceHistory.length}</p>
            </div>
            <div className="rounded-2xl border border-hairline-cloud bg-surface-light p-4 shadow-sm min-w-[140px] transition duration-300 hover:translate-y-[-2px] hover:border-emerald-300/30">
              <p className="text-xs uppercase tracking-wider text-muted font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Đã thanh toán
              </p>
              <p className="mt-1 text-2xl font-bold text-emerald-600 font-display">
                {invoiceHistory.filter(x => x.status === 'Paid').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Left Column: Form Lập Hóa Đơn */}
        <div className="card-light space-y-6">
          <div className="flex items-center gap-3 border-b border-hairline-cloud pb-4">
            <PlusCircle className="w-6 h-6 text-accent-violet-deep" />
            <div>
              <span className="eyebrow">TẠO GIAO DỊCH MỚI</span>
              <h2 className="text-xl font-semibold text-ink-deep font-display">Nhập Chỉ Số & Tính Toán</h2>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Select Room & Month Period */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-deep flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-accent-violet-mid" /> Chọn phòng thuê
                </span>
                <select
                  name="roomId"
                  value={formData.roomId}
                  onChange={handleChange}
                  className="text-input"
                >
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.roomName || room.roomNumber} {room.status ? `(${room.status})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-deep flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-accent-violet-mid" /> Kỳ hóa đơn
                </span>
                <input
                  type="month"
                  name="monthYear"
                  value={formData.monthYear}
                  onChange={handleChange}
                  className="text-input"
                />
              </div>
            </div>

            {/* Electric Fields */}
            <div className="rounded-2xl border border-hairline-cloud bg-surface-light/40 p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-accent-violet-deep flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500/20" /> Chỉ số điện (kWh)
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted">Số đầu kỳ</label>
                  <input
                    type="number"
                    min="0"
                    name="electricNumberBf"
                    value={formData.electricNumberBf}
                    onChange={handleChange}
                    placeholder="Ví dụ: 1250"
                    className="text-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted">Số cuối kỳ</label>
                  <input
                    type="number"
                    min="0"
                    name="electricNumberAt"
                    value={formData.electricNumberAt}
                    onChange={handleChange}
                    placeholder="Ví dụ: 1420"
                    className="text-input"
                  />
                </div>
              </div>
            </div>

            {/* Water Fields */}
            <div className="rounded-2xl border border-hairline-cloud bg-surface-light/40 p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-accent-violet-deep flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-blue-500 fill-blue-500/20" /> Chỉ số nước (m³)
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted">Số đầu kỳ</label>
                  <input
                    type="number"
                    min="0"
                    name="waterNumberBf"
                    value={formData.waterNumberBf}
                    onChange={handleChange}
                    placeholder="Ví dụ: 310"
                    className="text-input"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted">Số cuối kỳ</label>
                  <input
                    type="number"
                    min="0"
                    name="waterNumberAt"
                    value={formData.waterNumberAt}
                    onChange={handleChange}
                    placeholder="Ví dụ: 325"
                    className="text-input"
                  />
                </div>
              </div>
            </div>

            {/* Fees and Discounts */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-deep flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-accent-violet-mid" /> Phí phát sinh khác
                </span>
                <input
                  type="number"
                  min="0"
                  name="otherFee"
                  value={formData.otherFee}
                  onChange={handleChange}
                  className="text-input"
                />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-deep flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-accent-pink" /> Chiết khấu / Giảm giá
                </span>
                <input
                  type="number"
                  min="0"
                  name="discountAmount"
                  value={formData.discountAmount}
                  onChange={handleChange}
                  className="text-input"
                />
              </div>
            </div>

            {/* Parking and Note */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-deep flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-accent-violet-mid" /> Phí xe máy/ô tô ghi đè
                </span>
                <input
                  type="number"
                  min="0"
                  name="parkingFeeOverride"
                  value={formData.parkingFeeOverride}
                  onChange={handleChange}
                  placeholder="Hệ thống tự tính nếu trống"
                  className="text-input"
                />
              </div>
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-deep flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-accent-violet-mid" /> Ghi chú hóa đơn
                </span>
                <input
                  type="text"
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Ví dụ: Khách đổi công tơ..."
                  className="text-input"
                />
              </div>
            </div>

            {/* Error & Success Messages */}
            {roomsError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {roomsError}
              </div>
            )}
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}
            {successMessage && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" /> {successMessage}
              </div>
            )}

            {/* Interactive Bottom Estimate Display & Primary button */}
            <div className="rounded-2xl border border-hairline-cloud bg-surface-light p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shadow-inner">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Ước tính tổng tiền</span>
                <p className="text-2xl font-bold text-accent-violet-deep font-display">{formatCurrency(previewTotal)}</p>
              </div>
              <button
                type="submit"
                disabled={loading || roomsLoading}
                className="btn-primary min-h-[44px]"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Đang tạo hoá đơn...
                  </>
                ) : (
                  <>
                    Lập hóa đơn ngay <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Real-time Terminal Calculator (card-dark polarity flip) */}
        <div className="card-dark flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between border-b border-hairline-violet pb-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono text-on-dark-muted ml-2">utility_calculator.sh</span>
            </div>
            <span className="text-[10px] font-mono rounded bg-hairline-violet px-2 py-0.5 text-on-dark-muted">v2.4</span>
          </div>

          <div className="flex-1 font-mono text-xs space-y-4">
            <div>
              <span className="text-accent-lime">sentri@rental-node</span>:<span className="text-accent-pink">~/billing</span>$ ./calculate_room_fees.sh
            </div>

            <AnimatePresence mode="wait">
              {!selectedRoom ? (
                <motion.div
                  key="no-selection"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-on-dark-muted space-y-3 py-16 text-center border border-dashed border-hairline-violet/60 rounded-xl"
                >
                  <Info className="w-8 h-8 text-accent-violet-mid mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Chờ chỉ định phòng để tính toán...</p>
                  <p className="text-[10px] text-on-dark-faint max-w-[200px] mx-auto">Vui lòng chọn một phòng thuê ở khung bên trái</p>
                  <span className="inline-block animate-pulse text-accent-lime">_</span>
                </motion.div>
              ) : (
                <motion.div
                  key={selectedRoom.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {/* Selected Room Header info */}
                  <div className="bg-hairline-violet/30 rounded-lg p-3 border border-hairline-violet flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-on-dark-muted uppercase">Phân tích phòng:</span>
                      <p className="text-sm font-bold text-accent-lime font-display mt-0.5">
                        {selectedRoom.roomName || selectedRoom.roomNumber}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-accent-pink text-ink-deep font-sans uppercase">
                      {selectedRoom.status || 'Active'}
                    </span>
                  </div>

                  {/* Consumed details info */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-surface-night p-3 rounded-lg border border-hairline-violet">
                      <div className="flex items-center justify-between text-[10px] text-on-dark-muted">
                        <span>ĐIỆN TIÊU THỤ</span>
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <p className="text-base font-bold text-on-primary mt-1 font-display">{electricConsumed} kWh</p>
                      <div className="mt-1.5 flex justify-between text-[9px] text-on-dark-faint border-t border-hairline-violet/50 pt-1">
                        <span>Trước: {formData.electricNumberBf || 0}</span>
                        <span>Sau: {formData.electricNumberAt || 0}</span>
                      </div>
                    </div>

                    <div className="bg-surface-night p-3 rounded-lg border border-hairline-violet">
                      <div className="flex items-center justify-between text-[10px] text-on-dark-muted">
                        <span>NƯỚC TIÊU THỤ</span>
                        <Droplet className="w-3.5 h-3.5 text-blue-400" />
                      </div>
                      <p className="text-base font-bold text-on-primary mt-1 font-display">{waterConsumed} m³</p>
                      <div className="mt-1.5 flex justify-between text-[9px] text-on-dark-faint border-t border-hairline-violet/50 pt-1">
                        <span>Trước: {formData.waterNumberBf || 0}</span>
                        <span>Sau: {formData.waterNumberAt || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Detailed calculations summary list */}
                  <div className="bg-surface-night/70 rounded-lg p-3 border border-hairline-violet space-y-2 text-[11px] text-on-dark-muted">
                    <p className="text-[10px] text-accent-pink uppercase font-semibold">Nhật ký chi phí chi tiết:</p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span>1. Giá thuê phòng gốc:</span>
                        <span className="text-on-primary font-semibold">{formatCurrency(roomFee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>2. Điện tiêu dùng ({electricConsumed} × {formatCurrency(electricPrice)}):</span>
                        <span className="text-on-primary font-semibold">+{formatCurrency(previewElectricFee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>3. Nước tiêu dùng ({waterConsumed} × {formatCurrency(waterPrice)}):</span>
                        <span className="text-on-primary font-semibold">+{formatCurrency(previewWaterFee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>4. Phí dịch vụ cố định:</span>
                        <span className="text-on-primary font-semibold">+{formatCurrency(serviceFee)}</span>
                      </div>
                      {otherFee > 0 && (
                        <div className="flex justify-between text-amber-300">
                          <span>5. Phí phát sinh khác:</span>
                          <span>+{formatCurrency(otherFee)}</span>
                        </div>
                      )}
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-400">
                          <span>6. Chiết khấu giảm giá:</span>
                          <span>-{formatCurrency(discountAmount)}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-dashed border-hairline-violet/60 my-2 pt-2 flex justify-between text-xs text-accent-lime font-bold">
                      <span>TỔNG TIỀN ƯỚC TÍNH:</span>
                      <span className="text-sm font-display">{formatCurrency(previewTotal)}</span>
                    </div>
                  </div>

                  {/* Dynamic Tip console box */}
                  <div className="text-[10px] text-on-dark-faint leading-relaxed bg-hairline-violet/10 p-2.5 rounded-lg border border-hairline-violet/40">
                    <span className="text-accent-pink">💡 TIP:</span> Bạn có thể đè phí gửi xe hoặc áp chiết khấu ở cột trái, hệ thống tự động sinh QR VietQR trên biên lai cho khách thuê quét trả tiền.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Invoice History Section */}
      <section className="card-light mt-12 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-hairline-cloud pb-4">
          <div className="space-y-1">
            <span className="eyebrow">DỮ LIỆU ĐÃ LƯU TRỮ</span>
            <h2 className="text-2xl font-semibold text-ink-deep font-display">Lịch Sử Hóa Đơn</h2>
            <p className="text-xs text-muted">Tra cứu toàn bộ hóa đơn dịch vụ, xem biên lai thu tiền và QR Code tương ứng.</p>
          </div>
          <div className="rounded-xl border border-hairline-cloud bg-surface-light px-3 py-1.5 text-xs font-semibold text-ink-deep">
            Tổng cộng: {invoiceHistory.length} hóa đơn
          </div>
        </div>

        {/* Filter Controls Form */}
        <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" onSubmit={handleHistorySearch}>
          <div className="space-y-1">
            <label className="text-xs font-bold text-ink-deep">Tìm nhanh</label>
            <div className="relative">
              <input
                type="search"
                name="search"
                value={historyFilters.search}
                onChange={handleHistoryFilterChange}
                placeholder="Khách thuê, mã số..."
                className="text-input pl-9"
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-ink-deep">Chọn phòng</label>
            <select
              name="roomId"
              value={historyFilters.roomId}
              onChange={handleHistoryFilterChange}
              className="text-input"
            >
              <option value="">Tất cả phòng</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.roomName || room.roomNumber}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-ink-deep">Trạng thái</label>
            <select
              name="status"
              value={historyFilters.status}
              onChange={handleHistoryFilterChange}
              className="text-input"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Unpaid">Chưa thanh toán</option>
              <option value="Paid">Đã thanh toán</option>
              <option value="Overdue">Quá hạn</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={resetHistoryFilters}
              className="btn-inverted w-1/2 min-h-[44px]"
            >
              Đặt lại
            </button>
            <button
              type="submit"
              disabled={historyLoading}
              className="btn-primary w-1/2 min-h-[44px]"
            >
              {historyLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                'Áp dụng'
              )}
            </button>
          </div>
        </form>

        {historyError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {historyError}
          </div>
        )}

        {/* History Data Table */}
        <div className="overflow-hidden rounded-2xl border border-hairline-cloud">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-hairline-cloud">
              <thead className="bg-surface-light text-left text-[11px] uppercase tracking-wider text-muted font-bold">
                <tr>
                  <th className="px-6 py-4">Mã số</th>
                  <th className="px-6 py-4">Phòng</th>
                  <th className="px-6 py-4">Người thuê</th>
                  <th className="px-6 py-4">Kỳ hóa đơn</th>
                  <th className="px-6 py-4">Tổng tiền</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4">Ngày tạo</th>
                  <th className="px-6 py-4 text-center">Biên lai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline-cloud bg-white text-sm">
                {invoiceHistory.map((historyItem) => (
                  <tr key={historyItem.invoiceId} className="hover:bg-surface-light/60 transition-colors">
                    <td className="px-6 py-4 font-semibold text-ink-deep">#{historyItem.invoiceId}</td>
                    <td className="px-6 py-4 font-medium text-ink-deep">{historyItem.roomName || '-'}</td>
                    <td className="px-6 py-4 text-ink-deep">{historyItem.tenantName || '-'}</td>
                    <td className="px-6 py-4 text-ink-deep">{historyItem.monthYear}</td>
                    <td className="px-6 py-4 font-bold text-accent-violet-deep">{formatCurrency(historyItem.totalAmount)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClasses(historyItem.status)}`}>
                        {getStatusIcon(historyItem.status)}
                        {getStatusLabel(historyItem.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted">
                      {historyItem.createdAt ? new Date(historyItem.createdAt).toLocaleDateString('vi-VN') : '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewInvoiceDetails(historyItem)}
                        className="btn-inverted !py-1.5 !px-3 text-xs inline-flex items-center gap-1 hover:!border-accent-violet hover:!text-accent-violet transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> Xem
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!historyLoading && invoiceHistory.length === 0 && (
            <div className="bg-surface-light px-6 py-12 text-center text-sm text-muted">
              <Info className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
              Không tìm thấy hoá đơn nào phù hợp với bộ lọc hiện tại.
            </div>
          )}
        </div>
      </section>

      {/* Interactive Beautiful Invoice Modal */}
      <AnimatePresence>
        {invoiceResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-deep/60 backdrop-blur-sm">
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={() => setInvoiceResult(null)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[2.5rem] bg-white shadow-2xl border border-hairline-cloud flex flex-col md:flex-row max-h-[90svh]"
            >
              {/* Left Column: Invoice Details */}
              <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="eyebrow">BIÊN LAI ĐIỆN TỬ</span>
                    <h3 className="text-xl font-bold text-ink-deep font-display">Chi Tiết Hóa Đơn #{invoiceResult.invoiceId}</h3>
                  </div>
                  <button
                    onClick={() => setInvoiceResult(null)}
                    className="rounded-full bg-surface-press p-2 hover:bg-surface-press-strong transition md:hidden"
                  >
                    <X className="w-5 h-5 text-ink-deep" />
                  </button>
                </div>

                {/* Quick info table summary */}
                <div className="grid grid-cols-2 gap-4 bg-surface-light/80 p-4 rounded-2xl border border-hairline-cloud shadow-inner">
                  <div>
                    <p className="text-[10px] text-muted uppercase font-bold tracking-wider">Phòng thuê</p>
                    <p className="text-sm font-bold text-ink-deep mt-0.5">{invoiceResult.roomName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted uppercase font-bold tracking-wider">Khách thuê</p>
                    <p className="text-sm font-bold text-ink-deep mt-0.5">{invoiceResult.tenantName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted uppercase font-bold tracking-wider">Kỳ hóa đơn</p>
                    <p className="text-sm font-medium text-ink-deep mt-0.5">{invoiceResult.monthYear || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted uppercase font-bold tracking-wider">Hạn đóng tiền</p>
                    <p className="text-sm font-medium text-ink-deep mt-0.5 text-accent-pink">
                      {invoiceResult.dueDate ? new Date(invoiceResult.dueDate).toLocaleDateString('vi-VN') : '—'}
                    </p>
                  </div>
                </div>

                {/* Services details lists */}
                <div className="space-y-3">
                  <p className="text-xs uppercase font-bold tracking-wider text-accent-violet-mid">Chi tiết các dịch vụ thu phí</p>
                  <div className="rounded-2xl border border-hairline-cloud overflow-hidden divide-y divide-hairline-cloud bg-white">
                    {invoiceResult.invoiceDetails?.length > 0 ? (
                      invoiceResult.invoiceDetails.map((detail) => (
                        <div key={detail.invoiceDetailId} className="flex justify-between items-center px-4 py-3 text-sm">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-ink-deep">{detail.itemName}</p>
                            {detail.quantity > 1 && (
                              <p className="text-xs text-muted">Số lượng: {detail.quantity}</p>
                            )}
                          </div>
                          <span className="font-bold text-ink-deep">{formatCurrency(detail.amount)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-muted">Không tìm thấy bảng kê chi tiết khoản thu</div>
                    )}
                  </div>
                </div>

                {/* Note summary */}
                {invoiceResult.note && (
                  <div className="rounded-2xl border border-hairline-cloud bg-amber-50/50 p-4 text-xs text-ink-deep flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-amber-800">Ghi chú của người lập:</p>
                      <p className="mt-0.5 text-amber-700">{invoiceResult.note}</p>
                    </div>
                  </div>
                )}

                {/* Final calculated total */}
                <div className="bg-surface-light rounded-2xl p-4 border border-hairline-cloud flex justify-between items-center shadow-sm">
                  <span className="text-sm font-bold text-ink-deep">Tổng tiền hóa đơn:</span>
                  <span className="text-xl font-bold text-accent-violet-deep font-display">
                    {formatCurrency(invoiceResult.totalAmount)}
                  </span>
                </div>

                {/* Footer utility buttons */}
                <div className="flex gap-3 justify-end pt-2 border-t border-hairline-cloud">
                  <button
                    onClick={() => window.print()}
                    className="btn-inverted !py-2 !px-4 text-xs sm:text-sm inline-flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" /> In biên nhận
                  </button>
                  <button
                    onClick={() => setInvoiceResult(null)}
                    className="btn-primary !py-2 !px-4 text-xs sm:text-sm hidden md:inline-flex"
                  >
                    Đóng
                  </button>
                </div>
              </div>

              {/* Right Column: Scan Quick Transfer Code */}
              <div className="w-full md:w-[280px] bg-surface-night p-6 md:p-8 text-center flex flex-col justify-center items-center border-t md:border-t-0 md:border-l border-hairline-violet text-on-primary">
                {/* Desktop Absolute Close X icon */}
                <button
                  onClick={() => setInvoiceResult(null)}
                  className="absolute top-4 right-4 rounded-full bg-hairline-violet/40 p-2 hover:bg-hairline-violet/70 transition hidden md:block text-on-primary"
                >
                  <X className="w-5 h-5" />
                </button>

                <span className="text-[10px] font-mono tracking-widest text-accent-lime uppercase mb-4 block">VIETQR TRANSFER</span>
                
                {invoiceResult.qrCodeUrl ? (
                  <div className="relative group">
                    <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-accent-lime to-accent-pink opacity-50 blur group-hover:opacity-75 transition duration-500" />
                    <div className="relative rounded-3xl bg-white p-3 shadow-xl">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code?size=200x200&data=${encodeURIComponent(
                          invoiceResult.qrCodeUrl
                        )}`}
                        alt="QR code thanh toán"
                        className="w-[170px] h-[170px] mx-auto rounded-xl"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl bg-hairline-violet/20 p-8 text-sm text-on-dark-muted border border-hairline-violet border-dashed w-[190px] h-[190px] flex items-center justify-center">
                    Chưa tạo mã thanh toán QR
                  </div>
                )}

                <p className="text-[11px] text-on-dark-muted mt-5 max-w-[200px] leading-relaxed">
                  Dùng ứng dụng ngân hàng di động hoặc ví Momo/ZaloPay để quét mã QR chuyển khoản nhanh gọn.
                </p>

                {invoiceResult.qrCodeUrl && (
                  <a
                    href={invoiceResult.qrCodeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-inverted !bg-accent-lime !text-ink-deep !border-none w-full mt-6 py-2.5 inline-flex items-center justify-center gap-1.5 hover:!scale-105 transition font-bold"
                  >
                    Link chuyển khoản <ChevronRight className="w-4 h-4" />
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InvoicesPage;