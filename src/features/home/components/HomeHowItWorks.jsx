import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  UserPlus,
  Building2,
  Users,
  FileText,
  Calculator,
  QrCode,
  Sparkles,
  Upload,
  Palette,
  Wand2,
  CheckCircle2,
  ImagePlus
} from 'lucide-react';

// Import assets for Flow 1
import l1b1 from '../../../assets/HuongDan/Luong1/buoc1.png';
import l1b2 from '../../../assets/HuongDan/Luong1/buoc2.png';
import l1b3 from '../../../assets/HuongDan/Luong1/buoc3.png';
import l1b4 from '../../../assets/HuongDan/Luong1/buoc4.png';
import l1b5 from '../../../assets/HuongDan/Luong1/buoc5.png';
import l1b6 from '../../../assets/HuongDan/Luong1/buoc6.png';

// Import assets for Flow 2
import l2b1 from '../../../assets/HuongDan/Luong2/buoc1.png';
import l2b2 from '../../../assets/HuongDan/Luong2/buoc2.png';
import l2b3 from '../../../assets/HuongDan/Luong2/buoc3.png';
import l2b4 from '../../../assets/HuongDan/Luong2/buoc4.png';
import l2b5 from '../../../assets/HuongDan/Luong2/buoc5.png';
import l2b6 from '../../../assets/HuongDan/Luong2/buoc6.png';

const FLOW_1_STEPS = [
  {
    icon: UserPlus,
    title: 'Tạo tài khoản chủ trọ',
    description: 'Đăng ký nhanh chóng chỉ với vài bước đơn giản, không cần cài đặt phần mềm phức tạp.',
    img: l1b1,
  },
  {
    icon: Building2,
    title: 'Thiết lập tòa nhà & phòng',
    description: 'Tạo cơ sở kinh doanh, nhập danh sách các phòng trọ cùng đơn giá cho thuê gốc.',
    img: l1b2,
  },
  {
    icon: Users,
    title: 'Nhập thông tin khách thuê',
    description: 'Lưu trữ thông tin liên hệ và hình ảnh CCCD để phục vụ đăng ký tạm trú dễ dàng.',
    img: l1b3,
  },
  {
    icon: FileText,
    title: 'Ký hợp đồng & nhận cọc',
    description: 'Thiết lập thời hạn, giá cọc, đính kèm file hợp đồng đã ký và theo dõi hạn gia hạn.',
    img: l1b4,
  },
  {
    icon: Calculator,
    title: 'Ghi điện nước & tính phí',
    description: 'Nhập chỉ số điện nước cuối tháng để hệ thống tự động cộng dồn với phí dịch vụ khác.',
    img: l1b5,
  },
  {
    icon: QrCode,
    title: 'Tạo VietQR & thu tiền',
    description: 'Xuất hóa đơn PDF và gửi kèm mã VietQR tự động để nhận tiền chuyển khoản chính xác.',
    img: l1b6,
  },
];

const FLOW_2_STEPS = [
  {
    icon: Sparkles,
    title: 'Mở tính năng AI Decor',
    description: 'Truy cập chuyên mục AI Decor ngay trong trang quản trị phòng trọ của bạn.',
    img: l2b1,
  },
  {
    icon: Upload,
    title: 'Tải lên ảnh phòng gốc',
    description: 'Tải lên hình ảnh chụp thực tế hiện trạng của căn phòng trống cần thiết kế.',
    img: l2b2,
  },
  {
    icon: Palette,
    title: 'Chọn phong cách decor',
    description: 'Lựa chọn phong cách mong muốn (Modern, Luxury...) hoặc nhập mô tả tùy chỉnh.',
    img: l2b3,
  },
  {
    icon: Wand2,
    title: 'Chạy AI ComfyUI',
    description: 'Bấm nút chạy để máy chủ AI xử lý dựng mô hình concept thiết kế nội thất mới.',
    img: l2b4,
  },
  {
    icon: CheckCircle2,
    title: 'Xem trước kết quả',
    description: 'Nhận kết quả phòng được bài trí nội thất đẹp mắt nhưng giữ nguyên kết cấu tường cửa.',
    img: l2b5,
  },
  {
    icon: ImagePlus,
    title: 'Lưu ảnh & đăng tin',
    description: 'Lưu trực tiếp concept đẹp mắt này vào phòng để đăng bài tiếp thị thu hút khách thuê.',
    img: l2b6,
  },
];

