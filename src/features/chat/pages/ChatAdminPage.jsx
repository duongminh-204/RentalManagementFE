import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Edit3,
  FileText,
  LoaderCircle,
  MessageCircle,
  Paperclip,
  SendHorizontal,
  Trash2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  createAdminStreamUrl,
  deleteAdminConversation,
  getAdminConversations,
  getAdminMessages,
  markAdminConversationRead,
  renameAdminConversation,
  sendAdminMessage,
  toAssetUrl,
  uploadAdminAttachment,
} from '../api/chatApi';

const formatTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  });
};

const getConversationTitle = (conversation) =>
  conversation?.visitorName || `Khách ${conversation?.guestId?.slice(-6) || conversation?.publicToken?.slice(-6) || ''}`;

const formatConversationStatus = (status) => {
  if (status === 'open') return 'Đang mở';
  if (status === 'closed') return 'Đã đóng';
  return status || 'Không rõ';
};

const getVisitorPresence = (conversation) => {
  if (conversation?.isVisitorOnline) {
    return {
      label: 'Khách đang online',
      className: 'bg-[#f2fbf7] text-[#0f7f5c]',
    };
  }

  return {
    label: 'Khách offline',
    className: 'bg-[#f5f6fa] text-muted',
  };
};

const sortConversations = (items) =>
  [...items].sort((a, b) => {
    const left = new Date(a.lastMessageAt || a.updatedAt || a.createdAt || 0).getTime();
    const right = new Date(b.lastMessageAt || b.updatedAt || b.createdAt || 0).getTime();
    return right - left;
  });

const mergeConversation = (items, conversation, activeId) => {
  const normalizedConversation =
    activeId && conversation.id === activeId
      ? { ...conversation, unreadCountAdmin: 0 }
      : conversation;
  const exists = items.some((item) => item.id === conversation.id);
  const nextItems = exists
    ? items.map((item) => (item.id === conversation.id ? normalizedConversation : item))
    : [normalizedConversation, ...items];

  return sortConversations(nextItems);
};

const mergeMessage = (items, message) => {
  if (!message) return items;
  if (items.some((item) => item.id === message.id)) return items;
  return [...items, message];
};

const CHAT_ADMIN_LAYOUT_KEY = 'troez.admin.chat.layout';
const DEFAULT_PANEL_WIDTHS = {
  list: 360,
  info: 320,
};
const PANEL_LIMITS = {
  listMin: 260,
  listMax: 560,
  infoMin: 260,
  infoMax: 560,
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getSavedPanelWidths = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(CHAT_ADMIN_LAYOUT_KEY) || '{}');
    return {
      list: Number.isFinite(saved.list) ? saved.list : DEFAULT_PANEL_WIDTHS.list,
      info: Number.isFinite(saved.info) ? saved.info : DEFAULT_PANEL_WIDTHS.info,
    };
  } catch {
    return DEFAULT_PANEL_WIDTHS;
  }
};

const renderAttachment = (attachment, outgoing) => {
  const url = toAssetUrl(attachment.url);
  const isImage = attachment.contentType?.startsWith('image/');
  const isVideo = attachment.contentType?.startsWith('video/');

  if (isImage) {
    return <img src={url} alt={attachment.fileName} className="mt-2 max-h-56 rounded-lg object-cover" />;
  }

  if (isVideo) {
    return <video src={url} controls className="mt-2 max-h-56 rounded-lg" />;
  }

  return (
    <a href={url} target="_blank" rel="noreferrer" className={`mt-2 flex items-center gap-2 underline ${outgoing ? 'text-white' : 'text-primary'}`}>
      <FileText className="h-4 w-4" />
      {attachment.fileName || 'Tệp'}
    </a>
  );
};

