import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  FileText,
  Image as ImageIcon,
  LoaderCircle,
  MessageCircle,
  Minus,
  Paperclip,
  SendHorizontal,
  X,
} from 'lucide-react';
import troezAvatar from '../../assets/troez-icon1.png';
import { getStoredRole, isAdminRole, isOwnerRole } from '../../hooks/useAuth';
import {
  createConversation,
  createVisitorStreamUrl,
  getVisitorMessages,
  sendVisitorMessage,
  toAssetUrl,
  uploadVisitorAttachment,
} from '../../features/chat/api/chatApi';

const CHAT_GUEST_ID_KEY = 'troez.chat.guestId';
const CHAT_PUBLIC_TOKEN_KEY = 'troez.chat.publicToken';
const CHAT_AUTH_TOKEN_KEY = 'troez.chat.authToken';

const clearStoredChatSession = () => {
  Object.keys(localStorage)
    .filter((key) => key.startsWith('troez.chat.'))
    .forEach((key) => localStorage.removeItem(key));
};

const getOrCreateGuestId = () => {
  const current = localStorage.getItem(CHAT_GUEST_ID_KEY);
  if (current) return current;

  const randomId = globalThis.crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const next = `guest_${randomId}`;
  localStorage.setItem(CHAT_GUEST_ID_KEY, next);
  return next;
};

const formatTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const formatAdminPresence = (presence, minuteTick) => {
  void minuteTick;
  if (presence.isAdminOnline) return 'Online';

  const lastSeen = presence.lastSeenAt ? new Date(presence.lastSeenAt) : null;
  if (!lastSeen || Number.isNaN(lastSeen.getTime())) return 'Online cách đây vài phút';

  const minutes = Math.max(1, Math.floor((Date.now() - lastSeen.getTime()) / 60000));
  if (minutes < 60) return `Online cách đây ${minutes} phút`;

  const hours = Math.max(1, Math.round(minutes / 60));
  if (hours < 24) return `Online cách đây ${hours} tiếng`;

  return 'Online cách đây hơn 1 ngày';
};

const mergeMessage = (items, message) => {
  if (!message) return items;
  if (items.some((item) => item.id === message.id)) return items;
  return [...items, message];
};

const renderAttachment = (attachment) => {
  const url = toAssetUrl(attachment.url);
  const isImage = attachment.contentType?.startsWith('image/');
  const isVideo = attachment.contentType?.startsWith('video/');

  if (isImage) {
    return <img src={url} alt={attachment.fileName} className="mt-2 max-h-40 rounded-lg object-cover" />;
  }

  if (isVideo) {
    return <video src={url} controls className="mt-2 max-h-40 rounded-lg" />;
  }

  return (
    <a href={url} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-2 underline">
      <FileText className="h-4 w-4" />
      {attachment.fileName || 'Tệp'}
    </a>
  );
};

