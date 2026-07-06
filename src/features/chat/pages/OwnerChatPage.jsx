import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  FileText,
  LoaderCircle,
  MessageCircle,
  Paperclip,
  Search,
  SendHorizontal,
  UserRound,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  createOwnerConversation,
  createOwnerStreamUrl,
  createTenantChatConversation,
  createTenantChatStreamUrl,
  getOwnerContacts,
  getOwnerConversations,
  getOwnerMessages,
  getTenantChatContacts,
  getTenantChatConversations,
  getTenantChatMessages,
  sendOwnerMessage,
  sendTenantChatMessage,
  toAssetUrl,
  uploadOwnerAttachment,
  uploadTenantChatAttachment,
} from '../api/chatApi';

const sortConversations = (items) =>
  [...items].sort((a, b) => {
    const left = new Date(a.lastMessageAt || a.updatedAt || a.createdAt || 0).getTime();
    const right = new Date(b.lastMessageAt || b.updatedAt || b.createdAt || 0).getTime();
    return right - left;
  });

const mergeConversation = (items, conversation, activeId) => {
  const normalized = activeId === conversation.id ? { ...conversation, unreadCountVisitor: 0 } : conversation;
  const next = items.some((item) => item.id === conversation.id)
    ? items.map((item) => (item.id === conversation.id ? normalized : item))
    : [normalized, ...items];
  return sortConversations(next);
};

const mergeMessage = (items, message) => {
  if (!message || items.some((item) => item.id === message.id)) return items;
  return [...items, message];
};

const formatTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
};

const getTitle = (conversation) => conversation?.visitorName || 'Hội thoại';

const getContactKey = (contact) =>
  contact.targetType === 'admin' ? 'admin:system' : `${contact.targetType}:${contact.userId || 'system'}`;

const getConversationContactKey = (conversation, mode) => {
  const guestId = conversation?.guestId || '';
  if (guestId.endsWith(':admin')) return 'admin:system';
  if (guestId.startsWith('internal:tenant:') && guestId.endsWith(':admin')) return 'admin:system';
  if (mode === 'tenant') {
    const ownerMatch = guestId.match(/^internal:owner:(\d+):tenant:/);
    return ownerMatch ? `owner:${ownerMatch[1]}` : '';
  }
  const tenantMatch = guestId.match(/:tenant:(\d+)$/);
  return tenantMatch ? `tenant:${tenantMatch[1]}` : '';
};

const getUnreadCount = (conversation, mode) => {
  if (!conversation) return 0;
  if (mode === 'tenant') return conversation?.unreadCountVisitor || 0;
  return conversation?.guestId?.includes(':tenant:')
    ? conversation.unreadCountAdmin || 0
    : conversation.unreadCountVisitor || 0;
};

const getContactTypeLabel = (targetType) => {
  if (targetType === 'admin') return 'Admin hệ thống';
  if (targetType === 'owner') return 'Chủ trọ';
  if (targetType === 'tenant') return 'Người thuê trọ';
  return 'Liên hệ';
};

const getContactDisplayName = (contact) => {
  if (contact?.targetType === 'admin') return 'Văn Hoàng';
  return contact?.displayName || 'Liên hệ';
};

const getContactPreview = (contact, conversation) => {
  if (conversation?.lastMessage) return conversation.lastMessage;
  return contact?.targetType === 'admin' ? '' : 'Bắt đầu trò chuyện';
};

const chatConfig = {
  owner: {
    title: 'Hộp thư chủ trọ',
    contactHeading: 'Danh bạ',
    emptyText: 'Chọn admin hoặc người thuê ở danh bạ để bắt đầu trò chuyện.',
    outgoingType: 'owner',
    loadContacts: getOwnerContacts,
    loadConversations: getOwnerConversations,
    createConversation: createOwnerConversation,
    loadMessages: getOwnerMessages,
    sendMessage: sendOwnerMessage,
    uploadAttachment: uploadOwnerAttachment,
    createStreamUrl: createOwnerStreamUrl,
  },
  tenant: {
    title: 'Hộp thư người thuê',
    contactHeading: 'Danh bạ',
    emptyText: 'Chọn chủ trọ hoặc admin để bắt đầu trò chuyện.',
    outgoingType: 'tenant',
    loadContacts: getTenantChatContacts,
    loadConversations: getTenantChatConversations,
    createConversation: createTenantChatConversation,
    loadMessages: getTenantChatMessages,
    sendMessage: sendTenantChatMessage,
    uploadAttachment: uploadTenantChatAttachment,
    createStreamUrl: createTenantChatStreamUrl,
  },
};