const ChatAdminPage = () => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState('');
  const [pendingFile, setPendingFile] = useState(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [streamStatus, setStreamStatus] = useState('connecting');
  const [panelWidths, setPanelWidths] = useState(getSavedPanelWidths);
  const [contextMenu, setContextMenu] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isConversationActionLoading, setIsConversationActionLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const layoutRef = useRef(null);
  const dragFrameRef = useRef(null);

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.id === selectedId) || null,
    [conversations, selectedId],
  );
  const selectedPresence = getVisitorPresence(selectedConversation);

  const loadConversations = useCallback(async () => {
    try {
      setIsLoadingConversations(true);
      setError('');
      const data = await getAdminConversations();
      const sortedData = sortConversations(data || []);
      setConversations(sortedData);
      setSelectedId((current) => current || sortedData[0]?.id || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách hội thoại.');
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

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
        const data = await getAdminMessages(selectedId);
        if (!ignore) {
          setMessages(data || []);
          setConversations((current) =>
            current.map((item) =>
              item.id === selectedId ? { ...item, unreadCountAdmin: 0 } : item,
            ),
          );
          markAdminConversationRead(selectedId).catch(() => {});
        }
      } catch (err) {
        if (!ignore) {
          setError(err.response?.data?.message || 'Không thể tải tin nhắn.');
        }
      } finally {
        if (!ignore) {
          setIsLoadingMessages(false);
        }
      }
    };

    loadMessages();

    return () => {
      ignore = true;
    };
  }, [selectedId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setStreamStatus('disconnected');
      return undefined;
    }

    setStreamStatus('connecting');
    const eventSource = new EventSource(createAdminStreamUrl());

    eventSource.onopen = () => setStreamStatus('connected');
    eventSource.onerror = () => setStreamStatus('disconnected');

    const handleMessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const conversation = payload.conversation;
        const message = payload.message;

        if (!conversation || !message) return;

        setConversations((current) => mergeConversation(current, conversation, selectedId));

        if (message.conversationId === selectedId) {
          setMessages((current) => mergeMessage(current, message));
          markAdminConversationRead(selectedId).catch(() => {});
        }
      } catch {
        setStreamStatus('disconnected');
      }
    };

    const handlePresence = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (!payload.publicToken) return;

        setConversations((current) =>
          current.map((item) =>
            item.publicToken === payload.publicToken
              ? { ...item, isVisitorOnline: Boolean(payload.isVisitorOnline) }
              : item,
          ),
        );
      } catch {
        setStreamStatus('disconnected');
      }
    };

    eventSource.addEventListener('chat:message:new', handleMessage);
    eventSource.addEventListener('chat:visitor:presence', handlePresence);

    return () => {
      eventSource.removeEventListener('chat:message:new', handleMessage);
      eventSource.removeEventListener('chat:visitor:presence', handlePresence);
      eventSource.close();
    };
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  useEffect(
    () => () => {
      if (dragFrameRef.current) {
        cancelAnimationFrame(dragFrameRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!contextMenu) return undefined;

    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    window.addEventListener('scroll', closeMenu, true);

    return () => {
      window.removeEventListener('click', closeMenu);
      window.removeEventListener('scroll', closeMenu, true);
    };
  }, [contextMenu]);

  const openConversationMenu = (event, conversation) => {
    event.preventDefault();
    setContextMenu({
      conversation,
      x: Math.min(event.clientX, window.innerWidth - 220),
      y: Math.min(event.clientY, window.innerHeight - 120),
    });
  };

  const openRenameDialog = (conversation) => {
    setContextMenu(null);
    setRenameTarget(conversation);
    setRenameDraft(getConversationTitle(conversation));
  };

  const openDeleteDialog = (conversation) => {
    setContextMenu(null);
    setDeleteTarget(conversation);
  };

  const handleRenameConversation = async (event) => {
    event.preventDefault();
    const nextName = renameDraft.trim();
    if (!renameTarget || !nextName || isConversationActionLoading) return;

    try {
      setIsConversationActionLoading(true);
      setError('');
      const updatedConversation = await renameAdminConversation(renameTarget.id, nextName);
      setConversations((current) =>
        current.map((item) =>
          item.id === updatedConversation.id ? { ...item, ...updatedConversation } : item,
        ),
      );
      setRenameTarget(null);
      setRenameDraft('');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể đổi tên khách.');
    } finally {
      setIsConversationActionLoading(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (!deleteTarget || isConversationActionLoading) return;

    try {
      setIsConversationActionLoading(true);
      setError('');
      await deleteAdminConversation(deleteTarget.id);
      const nextConversations = conversations.filter((item) => item.id !== deleteTarget.id);
      setConversations(nextConversations);
      if (selectedId === deleteTarget.id) {
        setSelectedId(nextConversations[0]?.id || null);
        if (nextConversations.length === 0) {
          setMessages([]);
        }
      }
      setDeleteTarget(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa hội thoại.');
    } finally {
      setIsConversationActionLoading(false);
    }
  };

  const startResize = useCallback(
    (panel) => (event) => {
      if (!layoutRef.current) return;

      event.preventDefault();
      const bounds = layoutRef.current.getBoundingClientRect();

      const updateWidth = (clientX) => {
        if (dragFrameRef.current) {
          cancelAnimationFrame(dragFrameRef.current);
        }

        dragFrameRef.current = requestAnimationFrame(() => {
          setPanelWidths((current) => {
            const next =
              panel === 'list'
                ? {
                    ...current,
                    list: clamp(
                      clientX - bounds.left,
                      PANEL_LIMITS.listMin,
                      Math.max(PANEL_LIMITS.listMin, Math.min(PANEL_LIMITS.listMax, bounds.width - 520)),
                    ),
                  }
                : {
                    ...current,
                    info: clamp(
                      bounds.right - clientX,
                      PANEL_LIMITS.infoMin,
                      Math.max(PANEL_LIMITS.infoMin, Math.min(PANEL_LIMITS.infoMax, bounds.width - 520)),
                    ),
                  };

            localStorage.setItem(CHAT_ADMIN_LAYOUT_KEY, JSON.stringify(next));
            return next;
          });
        });
      };

      const handleMove = (moveEvent) => updateWidth(moveEvent.clientX);
      const stopResize = () => {
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', stopResize);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', stopResize, { once: true });
    },
    [],
  );

  const handleSend = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if ((!text && !pendingFile) || !selectedId || isSending) return;

    try {
      setIsSending(true);
      setError('');
      const attachments = pendingFile ? [await uploadAdminAttachment(pendingFile)] : [];
      const payload = await sendAdminMessage(selectedId, { text, attachments });
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

  const streamLabel =
    streamStatus === 'connected'
      ? 'Đang kết nối'
      : streamStatus === 'connecting'
        ? 'Đang kết nối...'
        : 'Mất kết nối';

  return (
    <div className="h-[100dvh] overflow-hidden bg-surface-light">
      <div className="flex h-full min-h-0 flex-col px-3 py-3 sm:px-5 lg:px-7">
        <section className="mb-3 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#eef1ff] px-4 py-2 text-sm font-bold text-accent-violet-deep">
              <MessageCircle className="h-4 w-4" />
              Chat website
            </div>
            <h1 className="text-2xl font-bold text-ink-deep">Hộp thư chat</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-hairline-cloud bg-white px-3 py-2 text-sm font-semibold text-ink-deep">
              {streamStatus === 'connected' ? (
                <Wifi className="h-4 w-4 text-[#0f9f6e]" />
              ) : (
                <WifiOff className="h-4 w-4 text-accent-pink" />
              )}
              {streamLabel}
            </span>
          </div>
        </section>

        {error ? (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-[#f3c3d3] bg-[#fff6f9] px-4 py-3 text-sm font-semibold text-ink-deep">
            <AlertCircle className="h-4 w-4 text-accent-pink" />
            {error}
          </div>
        ) : null}

        <section
          ref={layoutRef}
          className="grid min-h-0 flex-1 overflow-hidden rounded-lg border border-hairline-cloud bg-white shadow-[var(--shadow-card)] lg:grid-cols-[var(--chat-list-width)_minmax(0,1fr)] xl:grid-cols-[var(--chat-list-width)_minmax(360px,1fr)_var(--chat-info-width)]"
          style={{
            '--chat-list-width': `${panelWidths.list}px`,
            '--chat-info-width': `${panelWidths.info}px`,
          }}
        >
          <aside className="relative flex min-h-0 flex-col border-b border-hairline-cloud bg-[#f8fafc] lg:border-b-0 lg:border-r">
            <button
              type="button"
              onPointerDown={startResize('list')}
              className="absolute right-[-5px] top-0 z-20 hidden h-full w-2 cursor-col-resize border-x border-transparent bg-transparent transition hover:border-primary/30 hover:bg-primary/10 lg:block"
              aria-label="Kéo để chỉnh chiều rộng danh sách hội thoại"
            />
            <div className="flex h-14 items-center justify-between border-b border-hairline-cloud px-4">
              <h2 className="text-sm font-bold uppercase text-muted">Hội thoại</h2>
              <span className="text-sm font-semibold text-ink-deep">{conversations.length}</span>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              {isLoadingConversations ? (
                <div className="flex h-40 items-center justify-center text-muted">
                  <LoaderCircle className="h-6 w-6 animate-spin" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="px-4 py-8 text-sm leading-6 text-muted">
                  Chưa có hội thoại. Khi khách truy cập gửi tin nhắn từ widget, hội thoại sẽ xuất hiện tại đây.
                </div>
              ) : (
                conversations.map((conversation) => {
                  const isActive = conversation.id === selectedId;
                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => setSelectedId(conversation.id)}
                      onContextMenu={(event) => openConversationMenu(event, conversation)}
                      className={`flex w-full items-start gap-3 border-b border-hairline-cloud px-4 py-3 text-left transition ${isActive ? 'bg-white' : 'hover:bg-white'}`}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">
                        {getConversationTitle(conversation).slice(0, 1).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-bold text-ink-deep">{getConversationTitle(conversation)}</span>
                          <span className="shrink-0 text-xs font-semibold text-muted">{formatTime(conversation.lastMessageAt)}</span>
                        </span>
                        <span className="mt-1 block truncate text-xs font-semibold text-muted">
                          {[conversation.visitorEmail, conversation.visitorPhone].filter(Boolean).join(' / ') || conversation.guestId || 'Khách'}
                        </span>
                        <span className="mt-1 line-clamp-2 text-sm text-muted">{conversation.lastMessage || 'Chưa có tin nhắn'}</span>
                      </span>
                      {conversation.unreadCountAdmin > 0 ? (
                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent-pink px-1.5 text-xs font-bold text-white">
                          {conversation.unreadCountAdmin}
                        </span>
                      ) : null}
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
                    <h2 className="truncate text-lg font-bold text-ink-deep">{getConversationTitle(selectedConversation)}</h2>
                    <p className="truncate text-xs font-semibold text-muted">
                      {selectedConversation.currentUrl || 'Không có URL hiện tại'}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${selectedPresence.className}`}>
                    <Circle className="h-2 w-2 fill-current" />
                    {selectedPresence.label}
                  </span>
                </header>

                <div className="flex-1 overflow-y-auto bg-[#f6f8fb] px-4 py-5">
                  {isLoadingMessages ? (
                    <div className="flex h-full items-center justify-center text-muted">
                      <LoaderCircle className="h-7 w-7 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-center text-sm leading-6 text-muted">
                      Hội thoại này chưa có tin nhắn.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((message) => {
                        const isOutgoing = message.senderType === 'admin';
                        return (
                          <div key={message.id} className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[min(72%,640px)] rounded-2xl px-4 py-2.5 text-sm leading-6 shadow-sm ${isOutgoing ? 'rounded-br-sm bg-primary text-on-primary' : 'rounded-bl-sm bg-white text-ink-deep'}`}>
                              {message.text ? <p className="whitespace-pre-wrap break-words">{message.text}</p> : null}
                              {message.attachments?.map((attachment) => (
                                <div key={`${message.id}-${attachment.url}`}>{renderAttachment(attachment, isOutgoing)}</div>
                              ))}
                              <span className={`mt-1 flex items-center justify-end gap-1 text-[11px] font-semibold ${isOutgoing ? 'text-white/75' : 'text-muted'}`}>
                                {message.status === 'failed' ? <AlertCircle className="h-3 w-3" /> : isOutgoing ? <CheckCircle2 className="h-3 w-3" /> : null}
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
                <p className="max-w-md text-sm leading-6">Chọn một hội thoại để xem tin nhắn.</p>
              </div>
            )}
          </main>

          <aside className="relative hidden min-h-0 flex-col border-l border-hairline-cloud bg-white xl:flex">
            <button
              type="button"
              onPointerDown={startResize('info')}
              className="absolute left-[-5px] top-0 z-20 h-full w-2 cursor-col-resize border-x border-transparent bg-transparent transition hover:border-primary/30 hover:bg-primary/10"
              aria-label="Kéo để chỉnh chiều rộng thông tin khách truy cập"
            />
            <div className="border-b border-hairline-cloud px-4 py-4">
              <h2 className="text-sm font-bold uppercase text-muted">Khách truy cập</h2>
            </div>
            {selectedConversation ? (
              <dl className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm">
                {[
                  ['Trạng thái hội thoại', formatConversationStatus(selectedConversation.status)],
                  ['Mã khách (guestId)', selectedConversation.guestId],
                  ['Token công khai', selectedConversation.publicToken],
                  ['Tên', selectedConversation.visitorName],
                  ['email', selectedConversation.visitorEmail],
                  ['Điện thoại', selectedConversation.visitorPhone],
                  ['URL hiện tại', selectedConversation.currentUrl],
                  ['Nguồn giới thiệu', selectedConversation.referrer],
                  ['Trình duyệt', selectedConversation.userAgent],
                  ['IP', selectedConversation.ipAddress],
                  ['Thời điểm tạo', formatTime(selectedConversation.createdAt)],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-xs font-bold uppercase text-muted">{label}</dt>
                    <dd className="mt-1 break-words font-medium text-ink-deep">{value || '-'}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </aside>
        </section>

      </div>
      {createPortal(
        <>
          {contextMenu ? (
            <div
              className="fixed z-[90] w-52 overflow-hidden rounded-lg border border-hairline-cloud bg-white py-1 shadow-[0_16px_40px_rgba(31,22,51,0.18)]"
              style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => openRenameDialog(contextMenu.conversation)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-ink-deep hover:bg-surface-press"
              >
                <Edit3 className="h-4 w-4" />
                Đổi tên khách
              </button>
              <button
                type="button"
                onClick={() => openDeleteDialog(contextMenu.conversation)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-accent-pink hover:bg-[#fff0f5]"
              >
                <Trash2 className="h-4 w-4" />
                Xóa hội thoại
              </button>
            </div>
          ) : null}

          {renameTarget ? (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-deep/45 px-4">
              <form onSubmit={handleRenameConversation} className="w-full max-w-md rounded-xl border border-hairline-cloud bg-white p-5 shadow-[0_20px_55px_rgba(31,22,51,0.22)]">
                <h2 className="text-xl font-bold text-ink-deep">Đổi tên khách</h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Tên này sẽ hiển thị trong danh sách hội thoại và phần thông tin khách truy cập.
                </p>
                <input
                  value={renameDraft}
                  onChange={(event) => setRenameDraft(event.target.value)}
                  className="mt-5 w-full rounded-lg border border-hairline-cloud bg-[#f8fafc] px-4 py-3 text-sm font-semibold text-ink-deep outline-none transition focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
                  placeholder="Nhập tên khách"
                  autoFocus
                />
                <div className="mt-5 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setRenameTarget(null)}
                    className="inline-flex h-10 items-center rounded-lg border border-hairline-cloud bg-white px-4 text-sm font-semibold text-ink-deep hover:bg-surface-press"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={!renameDraft.trim() || isConversationActionLoading}
                    className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isConversationActionLoading ? 'Đang lưu...' : 'Lưu tên'}
                  </button>
                </div>
              </form>
            </div>
          ) : null}

          {deleteTarget ? (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-deep/45 px-4">
              <div className="w-full max-w-md rounded-xl border border-[#f3c3d3] bg-white p-5 shadow-[0_20px_55px_rgba(31,22,51,0.22)]">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#fff0f5] text-accent-pink">
                  <Trash2 className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-ink-deep">Xóa hội thoại?</h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Bạn có chắc muốn xóa hội thoại với <span className="font-bold text-ink-deep">{getConversationTitle(deleteTarget)}</span> không?
                  Toàn bộ lịch sử chat của hội thoại này sẽ bị xóa trực tiếp khỏi database và không thể khôi phục.
                </p>
                <div className="mt-5 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(null)}
                    className="inline-flex h-10 items-center rounded-lg border border-hairline-cloud bg-white px-4 text-sm font-semibold text-ink-deep hover:bg-surface-press"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteConversation}
                    disabled={isConversationActionLoading}
                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-accent-pink px-4 text-sm font-bold text-white shadow-[0_10px_26px_rgba(255,95,141,0.28)] hover:bg-accent-pink/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" />
                    {isConversationActionLoading ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </>,
        document.body,
      )}
    </div>
  );
};

export default ChatAdminPage;
