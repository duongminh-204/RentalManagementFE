import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import AuthIllustration from '../components/AuthIllustration';
import authApi from '../api/authApi';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState('request'); // 'request' | 'reset'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!email.trim()) {
      setError('Vui lòng nhập email.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email.trim());
      setInfo(res?.message || 'Mã OTP đã được gửi tới email của bạn (hiệu lực 5 phút).');
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không gửi được mã OTP. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!otp.trim() || !newPassword) {
      setError('Vui lòng nhập mã OTP và mật khẩu mới.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Xác nhận mật khẩu không khớp.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.resetPassword({ email: email.trim(), otp: otp.trim(), newPassword });
      setInfo(res?.message || 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập.');
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-canvas flex min-h-screen items-center justify-center p-4">
      <div className="relative z-10 grid w-full max-w-5xl items-center gap-10 md:grid-cols-2">
        <AuthIllustration title="Quên mật khẩu" highlight="Quên mật khẩu" icon="🔑" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card-light w-full p-8 md:p-10"
        >
          <div className="mb-8 text-center">
            <p className="eyebrow mb-2 text-accent-violet-mid">Khôi phục tài khoản</p>
            <h2 className="font-display text-2xl font-semibold text-ink-deep">
              {step === 'request' ? 'Quên mật khẩu' : 'Đặt lại mật khẩu'}
            </h2>
          </div>

          {error && (
            <div className="mb-6 rounded-md border border-accent-pink/40 bg-accent-pink/10 px-4 py-3 text-sm text-ink-deep">
              {error}
            </div>
          )}
          {info && (
            <div className="mb-6 rounded-md border border-accent-lime/40 bg-accent-lime/10 px-4 py-3 text-sm text-ink-deep">
              {info}
            </div>
          )}

          {step === 'request' ? (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div>
                <label className="mb-1 block text-left text-sm font-medium text-ink-deep">Email</label>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-input"
                  placeholder="email@example.com"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
                {!loading && <Mail size={18} />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="mb-1 block text-left text-sm font-medium text-ink-deep">Mã OTP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="text-input tracking-[0.4em]"
                  placeholder="6 chữ số"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-left text-sm font-medium text-ink-deep">Mật khẩu mới</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="text-input pr-12"
                    placeholder="Tối thiểu 6 ký tự"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-left text-sm font-medium text-ink-deep">Xác nhận mật khẩu mới</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="text-input"
                  placeholder="Nhập lại mật khẩu mới"
                  required
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                {!loading && <KeyRound size={18} />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('request');
                  setError('');
                  setInfo('');
                }}
                className="flex w-full items-center justify-center gap-2 text-sm font-medium text-muted hover:text-ink-deep"
              >
                <ShieldCheck size={16} />
                Gửi lại mã OTP
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-muted">
            <Link to="/login" className="inline-flex items-center gap-1 font-semibold text-ink-deep underline underline-offset-2">
              <ArrowLeft size={16} />
              Quay lại đăng nhập
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
