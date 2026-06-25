import { motion } from 'framer-motion';
import { getScoreTone } from '../utils/legalHelpers';

const LegalScoreRing = ({ score = 0, size = 160 }) => {
  const tone = getScoreTone(score);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            className="text-hairline-cloud"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={tone.color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-ink-deep">{score}</span>
          <span className="text-xs font-semibold text-muted">/ 100</span>
        </div>
      </div>
      <span
        className="rounded-full px-3 py-1 text-xs font-bold"
        style={{ backgroundColor: tone.bg, color: tone.color }}
      >
        {tone.label}
      </span>
    </div>
  );
};

export default LegalScoreRing;
