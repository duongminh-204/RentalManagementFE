import { motion } from 'framer-motion';
import { Heart, Users } from 'lucide-react';

const TEAM_MEMBERS = [
  { name: 'Thành Vinh', role: 'Thành viên nhóm phát triển', tone: 'violet' },
  { name: 'Ngọc Diễm', role: 'Thành viên nhóm phát triển', tone: 'pink' },
  { name: 'Danh Khoa', role: 'Thành viên nhóm phát triển', tone: 'lime' },
  { name: 'Ngô Hoàng', role: 'Thành viên nhóm phát triển', tone: 'violet' },
  { name: 'Minh Hoàng', role: 'Thành viên nhóm phát triển', tone: 'pink' },
  { name: 'Quang Minh', role: 'Thành viên nhóm phát triển', tone: 'lime' },
];

const getInitials = (name) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

export default function HomeAboutUs() {
  return (
    <section id="about-us" className="home-section bg-surface-light px-5 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow mb-4">Về chúng tôi</p>
          <h2 className="font-display text-3xl font-bold text-ink-deep sm:text-4xl">
            Đội ngũ đứng sau{' '}
            <span className="text-accent-violet">Trọ EZ</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            Chúng tôi là nhóm sinh viên đam mê công nghệ, cùng nhau xây dựng giải pháp giúp chủ trọ
            Việt Nam quản lý phòng trọ dễ dàng và hiệu quả hơn mỗi ngày. Dự án được phát triển trong
            khuôn khổ môn học thực tập doanh nghiệp (EXE), kết hợp kiến thức lập trình với nhu cầu vận
            hành thực tế của ngành cho thuê phòng trọ.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {[
            { label: 'Tầm nhìn', text: 'Trở thành nền tảng quản lý trọ hàng đầu cho chủ trọ Việt Nam.' },
            { label: 'Giá trị', text: 'Đơn giản, minh bạch, tiết kiệm thời gian — công nghệ phục vụ con người.' },
            { label: 'Cam kết', text: 'Liên tục cải tiến tính năng dựa trên phản hồi thực tế từ người dùng.' },
          ].map((item) => (
            <div key={item.label} className="home-about-pillar rounded-2xl border border-hairline-cloud bg-white p-5 text-center">
              <p className="eyebrow text-accent-violet">{item.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
            </div>
          ))}
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {TEAM_MEMBERS.map((member) => (
            <motion.article
              key={member.name}
              variants={item}
              className="home-team-card group text-center"
            >
              <div className={`home-team-avatar home-team-avatar--${member.tone}`}>
                <span className="font-display text-xl font-bold">{getInitials(member.name)}</span>
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-ink-deep">{member.name}</h3>
              <p className="mt-1.5 text-sm text-muted">{member.role}</p>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="home-about-callout mx-auto mt-14 flex max-w-3xl flex-col items-center gap-4 rounded-2xl border border-hairline-cloud bg-white px-6 py-8 text-center sm:flex-row sm:text-left"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent-violet/10 text-accent-violet">
            <Users size={24} />
          </div>
          <div className="flex-1">
            <p className="font-display text-lg font-bold text-ink-deep">Sứ mệnh của chúng tôi</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Mang công nghệ đến gần hơn với chủ trọ — đơn giản hóa công việc quản lý, minh bạch hóa
              thu chi và tiết kiệm thời gian vận hành.
            </p>
          </div>
          <Heart size={22} className="hidden shrink-0 text-accent-pink sm:block" aria-hidden />
        </motion.div>
      </div>
    </section>
  );
}
