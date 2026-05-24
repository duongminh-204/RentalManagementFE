import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const tones = {
  neutral: {
    card: 'border-hairline-cloud bg-surface-light',
    icon: 'bg-surface-press text-accent-violet',
    badge: 'bg-surface-press text-ink-deep',
  },
  success: {
    card: 'border-[#cfe7be] bg-[#f8fff0]',
    icon: 'bg-[#e7f6d5] text-[#4d7a14]',
    badge: 'bg-[#e7f6d5] text-[#4d7a14]',
  },
  warning: {
    card: 'border-[#f0d6a8] bg-[#fff9ee]',
    icon: 'bg-[#ffefcf] text-[#9a5a00]',
    badge: 'bg-[#ffefcf] text-[#9a5a00]',
  },
  danger: {
    card: 'border-[#f3c3d3] bg-[#fff5f8]',
    icon: 'bg-[#ffe0ea] text-[#b33f69]',
    badge: 'bg-[#ffe0ea] text-[#b33f69]',
  },
  dark: {
    card: 'border-hairline-violet bg-ink-deep text-on-primary',
    icon: 'bg-on-dark-faint text-accent-lime',
    badge: 'bg-on-dark-faint text-on-primary',
  },
};

const StatCard = ({ title, value, icon: Icon, tone = 'neutral', badge, to }) => {
  const palette = tones[tone] || tones.neutral;
  const isDark = tone === 'dark';
  const cardClassName = `dashboard-stat-card ${palette.card}${to ? ' dashboard-stat-card--link' : ''}`;
  const content = (
    <>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className={`text-sm font-semibold ${isDark ? 'text-on-dark-muted' : 'text-muted'}`}>
            {title}
          </p>
          <p
            className={`mt-3 text-3xl font-bold leading-none sm:text-4xl ${isDark ? 'text-on-primary' : 'text-ink-deep'}`}
          >
            {value}
          </p>
        </div>
        <div className={`rounded-2xl p-3 ${palette.icon}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        {badge ? (
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${palette.badge}`}>{badge}</span>
        ) : (
          <span />
        )}

        {to ? (
          <span className={`inline-flex items-center gap-1 text-xs font-bold ${isDark ? 'text-on-primary' : 'text-accent-violet-deep'}`}>
            Xem chi tiết
            <ArrowRight className="h-4 w-4" />
          </span>
        ) : null}
      </div>
    </>
  );

  if (to) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <Link to={to} className={cardClassName}>
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={cardClassName}
    >
      {content}
    </motion.article>
  );
};

export default StatCard;