const renderAttachment = (attachment, outgoing) => {
  const url = toAssetUrl(attachment.url);
  const isImage = attachment.contentType?.startsWith('image/');
  const isVideo = attachment.contentType?.startsWith('video/');

  if (isImage) return <img src={url} alt={attachment.fileName} className="mt-2 max-h-56 rounded-lg object-cover" />;
  if (isVideo) return <video src={url} controls className="mt-2 max-h-56 rounded-lg" />;

  return (
    <a href={url} target="_blank" rel="noreferrer" className={`mt-2 flex items-center gap-2 underline ${outgoing ? 'text-white' : 'text-primary'}`}>
      <FileText className="h-4 w-4" />
      {attachment.fileName || 'Tệp'}
    </a>
  );
};

export default function OwnerChatPage({ mode = 'owner' }) {
  const config = chatConfig[mode] || chatConfig.owner;
  const [contacts, setContacts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingFile, setPendingFile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [streamStatus, setStreamStatus] = useState('connecting');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.id === selectedId) || null,
    [conversations, selectedId],
  );

  const selectedContact = useMemo(() => {
    const key = getConversationContactKey(selectedConversation, mode);
    return contacts.find((contact) => getContactKey(contact) === key) || null;
  }, [contacts, mode, selectedConversation]);

  const contactConversationMap = useMemo(() => {
    const map = new Map();
    conversations.forEach((conversation) => {
      const key = getConversationContactKey(conversation, mode);
      if (key) map.set(key, conversation);
    });
    return map;
  }, [conversations, mode]);

  const loadInitial = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const [contactResult, conversationResult] = await Promise.allSettled([
        config.loadContacts(searchTerm.trim()),
        config.loadConversations(),
      ]);

      if (contactResult.status === 'fulfilled') {
        setContacts(contactResult.value || []);
      }

      const sortedConversations =
        conversationResult.status === 'fulfilled'
          ? sortConversations(conversationResult.value || [])
          : [];
      setConversations(sortedConversations);
      setSelectedId((current) => current || sortedConversations[0]?.id || null);
      if (contactResult.status === 'rejected' || conversationResult.status === 'rejected') {
        const reason = contactResult.status === 'rejected' ? contactResult.reason : conversationResult.reason;
        const status = reason?.response?.status;
        setError(
          status === 403
            ? 'Phiên đăng nhập chưa có quyền phù hợp. Vui lòng đăng xuất rồi đăng nhập lại.'
            : reason?.response?.data?.message || 'Không thể tải hộp thư.',
        );
      }
    } catch {
      setError('Không thể tải hộp thư.');
    } finally {
      setIsLoading(false);
    }
  }, [config, searchTerm]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return undefined;
    }

    let ignore = false;
    const loadMessages = async () => {
      try {
        setIsLoadingMessages(true);
        setError('');
        const data = await config.loadMessages(selectedId);
        if (!ignore) {
          setMessages(data || []);
          setConversations((current) =>
            current.map((item) => (item.id === selectedId ? { ...item, unreadCountVisitor: 0 } : item)),
          );
        }
      } catch (err) {
        if (!ignore) setError(err.response?.data?.message || 'Không thể tải tin nhắn.');
      } finally {
        if (!ignore) setIsLoadingMessages(false);
      }
    };

    loadMessages();
    return () => {
      ignore = true;
    };
  }, [config, selectedId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setStreamStatus('disconnected');
      return undefined;
    }

    setStreamStatus('connecting');
    const eventSource = new EventSource(config.createStreamUrl());
    eventSource.onopen = () => setStreamStatus('connected');
    eventSource.onerror = () => setStreamStatus('disconnected');

    const handleMessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (!payload.conversation || !payload.message) return;
        setConversations((current) => mergeConversation(current, payload.conversation, selectedId));
        if (payload.message.conversationId === selectedId) {
          setMessages((current) => mergeMessage(current, payload.message));
        }
      } catch {
        setStreamStatus('disconnected');
      }
    };

    eventSource.addEventListener('chat:message:new', handleMessage);
    return () => {
      eventSource.removeEventListener('chat:message:new', handleMessage);
      eventSource.close();
    };
  }, [config, selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const openContact = async (contact) => {
    const existing = contactConversationMap.get(getContactKey(contact));
    if (existing) {
      setSelectedId(existing.id);
      return;
    }

    try {
      setError('');
      const conversation = await config.createConversation({
        targetType: contact.targetType,
        targetUserId: contact.userId,
      });
      setConversations((current) => mergeConversation(current, conversation, conversation.id));
      setSelectedId(conversation.id);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể mở hội thoại.');
    }
  };

  const handleSend = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if ((!text && !pendingFile) || !selectedId || isSending) return;

    try {
      setIsSending(true);
      setError('');
      const attachments = pendingFile ? [await config.uploadAttachment(pendingFile)] : [];
      const payload = await config.sendMessage(selectedId, { text, attachments });
      setDraft('');
      setPendingFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setConversations((current) => mergeConversation(current, payload.conversation, selectedId));
      setMessages((current) => mergeMessage(current, payload.message));
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi tin nhắn.');
    } finally {
      setIsSending(false);
    }
  };

  const streamLabel = streamStatus === 'connected' ? 'Đang kết nối' : streamStatus === 'connecting' ? 'Đang kết nối...' : 'Mất kết nối';

  return (
    <div className="h-[100dvh] overflow-hidden bg-surface-light">
      <div className="flex h-full min-h-0 flex-col px-3 py-3 sm:px-5 lg:px-7">
        <section className="mb-3 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#eef1ff] px-4 py-2 text-sm font-bold text-accent-violet-deep">
              <MessageCircle className="h-4 w-4" />
              Tin nhắn
            </div>
            <h1 className="text-2xl font-bold text-ink-deep">{config.title}</h1>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-hairline-cloud bg-white px-3 py-2 text-sm font-semibold text-ink-deep">
            {streamStatus === 'connected' ? <Wifi className="h-4 w-4 text-[#0f9f6e]" /> : <WifiOff className="h-4 w-4 text-accent-pink" />}
            {streamLabel}
          </span>
        </section>

        {error ? (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-[#f3c3d3] bg-[#fff6f9] px-4 py-3 text-sm font-semibold text-ink-deep">
            <AlertCircle className="h-4 w-4 text-accent-pink" />
            {error}
          </div>
        ) : null}

        <section className="grid min-h-0 flex-1 overflow-hidden rounded-lg border border-hairline-cloud bg-white shadow-[var(--shadow-card)] lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col border-b border-hairline-cloud bg-[#f8fafc] lg:border-b-0 lg:border-r">
            <div className="border-b border-hairline-cloud px-4 py-4">
              <h2 className="text-sm font-bold uppercase text-muted">{config.contactHeading}</h2>
              <label className="mt-3 flex items-center gap-2 rounded-lg border border-hairline-cloud bg-white px-3 py-2 text-sm text-muted focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
                <Search className="h-4 w-4 shrink-0" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent font-medium text-ink-deep outline-none placeholder:text-muted"
                  placeholder="Tìm theo tên, email, số điện thoại"
                />
              </label>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex h-40 items-center justify-center text-muted">
                  <LoaderCircle className="h-6 w-6 animate-spin" />
                </div>
              ) : contacts.length === 0 ? (
                <div className="px-4 py-8 text-sm leading-6 text-muted">Chưa có liên hệ phù hợp.</div>
              ) : (
                contacts.map((contact) => {
                  const conversation = contactConversationMap.get(getContactKey(contact));
                  const isActive = conversation?.id === selectedId;
                  const unreadCount = getUnreadCount(conversation, mode);
                  const displayName = getContactDisplayName(contact);
                  const previewText = getContactPreview(contact, conversation);
                  return (
                    <button
                      key={getContactKey(contact)}
                      type="button"
                      onClick={() => openContact(contact)}
                      className={`flex w-full items-start gap-3 border-b border-hairline-cloud px-4 py-3 text-left transition ${isActive ? 'bg-white' : 'hover:bg-white'}`}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">
                        {displayName?.slice(0, 1).toUpperCase() || <UserRound className="h-5 w-5" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-bold text-ink-deep">{displayName}</span>
                        </span>
                        <span className="mt-1 block truncate text-xs font-semibold text-muted">
                          {getContactTypeLabel(contact.targetType)}
                        </span>
                        {previewText ? <span className="mt-1 line-clamp-2 text-sm text-muted">{previewText}</span> : null}
                      </span>
                      <span className="flex min-w-12 shrink-0 flex-col items-end gap-2">
                        {conversation?.lastMessageAt ? <span className="text-xs font-semibold text-muted">{formatTime(conversation.lastMessageAt)}</span> : null}
                        {unreadCount > 0 ? (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-pink px-1.5 text-xs font-bold text-white">
                            {unreadCount}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </aside>

          <main className="flex min-h-0 flex-col">
            {selectedConversation ? (
              <>
                <header className="flex min-h-16 shrink-0 items-center justify-between gap-3 border-b border-hairline-cloud px-4 py-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold text-ink-deep">{selectedContact ? getContactDisplayName(selectedContact) : getTitle(selectedConversation)}</h2>
                    <p className="truncate text-xs font-semibold text-muted">
                      {selectedContact?.email || (selectedContact ? getContactTypeLabel(selectedContact.targetType) : 'Hội thoại nội bộ')}
                    </p>
                  </div>
                </header>

                <div className="flex-1 overflow-y-auto bg-[#f6f8fb] px-4 py-5">
                  {isLoadingMessages ? (
                    <div className="flex h-full items-center justify-center text-muted">
                      <LoaderCircle className="h-7 w-7 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-center text-sm leading-6 text-muted">
                      Chưa có tin nhắn trong hội thoại này.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((message) => {
                        const isOutgoing = message.senderType === config.outgoingType;
                        return (
                          <div key={message.id} className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[min(72%,640px)] rounded-2xl px-4 py-2.5 text-sm leading-6 shadow-sm ${isOutgoing ? 'rounded-br-sm bg-primary text-on-primary' : 'rounded-bl-sm bg-white text-ink-deep'}`}>
                              {message.text ? <p className="whitespace-pre-wrap break-words">{message.text}</p> : null}
                              {message.attachments?.map((attachment) => (
                                <div key={`${message.id}-${attachment.url}`}>{renderAttachment(attachment, isOutgoing)}</div>
                              ))}
                              <span className={`mt-1 block text-right text-[11px] font-semibold ${isOutgoing ? 'text-white/75' : 'text-muted'}`}>
                                {formatTime(message.createdAt)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {pendingFile ? (
                  <div className="flex items-center justify-between gap-2 border-t border-hairline-cloud bg-white px-4 py-2 text-xs font-semibold text-muted">
                    <span className="min-w-0 truncate">{pendingFile.name}</span>
                    <button type="button" onClick={() => setPendingFile(null)} className="text-accent-pink">Bỏ chọn</button>
                  </div>
                ) : null}

                <form onSubmit={handleSend} className="flex shrink-0 items-center gap-3 border-t border-hairline-cloud bg-white p-3">
                  <input ref={fileInputRef} type="file" className="hidden" onChange={(event) => setPendingFile(event.target.files?.[0] || null)} accept="image/*,video/*,.pdf,.txt,.doc,.docx,.xls,.xlsx" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-hairline-cloud text-primary transition hover:bg-surface-press" aria-label="Đính kèm tệp">
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    rows={1}
                    className="min-h-11 flex-1 resize-none rounded-lg border border-hairline-cloud bg-[#f8fafc] px-4 py-3 text-sm font-medium text-ink-deep outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                    placeholder="Nhập tin nhắn..."
                    disabled={isSending}
                  />
                  <button type="submit" disabled={(!draft.trim() && !pendingFile) || isSending} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-on-primary transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50" aria-label="Gửi tin nhắn">
                    {isSending ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <SendHorizontal className="h-5 w-5" />}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center text-muted">
                <MessageCircle className="h-12 w-12" />
                <p className="max-w-md text-sm leading-6">{config.emptyText}</p>
              </div>
            )}
          </main>
        </section>
      </div>
    </div>
  );
}
