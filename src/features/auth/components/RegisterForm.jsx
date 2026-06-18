import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, Eye, EyeOff, User, UserPlus } from 'lucide-react';
import { useRegister } from '../hooks/useRegister';

const roleOptions = [
    { value: 'Owner', label: 'Chủ trọ', icon: Building2 },
    { value: 'Tenant', label: 'Người thuê trọ', icon: User },
];

export default function RegisterForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        role: 'Owner',
        password: '',
        confirmPassword: ''
    });
    const { register, loading, error } = useRegister();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert('Mật khẩu không khớp!');
            return;
        }
        register({
            fullName: formData.fullName,
            email: formData.email,
            phoneNumber: formData.phone,
            role: formData.role,
            password: formData.password
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card-light w-full p-5 sm:p-8 md:p-10"
        >
            <div className="mb-8 text-center">
                <p className="eyebrow mb-2 text-accent-violet-mid">Tài khoản mới</p>
                <h2 className="font-display text-2xl font-semibold text-ink-deep">Đăng ký</h2>
            </div>

            {error && (
                <div className="mb-6 rounded-md border border-accent-pink/40 bg-accent-pink/10 px-4 py-3 text-sm text-ink-deep">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="mb-1 block text-left text-sm font-medium text-ink-deep">Họ và tên</label>
                    <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="text-input"
                        placeholder="Nhập họ và tên"
                        required
                    />
                </div>

                <div>
                    <label className="mb-2 block text-left text-sm font-medium text-ink-deep">Vai trò</label>
                    <div className="grid grid-cols-2 gap-2 rounded-lg border border-hairline-cloud bg-surface-press p-1">
                        {roleOptions.map((option) => {
                            const Icon = option.icon;
                            const isSelected = formData.role === option.value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: option.value })}
                                    className={`flex min-h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors ${
                                        isSelected
                                            ? 'bg-surface-light text-ink-deep shadow-sm'
                                            : 'text-muted hover:text-ink-deep'
                                    }`}
                                    aria-pressed={isSelected}
                                >
                                    <Icon size={18} />
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-left text-sm font-medium text-ink-deep">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="text-input"
                            placeholder="email@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-left text-sm font-medium text-ink-deep">Số điện thoại</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="text-input"
                            placeholder="03xxxxxxxx"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-1 block text-left text-sm font-medium text-ink-deep">Mật khẩu</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
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

                <div>
                    <label className="mb-1 block text-left text-sm font-medium text-ink-deep">Xác nhận mật khẩu</label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="text-input pr-12"
                            placeholder="Xác nhận mật khẩu"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                        >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                    {!loading && <UserPlus size={18} />}
                </button>
            </form>

            <p className="mt-8 text-center text-sm text-muted">
                Đã có tài khoản?{' '}
                <Link to="/login" className="font-semibold text-ink-deep underline underline-offset-2">
                    Đăng nhập ngay
                </Link>
            </p>
        </motion.div>
    );
}
