import { useMemo, useState } from 'react';
import { ExternalLink, MessageCircle, Send, X } from 'lucide-react';

const FACEBOOK_PAGE_ID = '61590167955280';
const FACEBOOK_PAGE_URL = `https://www.facebook.com/profile.php?id=${FACEBOOK_PAGE_ID}`;
const MESSENGER_URL = `https://m.me/${FACEBOOK_PAGE_ID}`;

export default function FacebookChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const messengerHref = useMemo(() => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      return MESSENGER_URL;
    }

    return `${MESSENGER_URL}?text=${encodeURIComponent(trimmedMessage)}`;
  }, [message]);

  return (
    <div className="fixed bottom-5 right-5 z-[70] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {isOpen && (
        <section
          className="w-[min(calc(100vw_-_2.5rem),360px)] overflow-hidden rounded-2xl border border-hairline-cloud bg-surface-light shadow-[0_24px_70px_rgba(31,22,51,0.22)]"
          aria-label="Hộp chat Facebook"
        >
          <header className="flex items-center justify-between gap-3 bg-[#0866ff] px-4 py-3 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/18 ring-1 ring-white/25">
                <MessageCircle size={22} strokeWidth={2.4} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold leading-5">TROEZ trên Facebook</p>
                <p className="truncate text-xs font-medium text-white/78">Thường phản hồi trên Messenger</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/85 transition hover:bg-white/14 hover:text-white"
              aria-label="Đóng hộp chat"
            >
              <X size={20} />
            </button>
          </header>

          <div className="space-y-4 bg-[#f4f6fb] px-4 py-4">
            <div className="flex items-start gap-2">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0866ff] text-white">
                <MessageCircle size={17} />
              </div>
              <div className="max-w-[78%] rounded-2xl rounded-tl-sm bg-white px-4 py-3 text-sm font-medium leading-5 text-ink-deep shadow-sm">
                Xin chào, bạn cần TROEZ hỗ trợ gì hôm nay?
              </div>
            </div>

            <div className="rounded-xl border border-hairline-cloud bg-white p-3 shadow-sm">
              <label htmlFor="facebook-chat-message" className="sr-only">
                Tin nhắn gửi tới Facebook
              </label>
              <textarea
                id="facebook-chat-message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={3}
                className="min-h-20 w-full resize-none rounded-lg border border-hairline-cloud bg-white px-3 py-2 text-sm font-medium leading-5 text-ink-deep outline-none transition placeholder:text-muted focus:border-[#0866ff] focus:ring-4 focus:ring-[#0866ff]/10"
                placeholder="Nhập tin nhắn của bạn..."
              />
              <div className="mt-3 flex items-center gap-2">
                <a
                  href={messengerHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-[#0866ff] px-4 py-2 text-sm font-bold text-white no-underline transition hover:bg-[#0757d8] hover:text-white"
                >
                  <Send size={17} />
                  Gửi qua Messenger
                </a>
                <a
                  href={FACEBOOK_PAGE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-hairline-cloud bg-white text-[#0866ff] transition hover:border-[#0866ff]/30 hover:bg-[#eef4ff] hover:text-[#0757d8]"
                  aria-label="Mở trang Facebook"
                >
                  <ExternalLink size={18} />
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#0866ff] text-white shadow-[0_18px_34px_rgba(8,102,255,0.38)] transition hover:-translate-y-1 hover:bg-[#0757d8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0866ff]"
        aria-label={isOpen ? 'Đóng chat Facebook' : 'Mở chat Facebook'}
        aria-expanded={isOpen}
      >
        <MessageCircle size={30} strokeWidth={2.5} />
        <span className="absolute right-1 top-1 h-4 w-4 rounded-full border-2 border-white bg-accent-lime" />
      </button>
    </div>
  );
}