export default function ChatWidget() {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('token') || '');
  const [role, setRole] = useState(() => getStoredRole());
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [pendingFile, setPendingFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [adminPresence, setAdminPresence] = useState({ hasPresence: false, isAdminOnline: false, lastSeenAt: null });
  const [minuteTick, setMinuteTick] = useState(0);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const publicToken = conversation?.publicToken;
  const adminPresenceLabel = formatAdminPresence(adminPresence, minuteTick);

  const resetChatSession = useCallback(() => {
    clearStoredChatSession();
    setIsOpen(false);
    setConversation(null);
    setMessages([]);
    setDraft('');
    setPendingFile(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  useEffect(() => {
    const currentToken = localStorage.getItem('token') || '';
    const chatToken = localStorage.getItem(CHAT_AUTH_TOKEN_KEY) || '';
    if (currentToken && chatToken !== currentToken) {
      resetChatSession();
      localStorage.setItem(CHAT_AUTH_TOKEN_KEY, currentToken);
    }
  }, [resetChatSession]);

  useEffect(() => {
    const handleAuthChanged = () => {
      const nextToken = localStorage.getItem('token') || '';
      resetChatSession();
      if (nextToken) {
        localStorage.setItem(CHAT_AUTH_TOKEN_KEY, nextToken);
      }
      setAuthToken(nextToken);
      setRole(getStoredRole());
    };

    const handleStorage = (event) => {
      if (event.key === 'token') {
        handleAuthChanged();
      }
    };

    window.addEventListener('auth-changed', handleAuthChanged);
    window.addEventListener('unauthorized', handleAuthChanged);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('auth-changed', handleAuthChanged);
      window.removeEventListener('unauthorized', handleAuthChanged);
      window.removeEventListener('storage', handleStorage);
    };
  }, [resetChatSession]);

  const ensureConversation = useCallback(async () => {
    if (conversation) return conversation;

    const guestId = getOrCreateGuestId();
    const storedPublicToken = localStorage.getItem(CHAT_PUBLIC_TOKEN_KEY) || '';
    const data = await createConversation({
      guestId,
      publicToken: storedPublicToken,
      currentUrl: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    });

    localStorage.setItem(CHAT_PUBLIC_TOKEN_KEY, data.publicToken);
    setConversation(data);
    return data;
  }, [conversation]);

  const loadConversation = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await ensureConversation();
      const history = await getVisitorMessages(data.publicToken);
      setMessages(history || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải cuộc trò chuyện.');
    } finally {
      setIsLoading(false);
    }
  }, [ensureConversation]);

  useEffect(() => {
    if (!isOpen || conversation) return;
    loadConversation();
  }, [conversation, isOpen, loadConversation]);

  useEffect(() => {
    if (!publicToken) return undefined;

    const eventSource = new EventSource(createVisitorStreamUrl(publicToken));
    const handleMessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setConversation(payload.conversation);
        setMessages((current) => mergeMessage(current, payload.message));
      } catch {
        setError('Mất kết nối thời gian thực.');
      }
    };

    const handleAdminPresence = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setAdminPresence({
          hasPresence: true,
          isAdminOnline: Boolean(payload.isAdminOnline),
          lastSeenAt: payload.lastSeenAt || null,
        });
      } catch {
        setError('Mất kết nối thời gian thực.');
      }
    };

    eventSource.addEventListener('chat:message:new', handleMessage);
    eventSource.addEventListener('chat:admin:presence', handleAdminPresence);
    eventSource.onerror = () => setError('Mất kết nối thời gian thực.');

    return () => {
      eventSource.removeEventListener('chat:message:new', handleMessage);
      eventSource.removeEventListener('chat:admin:presence', handleAdminPresence);
      eventSource.close();
    };
  }, [publicToken]);

  useEffect(() => {
    const timer = window.setInterval(() => setMinuteTick((current) => current + 1), 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if ((!text && !pendingFile) || isSending) return;

    try {
      setIsSending(true);
      setError('');
      const data = await ensureConversation();
      const attachments = pendingFile ? [await uploadVisitorAttachment(data.publicToken, pendingFile)] : [];
      const payload = await sendVisitorMessage(data.publicToken, { text, attachments });
      setDraft('');
      setPendingFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setConversation(payload.conversation);
      setMessages((current) => mergeMessage(current, payload.message));
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi tin nhắn.');
    } finally {
      setIsSending(false);
    }
  };

  if (!authToken || !role || isAdminRole(role)) {
    return null;
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-3 right-5 z-[70] flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary shadow-[0_12px_32px_rgba(31,22,51,0.26)] transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:bottom-4 sm:right-7"
        aria-label="Mở chat TROEZ"
      >
        <MessageCircle className="h-8 w-8" />
      </button>
    );
  }

  return (
    <section className="fixed bottom-0 right-0 z-[70] flex h-[min(560px,82dvh)] w-full flex-col overflow-hidden rounded-t-2xl border border-hairline-cloud bg-white shadow-[0_20px_55px_rgba(31,22,51,0.24)] sm:right-5 sm:h-[min(520px,78dvh)] sm:w-[360px] sm:rounded-2xl">
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 bg-primary px-3 text-on-primary">
        <div className="flex min-w-0 items-center gap-2">
          <img src={troezAvatar} alt="" className="h-10 w-10 shrink-0 rounded-full border border-white/50 bg-white object-cover" />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">TROEZ</p>
            <p className="truncate text-xs font-semibold text-white/80">{adminPresenceLabel}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={() => setIsOpen(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/15" aria-label="Thu nhỏ chat">
            <Minus className="h-5 w-5" />
          </button>
          <button type="button" onClick={() => setIsOpen(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/15" aria-label="Đóng chat">
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-[#f6f8fb] px-3 py-3">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-muted">
            <LoaderCircle className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="rounded-lg bg-white px-3 py-2 text-sm text-ink-deep shadow-sm">
                Xin chào, TROEZ có thể hỗ trợ gì cho bạn?
              </div>
            ) : null}
            {messages.map((item) => {
              const isVisitor = item.senderType === 'visitor';
              return (
                <div key={item.id} className={`flex ${isVisitor ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-5 shadow-sm ${isVisitor ? 'rounded-br-sm bg-primary text-on-primary' : 'rounded-bl-sm bg-white text-ink-deep'}`}>
                    {item.text ? <p className="whitespace-pre-wrap break-words">{item.text}</p> : null}
                    {item.attachments?.map((attachment) => (
                      <div key={`${item.id}-${attachment.url}`}>{renderAttachment(attachment)}</div>
                    ))}
                    <span className={`mt-1 block text-right text-[11px] font-semibold ${isVisitor ? 'text-white/75' : 'text-muted'}`}>
                      {formatTime(item.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {error ? (
        <div className="flex items-center gap-2 border-t border-[#f3c3d3] bg-[#fff6f9] px-3 py-2 text-xs font-semibold text-ink-deep">
          <AlertCircle className="h-4 w-4 text-accent-pink" />
          {error}
        </div>
      ) : null}

      {pendingFile ? (
        <div className="flex items-center justify-between gap-2 border-t border-hairline-cloud bg-white px-3 py-2 text-xs font-semibold text-muted">
          <span className="min-w-0 truncate">{pendingFile.name}</span>
          <button type="button" onClick={() => setPendingFile(null)} className="text-accent-pink">Bỏ chọn</button>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="flex h-14 shrink-0 items-center gap-2 border-t border-hairline-cloud bg-white px-2">
        <input ref={fileInputRef} type="file" className="hidden" onChange={(event) => setPendingFile(event.target.files?.[0] || null)} accept="image/*,video/*,.pdf,.txt,.doc,.docx,.xls,.xlsx" />
        <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-primary hover:bg-surface-press" aria-label="Đính kèm tệp">
          <Paperclip className="h-5 w-5" />
        </button>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="min-w-0 flex-1 rounded-full border border-hairline-cloud bg-[#f8fafc] px-4 py-2 text-sm outline-none focus:border-primary focus:bg-white"
          placeholder="Nhập tin nhắn..."
          disabled={isSending}
        />
        <button type="submit" disabled={(!draft.trim() && !pendingFile) || isSending} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary disabled:cursor-not-allowed disabled:opacity-50" aria-label="Gửi tin nhắn">
          {isSending ? <LoaderCircle className="h-5 w-5 animate-spin" /> : pendingFile && !draft.trim() ? <ImageIcon className="h-5 w-5" /> : <SendHorizontal className="h-5 w-5" />}
        </button>
      </form>
    </section>
  );
}