export default function HomeHowItWorks() {
  const lane1Ref = useRef(null);
  const lane2Ref = useRef(null);
  const [activeIndex1, setActiveIndex1] = useState(0);
  const [activeIndex2, setActiveIndex2] = useState(0);
  const scrollMultiplier = 1.0; // Tốc độ cuộn

  useEffect(() => {
    const setupSmoothScroll = (container, setActiveIndex, stepsLength) => {
      if (!container) return () => {};

      let targetScrollLeft = container.scrollLeft;
      let animationFrameId = null;

      const updateIndex = (scrollLeft) => {
        const scrollWidth = container.scrollWidth - container.clientWidth;
        if (scrollWidth <= 0) return;
        const pct = scrollLeft / scrollWidth;

        // Số bước + 1 thẻ giới thiệu
        const itemIndex = Math.round(pct * stepsLength);
        const activeIdx = Math.max(0, Math.min(stepsLength - 1, itemIndex - 1));
        setActiveIndex(activeIdx);
      };

      // Đồng bộ hóa target khi người dùng cuộn bằng trackpad hoặc kéo bằng chuột
      const handleScrollSync = () => {
        if (!animationFrameId) {
          targetScrollLeft = container.scrollLeft;
        }
        updateIndex(container.scrollLeft);
      };

      const handleWheel = (e) => {
        if (e.deltaY !== 0) {
          e.preventDefault();

          // Tính toán vị trí cuộn đích mong muốn
          const maxScroll = container.scrollWidth - container.clientWidth;
          targetScrollLeft = Math.max(
            0,
            Math.min(maxScroll, targetScrollLeft + e.deltaY * scrollMultiplier)
          );

          // Hàm chuyển động quán tính mượt mà
          const animate = () => {
            const current = container.scrollLeft;
            const diff = targetScrollLeft - current;

            // Nếu khoảng cách còn lại lớn hơn 0.5px thì tiếp tục giảm dần khoảng cách
            if (Math.abs(diff) > 0.5) {
              container.scrollLeft += diff * 0.12; // Hệ số nội suy
              updateIndex(container.scrollLeft);
              animationFrameId = requestAnimationFrame(animate);
            } else {
              container.scrollLeft = targetScrollLeft;
              updateIndex(targetScrollLeft);
              animationFrameId = null;
            }
          };

          if (!animationFrameId) {
            animationFrameId = requestAnimationFrame(animate);
          }
        }
      };

      container.addEventListener('wheel', handleWheel, { passive: false });
      container.addEventListener('scroll', handleScrollSync);

      return () => {
        container.removeEventListener('wheel', handleWheel);
        container.removeEventListener('scroll', handleScrollSync);
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      };
    };

    const cleanup1 = setupSmoothScroll(lane1Ref.current, setActiveIndex1, FLOW_1_STEPS.length);
    const cleanup2 = setupSmoothScroll(lane2Ref.current, setActiveIndex2, FLOW_2_STEPS.length);

    return () => {
      cleanup1();
      cleanup2();
    };
  }, []);

  return (
    <div id="how-it-works" className="select-none">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Luồng 1: Vận hành cốt lõi */}
      <section className="min-h-screen flex flex-col justify-center bg-surface-light px-5 py-16 lg:px-8 overflow-hidden border-b border-hairline-cloud animate-fade-in">
        <div className="mx-auto w-full max-w-7xl">
          
          {/* Header */}
          <div className="mb-8 text-center">
            <span className="text-xs font-bold tracking-widest text-accent-violet bg-accent-violet/10 px-3 py-1 rounded-full uppercase">LUỒNG SỐ 01</span>
            <h2 className="font-display text-3xl font-bold text-ink-deep sm:text-4xl mt-3">
              Quy Trình Vận Hành Cốt Lõi
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed text-muted">
              Giải pháp khép kín giúp chủ trọ quản lý toàn bộ vòng đời thuê nhà từ lúc thiết lập phòng đến khi xuất hóa đơn, thu tiền qua VietQR.
            </p>
          </div>

          {/* Split Screen Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-8 h-auto lg:h-[480px]">
            {/* Left: Big Static Image (1/2 viewport width on desktop) */}
            <div className="lg:col-span-6 w-full h-[280px] sm:h-[350px] lg:h-full relative bg-surface-night rounded-3xl overflow-hidden border border-hairline-cloud shadow-[var(--shadow-card)]">
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent z-10 pointer-events-none" />
              {FLOW_1_STEPS.map((step, idx) => (
                <img
                  key={idx}
                  src={step.img}
                  alt={step.title}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
                    idx === activeIndex1 
                      ? 'opacity-100 scale-100' 
                      : 'opacity-0 scale-95 pointer-events-none'
                  }`}
                />
              ))}
              {/* Step Counter Indicator */}
              <div className="absolute bottom-6 left-6 z-20 bg-primary/80 backdrop-blur-md px-4 py-2 rounded-xl text-white text-xs font-semibold">
                Bước {activeIndex1 + 1} / {FLOW_1_STEPS.length}
              </div>
            </div>

            {/* Right: Horizontal scrolling step description cards */}
            <div className="lg:col-span-6 w-full flex flex-col justify-center overflow-hidden h-full">
              <div 
                ref={lane1Ref}
                className="hide-scrollbar overflow-x-auto cursor-grab active:cursor-grabbing py-6 px-2 flex gap-6 items-center w-full"
              >
                <div className="flex gap-6 items-center">
                  {/* Introduction Card */}
                  <div className="w-[300px] h-[320px] shrink-0 p-6 rounded-2xl bg-gradient-to-br from-accent-violet/10 to-accent-violet/20 border border-accent-violet/20 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-lg font-bold text-ink-deep">Vận Hành Ký Thuê</h3>
                      <p className="mt-4 text-xs leading-relaxed text-muted">
                        Theo dõi trình tự 6 bước tiêu chuẩn được số hoá tối đa để giảm thiểu thời gian và công sức quản lý thủ công hàng ngày.
                      </p>
                    </div>
                    <Link to="/register" className="text-xs font-semibold text-accent-violet hover:underline inline-flex items-center gap-1 mt-auto">
                      Trải nghiệm ngay <ArrowRight size={12} />
                    </Link>
                  </div>

                  {/* Steps */}
                  {FLOW_1_STEPS.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index === activeIndex1;
                    return (
                      <div key={index} className="flex items-center gap-6">
                        <div 
                          className={`w-[300px] h-[320px] shrink-0 bg-white border rounded-2xl p-6 shadow-sm transition-all duration-300 flex flex-col justify-between ${
                            isActive 
                              ? 'border-accent-violet ring-4 ring-accent-violet/10 opacity-100 scale-102 shadow-md' 
                              : 'border-hairline-cloud opacity-40 scale-98 hover:opacity-60'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-300 ${isActive ? 'bg-accent-violet text-white' : 'bg-accent-violet/10 text-accent-violet'}`}>
                                <Icon size={20} />
                              </div>
                              <span className="font-display text-sm font-bold text-ink-deep/20">BƯỚC 0{index + 1}</span>
                            </div>
                            <h4 className="font-display text-base font-bold text-ink-deep">{step.title}</h4>
                            <p className="mt-3 text-xs leading-relaxed text-muted line-clamp-6">{step.description}</p>
                          </div>
                        </div>
                        {index < FLOW_1_STEPS.length - 1 && (
                          <ArrowRight className="text-hairline-cool shrink-0" size={18} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Help Tip */}
          <div className="mt-8 flex justify-center items-center gap-2 text-xs text-muted/60">
            <span>💡 Di chuột vào vùng thẻ chữ bên phải và lăn con lăn chuột để xem các bước</span>
          </div>

        </div>
      </section>

      {/* Luồng 2: Trang trí AI */}
      <section className="min-h-screen flex flex-col justify-center bg-surface-light px-5 py-16 lg:px-8 overflow-hidden">
        <div className="mx-auto w-full max-w-7xl">
          
          {/* Header */}
          <div className="mb-8 text-center">
            <span className="text-xs font-bold tracking-widest text-accent-lime bg-accent-lime/20 px-3 py-1 rounded-full uppercase">LUỒNG SỐ 02</span>
            <h2 className="font-display text-3xl font-bold text-ink-deep sm:text-4xl mt-3">
              Quy Trình Trang Trí Phòng AI
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed text-muted">
              Nâng tầm trải nghiệm tìm khách thuê bằng công nghệ AI sinh ảnh của ComfyUI, dựng thiết kế nội thất 3D đẹp mắt chỉ với ảnh phòng gốc.
            </p>
          </div>

          {/* Split Screen Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-8 h-auto lg:h-[480px]">
            {/* Left: Big Static Image (1/2 viewport width on desktop) */}
            <div className="lg:col-span-6 w-full h-[280px] sm:h-[350px] lg:h-full relative bg-surface-night rounded-3xl overflow-hidden border border-hairline-cloud shadow-[var(--shadow-card)]">
              <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent z-10 pointer-events-none" />
              {FLOW_2_STEPS.map((step, idx) => (
                <img
                  key={idx}
                  src={step.img}
                  alt={step.title}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
                    idx === activeIndex2 
                      ? 'opacity-100 scale-100' 
                      : 'opacity-0 scale-95 pointer-events-none'
                  }`}
                />
              ))}
              {/* Step Counter Indicator */}
              <div className="absolute bottom-6 left-6 z-20 bg-primary/80 backdrop-blur-md px-4 py-2 rounded-xl text-white text-xs font-semibold">
                Bước {activeIndex2 + 1} / {FLOW_2_STEPS.length}
              </div>
            </div>

            {/* Right: Horizontal scrolling step description cards */}
            <div className="lg:col-span-6 w-full flex flex-col justify-center overflow-hidden h-full">
              <div 
                ref={lane2Ref}
                className="hide-scrollbar overflow-x-auto cursor-grab active:cursor-grabbing py-6 px-2 flex gap-6 items-center w-full"
              >
                <div className="flex gap-6 items-center">
                  {/* Introduction Card */}
                  <div className="w-[300px] h-[320px] shrink-0 p-6 rounded-2xl bg-gradient-to-br from-accent-lime/10 to-accent-lime/20 border border-accent-lime/20 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-lg font-bold text-ink-deep">AI ComfyUI Decor</h3>
                      <p className="mt-4 text-xs leading-relaxed text-muted">
                        Khám phá cách cải tạo không gian ảo siêu tốc giúp hình ảnh căn phòng thu hút hơn 200% lượt tương tác đăng bài.
                      </p>
                    </div>
                    <Link to="/login" className="text-xs font-semibold text-accent-lime hover:underline inline-flex items-center gap-1 mt-auto">
                      Dùng thử AI <ArrowRight size={12} />
                    </Link>
                  </div>

                  {/* Steps */}
                  {FLOW_2_STEPS.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index === activeIndex2;
                    return (
                      <div key={index} className="flex items-center gap-6">
                        <div 
                          className={`w-[300px] h-[320px] shrink-0 bg-white border rounded-2xl p-6 shadow-sm transition-all duration-300 flex flex-col justify-between ${
                            isActive 
                              ? 'border-accent-lime ring-4 ring-accent-lime/15 opacity-100 scale-102 shadow-md' 
                              : 'border-hairline-cloud opacity-40 scale-98 hover:opacity-60'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-300 ${isActive ? 'bg-accent-lime text-white' : 'bg-accent-lime/15 text-accent-lime'}`}>
                                <Icon size={20} />
                              </div>
                              <span className="font-display text-sm font-bold text-ink-deep/20">BƯỚC 0{index + 1}</span>
                            </div>
                            <h4 className="font-display text-base font-bold text-ink-deep">{step.title}</h4>
                            <p className="mt-3 text-xs leading-relaxed text-muted line-clamp-6">{step.description}</p>
                          </div>
                        </div>
                        {index < FLOW_2_STEPS.length - 1 && (
                          <ArrowRight className="text-hairline-cool shrink-0" size={18} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Help Tip */}
          <div className="mt-8 flex justify-center items-center gap-2 text-xs text-muted/60">
            <span>💡 Di chuột vào vùng thẻ chữ bên phải và lăn con lăn chuột để xem các bước</span>
          </div>

        </div>
      </section>
    </div>
  );
}
