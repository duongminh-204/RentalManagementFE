import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn } from 'lucide-react';
 import { useLogin } from '../hooks/useLogin';

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ phoneOrEmail: '', password: '' });
    const { login, loading, error } = useLogin();

    const handleSubmit = (e) => {
        e.preventDefault();
        login(formData.phoneOrEmail, formData.password);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card-light w-full p-5 sm:p-8 md:p-10"
        >
            <div className="mb-8 text-center">
                <p className="eyebrow mb-2 text-accent-violet-mid">Chào mừng trở lại</p>
                <h2 className="font-display text-2xl font-semibold text-ink-deep">Đăng nhập</h2>
            </div>

            {error && (
                <div className="mb-6 rounded-md border border-accent-pink/40 bg-accent-pink/10 px-4 py-3 text-sm text-ink-deep">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="mb-1 block text-left text-sm font-medium text-ink-deep">
                        Số điện thoại hoặc Email
                    </label>
                    <input
                        type="text"
                        autoComplete="email"
                        value={formData.phoneOrEmail}
                        onChange={(e) => setFormData({ ...formData, phoneOrEmail: e.target.value })}
                        className="text-input"
                        placeholder="email@example.com"
                        required
                    />
                </div>

                <div>
                    <label className="mb-1 block text-left text-sm font-medium text-ink-deep">Mật khẩu</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="text-input pr-12"
                            placeholder="Nhập mật khẩu"
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

                <div className="text-sm">
                    <Link to="/forgot-password" className="underline underline-offset-2">
                        Quên mật khẩu?
                    </Link>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    {!loading && <LogIn size={18} />}
                </button>
            </form>

            <p className="mt-8 text-center text-sm text-muted">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="font-semibold text-ink-deep underline underline-offset-2">
                    Đăng ký ngay
                </Link>
            </p>
        </motion.div>
    );
}
