import { useState } from 'react';
import {
  Image as ImageIcon,
  Minus,
  Plus,
  SendHorizontal,
  Smile,
  ThumbsUp,
  X,
} from 'lucide-react';
import troezAvatar from '../../assets/troez-icon1.png';

const FACEBOOK_PAGE_ID = '61590167955280';
const MESSENGER_URL = `https://m.me/${FACEBOOK_PAGE_ID}`;

const initialMessages = [
  { id: 1, from: 'troez', text: 'Xin chào, TROEZ có thể hỗ trợ gì cho bạn?' },
];

export default function FacebookChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(initialMessages);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      window.open(MESSENGER_URL, '_blank', 'noopener,noreferrer');
      return;
    }

    setMessages((current) => [
      ...current,
      { id: Date.now(), from: 'user', text: trimmedMessage },
    ]);
    setMessage('');
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-3 right-5 z-[70] h-16 w-16 rounded-full bg-white p-1 shadow-[0_12px_32px_rgba(31,22,51,0.26)] transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00a884] sm:bottom-4 sm:right-7"
        aria-label="Mo chat TROEZ"
      >
        <img
          src={troezAvatar}
          alt=""
          className="h-full w-full rounded-full object-cover"
        />
      </button>
    );
  }

  return (
    <section
      className="fixed bottom-0 right-0 z-[70] flex h-[min(520px,78dvh)] w-full flex-col overflow-hidden rounded-t-2xl border border-[#83d7d0] bg-[#b7eee8] shadow-[0_20px_55px_rgba(31,22,51,0.24)] sm:right-5 sm:h-[min(430px,72dvh)] sm:w-[340px] sm:rounded-t-2xl"
      aria-label="Chat TROEZ"
    >
      <header className="flex h-13 shrink-0 items-center justify-between gap-3 bg-[#a7e8df] px-3 text-[#00796b]">
        <a
          href={MESSENGER_URL}
          target="_blank"
          rel="noreferrer"
          className="flex min-w-0 flex-1 items-center gap-2 text-[#101820] no-underline hover:text-[#101820]"
        >
          <span className="relative h-10 w-10 shrink-0 rounded-full bg-white p-0.5 shadow-sm">
            <img
              src={troezAvatar}
              alt=""
              className="h-full w-full rounded-full object-cover"
            />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-bold leading-5">TROEZ</span>
          </span>
        </a>

        <div className="flex shrink-0 items-center gap-1 text-[#009688]">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#009688] hover:bg-white/35 hover:text-[#00796b]"
            aria-label="Thu nho chat"
          >
            <Minus size={22} strokeWidth={3} />
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#009688] hover:bg-white/35 hover:text-[#00796b]"
            aria-label="Dong chat"
          >
            <X size={22} strokeWidth={3} />
          </button>
        </div>
      </header>

      <div className="relative flex-1 overflow-hidden bg-[#bfeee9]">
        <div
          className="absolute inset-0 bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${troezAvatar})`, backgroundSize: '64%' }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[#b9eee8]/55" aria-hidden="true" />

        <div className="relative flex h-full flex-col gap-2.5 overflow-y-auto px-3 py-3">
          {messages.map((item) => (
            <div
              key={item.id}
              className={`flex items-end gap-2 ${item.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {item.from === 'troez' && (
                <img
                  src={troezAvatar}
                  alt=""
                  className="h-7 w-7 shrink-0 rounded-full border border-white/80 bg-white object-cover shadow-sm"
                />
              )}
              <div
                className={`max-w-[72%] rounded-[18px] px-3 py-1.5 text-[14px] font-medium leading-5 shadow-sm ${
                  item.from === 'user'
                    ? 'rounded-br-sm bg-[#0084ff] text-white'
                    : 'rounded-bl-sm bg-[#eaf9f7] text-[#102321]'
                }`}
              >
                {item.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex h-14 shrink-0 items-center gap-1.5 bg-[#aeece5] px-2"
      >
        <button
          type="button"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#009688] hover:bg-white/35"
          aria-label="Them tuy chon"
        >
          <Plus size={22} strokeWidth={3} />
        </button>
        <button
          type="button"
          className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#009688] hover:bg-white/35 min-[380px]:inline-flex"
          aria-label="Gui anh"
        >
          <ImageIcon size={20} fill="currentColor" strokeWidth={0} />
        </button>
        <a
          href={MESSENGER_URL}
          target="_blank"
          rel="noreferrer"
          className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#009688] no-underline hover:bg-white/35 hover:text-[#00796b] min-[380px]:inline-flex"
          aria-label="Mo Messenger"
        >
          <SendHorizontal size={20} fill="currentColor" strokeWidth={0} />
        </a>

        <label htmlFor="troez-chat-message" className="sr-only">
          Tin nhan chat TROEZ
        </label>
        <input
          id="troez-chat-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="min-w-0 flex-1 rounded-full border-0 bg-white px-4 py-2 text-[14px] font-medium leading-5 text-[#25312f] outline-none placeholder:text-[#657572] focus:ring-4 focus:ring-white/45"
          placeholder="Aa"
        />

        <button
          type="button"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#009688] hover:bg-white/35"
          aria-label="Bieu cam"
        >
          <Smile size={21} />
        </button>
        {message.trim() ? (
          <button
            type="submit"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#009688] no-underline hover:bg-white/35 hover:text-[#00796b]"
            aria-label="Gui tin nhan"
          >
            <SendHorizontal size={22} />
          </button>
        ) : (
          <a
            href={MESSENGER_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#f6b330] no-underline hover:bg-white/35 hover:text-[#d99700]"
            aria-label="Thich"
          >
            <ThumbsUp size={20} fill="currentColor" strokeWidth={0} />
          </a>
        )}
      </form>
    </section>
  );
}
