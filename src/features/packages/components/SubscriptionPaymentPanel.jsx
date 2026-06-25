import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Copy, LoaderCircle, QrCode } from 'lucide-react';
import { getPaymentCheckout, simulateSubscriptionPayment } from '../api/subscriptionsApi';
import { buildSubscriptionVietQrImageUrl } from '../../../utils/vietqr';

const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export default function SubscriptionPaymentPanel({ onCheckoutLoaded }) {
  const [checkout, setCheckout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState('');
  const [simulating, setSimulating] = useState(false);

  const isDev = import.meta.env.DEV;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    getPaymentCheckout()
      .then((data) => {
        if (cancelled) return;
        setCheckout(data);
        onCheckoutLoaded?.(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.response?.data?.message || 'Không thể tải thông tin thanh toán.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [onCheckoutLoaded]);

  const qrImageUrl = useMemo(() => buildSubscriptionVietQrImageUrl(checkout), [checkout]);

  const handleCopy = async (field, value) => {
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center py-10">
        <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted">Đang tải mã VietQR...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-[#f5c2c7] bg-[#fff6f7] px-4 py-3 text-sm text-[#b4234a]">
        {error}
      </div>
    );
  }

  if (!checkout) return null;

  if (!checkout.isPaymentConfigured) {
    return (
      <div className="subscription-payment-panel__notice">
        <AlertCircle className="h-5 w-5 shrink-0 text-[#b26a00]" />
        <p className="text-sm leading-6 text-muted">
          Admin chưa cấu hình tài khoản nhận tiền. Vui lòng liên hệ quản trị viên hoặc thử lại sau.
        </p>
      </div>
    );
  }

  return (
    <div className="subscription-payment-panel">
      <div className="subscription-payment-panel__header">
        <QrCode className="h-5 w-5 text-accent-violet" />
        <div>
          <p className="text-sm font-semibold text-ink-deep">Thanh toán VietQR</p>
          <p className="text-xs text-muted">
            Quét mã bằng app ngân hàng — số tiền và nội dung chuyển khoản sẽ tự điền.
          </p>
        </div>
      </div>

      <div className="subscription-payment-panel__body">
        <div className="subscription-payment-panel__qr">
          {qrImageUrl ? (
            <img src={qrImageUrl} alt="VietQR thanh toán gói dịch vụ" className="h-56 w-56 object-contain" />
          ) : (
            <div className="flex h-56 w-56 items-center justify-center rounded-xl bg-surface-press text-sm text-muted">
              Không tạo được mã QR
            </div>
          )}
          <p className="mt-3 text-center text-xs text-muted">
            {checkout.bankName} · {checkout.accountNumber}
          </p>
        </div>

        <div className="subscription-payment-panel__details">
          <div className="subscription-payment-panel__row">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Gói</span>
            <strong className="text-ink-deep">{checkout.packageName}</strong>
          </div>
          <div className="subscription-payment-panel__row">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Số tiền</span>
            <button
              type="button"
              className="subscription-payment-panel__copyable"
              onClick={() => handleCopy('amount', String(checkout.amount))}
            >
              <strong className="text-lg text-accent-violet">{formatPrice(checkout.amount)}</strong>
              <Copy className="h-3.5 w-3.5" />
              {copiedField === 'amount' ? <span className="text-xs text-[#1f7a45]">Đã copy</span> : null}
            </button>
          </div>
          <div className="subscription-payment-panel__row">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Nội dung CK</span>
            <button
              type="button"
              className="subscription-payment-panel__copyable"
              onClick={() => handleCopy('content', checkout.transferContent)}
            >
              <code className="text-sm text-ink-deep">{checkout.transferContent}</code>
              <Copy className="h-3.5 w-3.5 shrink-0" />
              {copiedField === 'content' ? <span className="text-xs text-[#1f7a45]">Đã copy</span> : null}
            </button>
          </div>
          <div className="subscription-payment-panel__row">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Chủ TK</span>
            <span className="text-sm text-ink-deep">{checkout.accountName}</span>
          </div>
          <div className="subscription-payment-panel__row">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">Mã đơn</span>
            <span className="font-mono text-sm text-ink-deep">{checkout.paymentReference}</span>
          </div>
        </div>
      </div>

      <p className="subscription-payment-panel__hint">
        Sau khi chuyển khoản thành công, hệ thống tự kích hoạt gói trong vài giây. Không cần bấm xác nhận thủ công.
      </p>

      {isDev ? (
        <button
          type="button"
          className="dashboard-action-button mt-3 text-xs"
          disabled={simulating}
          onClick={async () => {
            try {
              setSimulating(true);
              await simulateSubscriptionPayment();
              window.location.reload();
            } catch {
              setError('Mô phỏng thanh toán thất bại. Kiểm tra backend đang chạy và AllowDevSimulate = true.');
            } finally {
              setSimulating(false);
            }
          }}
        >
          {simulating ? 'Đang mô phỏng...' : '[Dev] Mô phỏng thanh toán thành công'}
        </button>
      ) : null}
    </div>
  );
}
