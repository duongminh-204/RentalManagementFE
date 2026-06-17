import { motion } from 'framer-motion';

export default function AuthIllustration({ title, highlight, icon = '🏠', logoSrc }) {
    return (
        <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="hidden flex-col items-center justify-center text-on-primary md:flex"
        >
            <p className="eyebrow mb-4 text-on-dark-muted">Trọ EZ</p>
            <h1 className="font-display text-center text-5xl font-bold leading-[1.1] lg:text-6xl">
                {title}{' '}
                {highlight && <span className="chip-lime">{highlight}</span>}
            </h1>
            <p className="mt-6 max-w-sm text-center text-base leading-loose text-on-dark-muted">
                Theo dõi phòng, khách thuê, hợp đồng và doanh thu — tất cả trên một bảng điều khiển gọn gàng.
            </p>
            {logoSrc ? (
                <motion.img
                    src={logoSrc}
                    alt="Trọ EZ"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                    className="mt-12 w-full max-w-xs object-contain drop-shadow-lg"
                />
            ) : (
                <motion.div
                    animate={{ rotate: [0, 8, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 6 }}
                    className="mt-16 text-[140px] opacity-25"
                    aria-hidden
                >
                    {icon}
                </motion.div>
            )}
        </motion.div>
    );
}
