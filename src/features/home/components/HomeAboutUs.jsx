import { motion } from 'framer-motion';
import { Code2, Heart, Megaphone, Users } from 'lucide-react';

const TEAM_GROUPS = [
  {
    title: 'Marketing',
    icon: Megaphone,
    tone: 'pink',
    members: [
      {
        name: 'Nguyễn Thành Vinh',
        role: 'Marketing Executive',
        bio: 'Phụ trách các hoạt động marketing của dự án Rental Management, tập trung vào nghiên cứu thị trường, xây dựng chiến lược truyền thông và quảng bá sản phẩm nhằm tiếp cận khách hàng mục tiêu một cách hiệu quả.',
        tone: 'violet',
      },
      {
        name: 'Nguyễn Ngọc Diễm',
        role: 'Marketing Executive',
        bio: 'Tham gia xây dựng nội dung truyền thông và phát triển hình ảnh thương hiệu cho dự án. Luôn hướng đến việc giúp Rental Management tiếp cận nhiều người dùng hơn và tạo dựng sự tin tưởng từ khách hàng.',
        tone: 'pink',
      },
      {
        name: 'Nguyễn Danh Khoa',
        role: 'Marketing Executive',
        bio: 'Đảm nhiệm nghiên cứu nhu cầu khách hàng và hỗ trợ triển khai các chiến dịch marketing. Mong muốn góp phần đưa sản phẩm đến gần hơn với thị trường và người dùng thực tế.',
        tone: 'lime',
      },
      {
        name: 'Ngô Văn Hoàng',
        role: 'Marketing Executive',
        bio: 'Tham gia các hoạt động marketing và phát triển thương hiệu của dự án. Công việc bao gồm phân tích thị trường, hỗ trợ truyền thông và đóng góp các ý tưởng nhằm nâng cao giá trị sản phẩm.',
        tone: 'violet',
      },
    ],
  },
  {
    title: 'Phát triển phần mềm',
    icon: Code2,
    tone: 'lime',
    members: [
      {
        name: 'Nguyễn Minh Hoàng',
        role: 'Full Stack Developer',
        bio: 'Phụ trách phát triển các chức năng hệ thống, xây dựng cơ sở dữ liệu và tối ưu hiệu năng ứng dụng. Luôn hướng đến việc tạo ra một nền tảng ổn định, bảo mật và dễ mở rộng để đáp ứng nhu cầu quản lý cho thuê hiện đại.',
        tone: 'lime',
      },
      {
        name: 'Dương Quang Minh',
        role: 'Full Stack Developer',
        bio: 'Sinh viên ngành Công nghệ Thông tin với niềm đam mê phát triển phần mềm và xây dựng các giải pháp công nghệ thực tiễn. Tham gia thiết kế cơ sở dữ liệu, phát triển backend, xây dựng giao diện người dùng và triển khai các chức năng nghiệp vụ. Mong muốn mang đến một hệ thống quản lý cho thuê thông minh, hiệu quả và thân thiện với người dùng.',
        tone: 'violet',
      },
    ],
  },
];

const getInitials = (name) => {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0]?.slice(0, 2).toUpperCase() || '';
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
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
            Chúng tôi là nhóm sinh viên đam mê công nghệ, cùng nhau xây dựng giải pháp Rental
            Management giúp chủ trọ Việt Nam quản lý phòng trọ dễ dàng và hiệu quả hơn. Dự án được
            phát triển trong khuôn khổ môn học thực tập doanh nghiệp (EXE).
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {[
            { label: 'Tầm nhìn', text: 'Trở thành nền tảng quản lý trọ hàng đầu cho chủ trọ Việt Nam.' },
            { label: 'Giá trị', text: 'Đơn giản, minh bạch, tiết kiệm thời gian — công nghệ phục vụ con người.' },
            { label: 'Cam kết', text: 'Liên tục cải tiến tính năng dựa trên phản hồi thực tế từ người dùng.' },
          ].map((pillar) => (
            <div
              key={pillar.label}
              className="home-about-pillar rounded-2xl border border-hairline-cloud bg-white p-5 text-center"
            >
              <p className="eyebrow text-accent-violet">{pillar.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{pillar.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 space-y-14">
          {TEAM_GROUPS.map((group) => (
            <div key={group.title}>
              <div className="mb-8 flex items-center gap-3">
                <span className={`home-team-group-icon home-team-group-icon--${group.tone}`}>
                  <group.icon size={20} />
                </span>
                <h3 className="font-display text-xl font-bold text-ink-deep">{group.title}</h3>
              </div>

              <motion.div
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-40px' }}
                className={`grid gap-5 ${group.members.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2'}`}
              >
                {group.members.map((member) => (
                  <motion.article
                    key={member.name}
                    variants={item}
                    className="home-team-card home-team-card--detailed"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`home-team-avatar home-team-avatar--${member.tone} shrink-0`}>
                        <span className="font-display text-lg font-bold">{getInitials(member.name)}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-display text-lg font-bold text-ink-deep">{member.name}</h4>
                        <span className={`home-team-role home-team-role--${member.tone}`}>
                          {member.role}
                        </span>
                        <p className="mt-3 text-sm leading-relaxed text-muted">{member.bio}</p>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            </div>
          ))}
        </div>

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
