import { useEffect, useMemo, useState } from 'react';
import { useRooms } from '../../rooms/hooks/useRooms';
import { getStoredUser } from '../../../hooks/useAuth';
import { formatCurrency } from '../../rooms/utils/roomHelpers';
import * as invoicesApi from '../api/invoicesApi';

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
    if (status === 'Paid') return 'bg-emerald-100 text-emerald-700';
    if (status === 'Overdue') return 'bg-rose-100 text-rose-700';
    return 'bg-surface-light text-ink-deep';
  };

  const formatDate = (value) => (value ? new Date(value).toLocaleDateString('vi-VN') : '—');

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
      setSuccessMessage('Hoá đơn đã được tạo thành công. Kết quả đã được lưu và hiển thị bên dưới.');
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
    <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-10 rounded-[2rem] bg-white p-8 shadow-[var(--shadow-card)]">
        <div className="mb-8 max-w-3xl space-y-4">
          <span className="inline-flex rounded-full bg-primary/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-primary">
            Hoá đơn
          </span>
          <div className="space-y-3">
            <h1 className="text-4xl font-semibold tracking-tight text-ink-deep">Quản lý và lập hoá đơn</h1>
            <p className="text-sm leading-7 text-muted">
              Nhập chỉ số điện và nước mới để hệ thống tự động tính chi tiết phòng, điện, nước, dịch vụ và tổng hoá đơn. Xem trước ngay kết quả, thay đổi phí và theo dõi lịch sử hoá đơn trong cùng một trang.
            </p>
          </div>
        </div>

        <form className="grid gap-6 lg:grid-cols-[1.8fr_1.2fr]" onSubmit={handleSubmit}>
          <div className="space-y-6 rounded-[1.75rem] bg-surface-light p-6 shadow-sm">
            <div className="rounded-[1.5rem] bg-white p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-accent-violet-mid">Chi tiết hoá đơn</p>
                  <h2 className="mt-3 text-2xl font-semibold text-ink-deep">Thông tin và chỉ số</h2>
                </div>
                <div className="rounded-3xl bg-surface-light px-4 py-3 text-sm font-medium text-ink-deep">
                  {selectedRoom ? selectedRoom.roomName || selectedRoom.roomNumber : 'Chưa chọn phòng'}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-ink-deep">Chọn phòng</span>
                <select
                  name="roomId"
                  value={formData.roomId}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-hairline-cloud bg-white px-4 py-3 text-sm text-ink-deep shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                >
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.roomName || room.roomNumber} {room.status ? `(${room.status})` : ''}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-ink-deep">Kỳ hoá đơn</span>
                <input
                  type="month"
                  name="monthYear"
                  value={formData.monthYear}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-hairline-cloud bg-white px-4 py-3 text-sm text-ink-deep shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-ink-deep">Điện đầu kỳ</span>
                <input
                  type="number"
                  min="0"
                  name="electricNumberBf"
                  value={formData.electricNumberBf}
                  onChange={handleChange}
                  placeholder="Số đầu kỳ"
                  className="w-full rounded-2xl border border-hairline-cloud bg-white px-4 py-3 text-sm text-ink-deep shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-ink-deep">Điện cuối kỳ</span>
                <input
                  type="number"
                  min="0"
                  name="electricNumberAt"
                  value={formData.electricNumberAt}
                  onChange={handleChange}
                  placeholder="Số cuối kỳ"
                  className="w-full rounded-2xl border border-hairline-cloud bg-white px-4 py-3 text-sm text-ink-deep shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-ink-deep">Nước đầu kỳ</span>
                <input
                  type="number"
                  min="0"
                  name="waterNumberBf"
                  value={formData.waterNumberBf}
                  onChange={handleChange}
                  placeholder="Số đầu kỳ"
                  className="w-full rounded-2xl border border-hairline-cloud bg-white px-4 py-3 text-sm text-ink-deep shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-ink-deep">Nước cuối kỳ</span>
                <input
                  type="number"
                  min="0"
                  name="waterNumberAt"
                  value={formData.waterNumberAt}
                  onChange={handleChange}
                  placeholder="Số cuối kỳ"
                  className="w-full rounded-2xl border border-hairline-cloud bg-white px-4 py-3 text-sm text-ink-deep shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-ink-deep">Phí khác</span>
                <input
                  type="number"
                  min="0"
                  name="otherFee"
                  value={formData.otherFee}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-hairline-cloud bg-white px-4 py-3 text-sm text-ink-deep shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-ink-deep">Giảm giá</span>
                <input
                  type="number"
                  min="0"
                  name="discountAmount"
                  value={formData.discountAmount}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-hairline-cloud bg-white px-4 py-3 text-sm text-ink-deep shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-ink-deep">Phí bãi xe (nếu cần)</span>
                <input
                  type="number"
                  min="0"
                  name="parkingFeeOverride"
                  value={formData.parkingFeeOverride}
                  onChange={handleChange}
                  placeholder="Bỏ trống nếu tính tự động"
                  className="w-full rounded-2xl border border-hairline-cloud bg-white px-4 py-3 text-sm text-ink-deep shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-ink-deep">Ghi chú</span>
                <input
                  type="text"
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Ví dụ: Khách thuê đổi công tơ"
                  className="w-full rounded-2xl border border-hairline-cloud bg-white px-4 py-3 text-sm text-ink-deep shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </label>
            </div>

            {roomsError && (
              <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{roomsError}</div>
            )}

            {error && (
              <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
            )}
            {successMessage && (
              <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">
                {successMessage}
              </div>
            )}

            <div className="flex flex-col gap-4 rounded-[1.5rem] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-muted">Xem trước tổng hoá đơn</p>
                <p className="mt-1 text-3xl font-semibold text-ink-deep">{formatCurrency(previewTotal)}</p>
              </div>
              <button
                type="submit"
                disabled={loading || roomsLoading}
                className="inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Đang lập hoá đơn...' : 'Lập hoá đơn tự động'}
              </button>
            </div>
          </div>

          <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-4 lg:items-start">
            <div className="rounded-[1.75rem] border border-hairline-cloud bg-white p-6 shadow-sm lg:col-span-2">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-ink-deep">Đơn giá phòng</h2>
                  <p className="text-sm text-muted">Xem nhanh giá phòng, điện, nước và phí dịch vụ.</p>
                </div>
                <span className="rounded-full bg-surface-light px-3 py-1 text-sm font-medium text-muted">Dữ liệu theo phòng</span>
              </div>
              {selectedRoom ? (
                <dl className="grid gap-4 text-sm text-ink-deep sm:grid-cols-2">
                  <div>
                    <dt className="font-medium">Phòng</dt>
                    <dd>{selectedRoom.roomName || selectedRoom.roomNumber}</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Tiền phòng</dt>
                    <dd>{formatCurrency(roomFee)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Giá điện</dt>
                    <dd>{formatCurrency(electricPrice)}/kWh</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Giá nước</dt>
                    <dd>{formatCurrency(waterPrice)}/m³</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="font-medium">Dịch vụ thêm</dt>
                    <dd>{formatCurrency(serviceFee)}</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-sm text-muted">Vui lòng chọn phòng để hiển thị đơn giá chi tiết.</p>
              )}
            </div>

            <div className="rounded-[1.75rem] border border-hairline-cloud bg-white p-6 shadow-sm lg:col-span-1">
              <h2 className="mb-4 text-lg font-semibold text-ink-deep">Tóm tắt chỉ số</h2>
              <div className="grid gap-4 text-sm text-ink-deep sm:grid-cols-2">
                <div className="rounded-3xl bg-surface-light p-4">
                  <p className="font-medium text-muted">Tiêu thụ điện</p>
                  <p className="mt-2 text-lg font-semibold">{electricConsumed} kWh</p>
                </div>
                <div className="rounded-3xl bg-surface-light p-4">
                  <p className="font-medium text-muted">Tiêu thụ nước</p>
                  <p className="mt-2 text-lg font-semibold">{waterConsumed} m³</p>
                </div>
                <div className="rounded-3xl bg-surface-light p-4">
                  <p className="font-medium text-muted">Tiền điện</p>
                  <p className="mt-2 text-lg font-semibold">{formatCurrency(previewElectricFee)}</p>
                </div>
                <div className="rounded-3xl bg-surface-light p-4">
                  <p className="font-medium text-muted">Tiền nước</p>
                  <p className="mt-2 text-lg font-semibold">{formatCurrency(previewWaterFee)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-hairline-cloud bg-white p-6 shadow-sm lg:col-span-1">
              <h2 className="text-lg font-semibold text-ink-deep">Lưu ý khi tạo hoá đơn</h2>
              <p className="mt-3 text-sm leading-7 text-muted">
                Kết quả hiển thị là bản tính toán nhanh, hệ thống sẽ đối chiếu lại khi lưu hoá đơn. Nếu cần, bạn có thể ghi đè phí bãi xe để đảm bảo số liệu chính xác.
              </p>
            </div>
          </div>
          </div>
        </form>

        <section className="rounded-[2rem] border border-hairline-cloud bg-white p-8 shadow-[var(--shadow-card)]">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-accent-violet-mid">Lịch sử hoá đơn</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink-deep">Theo dõi hoá đơn và lọc nhanh</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Tìm hoá đơn theo người thuê, phòng, kỳ hoá đơn hoặc trạng thái thanh toán.
              </p>
            </div>
            <div className="rounded-3xl bg-surface-light px-4 py-3 text-sm font-medium text-ink-deep">
              Tổng: {invoiceHistory.length} hoá đơn
            </div>
          </div>

          <form className="grid gap-4 lg:grid-cols-[1.5fr_1fr]" onSubmit={handleHistorySearch}>
            <div className="space-y-4 rounded-3xl bg-surface-light p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-ink-deep">Tìm nhanh</span>
                  <input
                    type="search"
                    name="search"
                    value={historyFilters.search}
                    onChange={handleHistoryFilterChange}
                    placeholder="Tên người thuê, mã hoá đơn, phòng..."
                    className="w-full rounded-2xl border border-hairline-cloud bg-white px-4 py-3 text-sm text-ink-deep shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-ink-deep">Người thuê</span>
                  <input
                    type="text"
                    name="tenantName"
                    value={historyFilters.tenantName}
                    onChange={handleHistoryFilterChange}
                    placeholder="Tên khách thuê"
                    className="w-full rounded-2xl border border-hairline-cloud bg-white px-4 py-3 text-sm text-ink-deep shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-ink-deep">Phòng</span>
                  <select
                    name="roomId"
                    value={historyFilters.roomId}
                    onChange={handleHistoryFilterChange}
                    className="w-full rounded-2xl border border-hairline-cloud bg-white px-4 py-3 text-sm text-ink-deep shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="">Tất cả phòng</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.roomName || room.roomNumber}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-ink-deep">Trạng thái</span>
                  <select
                    name="status"
                    value={historyFilters.status}
                    onChange={handleHistoryFilterChange}
                    className="w-full rounded-2xl border border-hairline-cloud bg-white px-4 py-3 text-sm text-ink-deep shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  >
                    <option value="">Tất cả</option>
                    <option value="Unpaid">Chưa thanh toán</option>
                    <option value="Paid">Đã thanh toán</option>
                    <option value="Overdue">Quá hạn</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="space-y-4 rounded-3xl bg-surface-light p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-ink-deep">Kỳ bắt đầu</span>
                  <input
                    type="month"
                    name="monthFrom"
                    value={historyFilters.monthFrom}
                    onChange={handleHistoryFilterChange}
                    className="w-full rounded-2xl border border-hairline-cloud bg-white px-4 py-3 text-sm text-ink-deep shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-ink-deep">Kỳ kết thúc</span>
                  <input
                    type="month"
                    name="monthTo"
                    value={historyFilters.monthTo}
                    onChange={handleHistoryFilterChange}
                    className="w-full rounded-2xl border border-hairline-cloud bg-white px-4 py-3 text-sm text-ink-deep shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </label>
              </div>

              {historyError && (
                <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{historyError}</div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={resetHistoryFilters}
                  className="inline-flex items-center justify-center rounded-2xl border border-hairline-cloud bg-white px-4 py-3 text-sm font-semibold text-ink-deep transition hover:bg-surface-press-light"
                >
                  Đặt lại
                </button>
                <button
                  type="submit"
                  disabled={historyLoading}
                  className="inline-flex items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {historyLoading ? 'Đang tìm...' : 'Áp dụng bộ lọc'}
                </button>
              </div>
            </div>
          </form>

          <div className="mt-6 overflow-hidden rounded-3xl border border-hairline-cloud">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-hairline-cloud">
                <thead className="bg-surface-light text-left text-sm uppercase tracking-[0.2em] text-muted">
                  <tr>
                    <th className="px-4 py-3">Mã</th>
                    <th className="px-4 py-3">Phòng</th>
                    <th className="px-4 py-3">Người thuê</th>
                    <th className="px-4 py-3">Kỳ hoá đơn</th>
                    <th className="px-4 py-3">Tổng</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Ngày tạo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline-cloud bg-white">
                  {invoiceHistory.map((historyItem) => (
                    <tr key={historyItem.invoiceId} className="hover:bg-surface-light/60 transition-colors">
                      <td className="px-4 py-4 text-sm font-semibold text-ink-deep">#{historyItem.invoiceId}</td>
                      <td className="px-4 py-4 text-sm text-ink-deep">{historyItem.roomName || '-'}</td>
                      <td className="px-4 py-4 text-sm text-ink-deep">{historyItem.tenantName || '-'}</td>
                      <td className="px-4 py-4 text-sm text-ink-deep">{historyItem.monthYear}</td>
                      <td className="px-4 py-4 text-sm font-semibold text-ink-deep">{formatCurrency(historyItem.totalAmount)}</td>
                      <td className="px-4 py-4 text-sm">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusBadgeClasses(historyItem.status)}`}>
                          {historyItem.status || 'Chưa thanh toán'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted">
                        {historyItem.createdAt ? new Date(historyItem.createdAt).toLocaleDateString('vi-VN') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!historyLoading && invoiceHistory.length === 0 && (
              <div className="border-t border-hairline-cloud bg-surface-light px-4 py-6 text-sm text-muted">
                Không tìm thấy hoá đơn phù hợp với bộ lọc hiện tại.
              </div>
            )}
          </div>
        </section>

        {invoiceResult && (
          <section className="rounded-[2rem] border border-hairline-cloud bg-white p-8 shadow-[var(--shadow-card)]">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-accent-violet-mid">Kết quả hoá đơn</p>
                <h2 className="mt-2 text-3xl font-semibold text-ink-deep">Hoá đơn #{invoiceResult.invoiceId}</h2>
              </div>
              <span className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${getStatusBadgeClasses(invoiceResult.status)}`}>
                {invoiceResult.status || 'Chưa thanh toán'}
              </span>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-muted">Kỳ hoá đơn</p>
                    <p className="text-base font-semibold text-ink-deep">{invoiceResult.monthYear}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted">Ngày đến hạn</p>
                    <p className="text-base font-semibold text-ink-deep">
                      {invoiceResult.dueDate ? new Date(invoiceResult.dueDate).toLocaleDateString('vi-VN') : '—'}
                    </p>
                  </div>
                </div>

                <div className="overflow-hidden rounded-3xl border border-hairline-cloud bg-surface-light p-4">
                  <div className="grid gap-3 text-sm text-ink-deep">
                    <div className="flex items-center justify-between">
                      <span>Tiền phòng</span>
                      <span>{formatCurrency(invoiceResult.roomFee)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tiền điện</span>
                      <span>{formatCurrency(invoiceResult.electricFee)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tiền nước</span>
                      <span>{formatCurrency(invoiceResult.waterFee)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Dịch vụ</span>
                      <span>{formatCurrency(invoiceResult.serviceFee)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Phí bãi xe</span>
                      <span>{formatCurrency(invoiceResult.parkingFee)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Phí khác</span>
                      <span>{formatCurrency(invoiceResult.otherFee)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Giảm giá</span>
                      <span>-{formatCurrency(invoiceResult.discountAmount)}</span>
                    </div>
                    <div className="rounded-3xl bg-surface-light px-4 py-3 text-base font-semibold text-ink-deep">
                      <div className="flex items-center justify-between">
                        <span>Tổng</span>
                        <span>{formatCurrency(invoiceResult.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {invoiceResult.invoiceDetails?.length > 0 && (
                  <div className="overflow-hidden rounded-3xl border border-hairline-cloud">
                    <div className="bg-surface-light px-4 py-3 text-sm font-semibold uppercase tracking-[0.25em] text-muted">
                      Chi tiết hoá đơn
                    </div>
                    <div className="divide-y divide-hairline-cloud">
                      {invoiceResult.invoiceDetails.map((detail) => (
                        <div key={detail.invoiceDetailId} className="grid gap-2 px-4 py-3 sm:grid-cols-[1fr_auto_auto]">
                          <div className="text-sm text-ink-deep">{detail.itemName}</div>
                          <div className="text-sm text-muted">{detail.quantity}</div>
                          <div className="text-right text-sm font-medium text-ink-deep">
                            {formatCurrency(detail.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 rounded-3xl border border-hairline-cloud bg-surface-light p-5 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">Thanh toán nhanh</p>
                {invoiceResult.qrCodeUrl ? (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code?size=240x240&data=${encodeURIComponent(
                      invoiceResult.qrCodeUrl
                    )}`}
                    alt="QR code thanh toán"
                    className="mx-auto rounded-3xl border border-hairline-cloud bg-white p-4"
                  />
                ) : (
                  <div className="rounded-3xl bg-white p-10 text-sm text-muted">Không có mã QR</div>
                )}
                <p className="text-sm text-muted">Quét QR để thanh toán hoá đơn nhanh chóng.</p>
                <a
                  href={invoiceResult.qrCodeUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"
                >
                  Mở liên kết thanh toán
                </a>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default InvoicesPage;
