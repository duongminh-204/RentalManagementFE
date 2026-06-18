import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  Loader2,
  RefreshCw,
  Sparkles,
  Upload,
  Wand2,
  X,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useRoomDecor } from '../hooks/useRoomDecor';
import { resolveMediaUrl } from '../api/roomDecorApi';
import { useRooms } from '../../rooms/hooks/useRooms';
import { getRoomDisplayName } from '../../rooms/utils/roomHelpers';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const RoomDecorPanel = () => {
  const [searchParams] = useSearchParams();
  const initialRoomId = searchParams.get('roomId') || '';

  const { rooms, loading: roomsLoading } = useRooms();
  const {
    styles,
    status,
    loading,
    generating,
    error,
    result,
    generate,
    refreshStatus,
    setError,
    setResult,
  } = useRoomDecor();

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedStyleId, setSelectedStyleId] = useState('modern');
  const [customPrompt, setCustomPrompt] = useState('');
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [roomId, setRoomId] = useState(initialRoomId);
  const [saveToRoom, setSaveToRoom] = useState(Boolean(initialRoomId));

  useEffect(() => {
    if (initialRoomId) {
      setRoomId(initialRoomId);
      setSaveToRoom(true);
    }
  }, [initialRoomId]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const roomOptions = useMemo(
    () =>
      rooms.map((room) => ({
        value: String(room.id ?? room.roomId),
        label: getRoomDisplayName(room),
      })),
    [rooms]
  );

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Chỉ chấp nhận JPG, PNG, WEBP.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Ảnh tối đa 10MB.');
      return;
    }

    setError(null);
    setResult(null);
    setSelectedFile(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      setError('Vui lòng upload ảnh phòng trước.');
      return;
    }

    if (!useCustomPrompt && !selectedStyleId) {
      setError('Vui lòng chọn phong cách decor.');
      return;
    }

    if (useCustomPrompt && !customPrompt.trim()) {
      setError('Vui lòng nhập mô tả decor tùy chỉnh.');
      return;
    }

    if (saveToRoom && !roomId) {
      setError('Vui lòng chọn phòng để lưu ảnh decor.');
      return;
    }

    await generate({
      file: selectedFile,
      styleId: useCustomPrompt ? undefined : selectedStyleId,
      customPrompt: useCustomPrompt ? customPrompt.trim() : undefined,
      roomId: saveToRoom && roomId ? Number(roomId) : undefined,
      saveToRoom: saveToRoom && Boolean(roomId),
    });
  };

  if (loading || roomsLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
      <div className="mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              <Sparkles size={14} />
              AI ComfyUI
            </div>
            <h1 className="font-display text-2xl font-bold text-ink-deep sm:text-3xl">
              Trang trí phòng bằng AI
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
              Upload ảnh phòng thật, chọn phong cách decor — AI sẽ tạo concept trang trí giữ nguyên
              cấu trúc phòng (tường, sàn, cửa sổ).
            </p>
          </div>

          <button
            type="button"
            onClick={refreshStatus}
            className="inline-flex items-center gap-2 rounded-xl border border-hairline-cloud bg-surface-light px-4 py-2 text-sm font-medium text-ink-deep transition hover:bg-surface-press"
          >
            <RefreshCw size={16} />
            Kiểm tra AI
          </button>
        </div>

        <div
          className={`mt-4 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
            status?.isAvailable
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-amber-200 bg-amber-50 text-amber-900'
          }`}
        >
          {status?.isAvailable ? (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          ) : (
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
          )}
          <div>
            <p className="font-medium">{status?.isAvailable ? 'ComfyUI sẵn sàng' : 'ComfyUI chưa kết nối'}</p>
            <p className="mt-0.5 opacity-90">{status?.message}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Upload + settings */}
        <div className="space-y-5">
          <section className="rounded-2xl border border-hairline-cloud bg-surface-light p-5 shadow-[var(--shadow-card)]">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-ink-deep">
              <Upload size={18} />
              Ảnh phòng gốc
            </h2>

            {!previewUrl ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex h-56 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-hairline-cloud bg-surface-press/50 transition hover:border-primary hover:bg-primary/5"
              >
                <ImagePlus size={36} className="text-accent-violet-mid" />
                <p className="mt-3 text-sm font-medium text-ink-deep">Chọn hoặc kéo thả ảnh phòng</p>
                <p className="mt-1 text-xs text-muted">JPG, PNG, WEBP — tối đa 10MB</p>
              </button>
            ) : (
              <div className="relative overflow-hidden rounded-xl border border-hairline-cloud bg-ink-deep">
                <img src={previewUrl} alt="Ảnh phòng gốc" className="max-h-72 w-full object-contain" />
                <button
                  type="button"
                  onClick={clearFile}
                  className="absolute right-2 top-2 rounded-lg bg-ink-deep/70 p-1.5 text-white transition hover:bg-ink-deep"
                  aria-label="Xóa ảnh"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileSelect}
            />

            {!previewUrl && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 w-full rounded-xl bg-surface-press py-2.5 text-sm font-medium text-ink-deep transition hover:bg-hairline-cloud"
              >
                Chọn ảnh từ máy
              </button>
            )}
          </section>

          <section className="rounded-2xl border border-hairline-cloud bg-surface-light p-5 shadow-[var(--shadow-card)]">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-ink-deep">
              <Wand2 size={18} />
              Phong cách decor
            </h2>

            <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={useCustomPrompt}
                onChange={(e) => setUseCustomPrompt(e.target.checked)}
                className="rounded border-hairline-cloud text-primary focus:ring-primary"
              />
              <span className="ml-2">Dùng mô tả tùy chỉnh (prompt)</span>
            </label>

            {useCustomPrompt ? (
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={4}
                placeholder="Mô tả decor bạn muốn, ví dụ: phòng trọ tông xanh pastel, rèm trắng, cây treo..."
                className="w-full rounded-xl border border-hairline-cloud px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {styles.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedStyleId(style.id)}
                    className={`rounded-xl border px-3 py-3 text-left transition ${
                      selectedStyleId === style.id
                        ? 'border-primary bg-primary/10 ring-1 ring-primary'
                        : 'border-hairline-cloud bg-surface-press/40 hover:border-primary/40'
                    }`}
                  >
                    <p className="text-sm font-semibold text-ink-deep">{style.label}</p>
                    <p className="mt-1 text-xs text-muted">{style.description}</p>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-hairline-cloud bg-surface-light p-5 shadow-[var(--shadow-card)]">
            <h2 className="mb-3 text-base font-semibold text-ink-deep">Lưu vào phòng</h2>
            <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={saveToRoom}
                onChange={(e) => setSaveToRoom(e.target.checked)}
                className="rounded border-hairline-cloud text-primary focus:ring-primary"
              />
              <span>Lưu ảnh decor vào hồ sơ phòng</span>
            </label>

            {saveToRoom && (
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full rounded-xl border border-hairline-cloud bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">— Chọn phòng —</option>
                {roomOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </section>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating || !status?.isAvailable}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-on-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                AI đang trang trí phòng... (1–3 phút)
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Tạo ảnh decor
              </>
            )}
          </button>
        </div>

        {/* Right: Result */}
        <section className="rounded-2xl border border-hairline-cloud bg-surface-light p-5 shadow-[var(--shadow-card)]">
          <h2 className="mb-4 text-base font-semibold text-ink-deep">Kết quả AI</h2>

          {!result && !generating && (
            <div className="flex h-80 flex-col items-center justify-center rounded-xl border border-dashed border-hairline-cloud bg-surface-press/50 text-center">
              <Sparkles size={40} className="text-accent-violet-mid" />
              <p className="mt-4 text-sm font-medium text-ink-deep">Ảnh decor sẽ hiển thị ở đây</p>
              <p className="mt-1 max-w-xs text-xs text-muted">
                Upload ảnh phòng, chọn phong cách và bấm &quot;Tạo ảnh decor&quot;
              </p>
            </div>
          )}

          {generating && (
            <div className="flex h-80 flex-col items-center justify-center rounded-xl bg-surface-press/50">
              <Loader2 size={44} className="animate-spin text-primary" />
              <p className="mt-4 text-sm font-medium text-ink-deep">ComfyUI đang xử lý...</p>
              <p className="mt-1 text-xs text-muted">Quá trình có thể mất 1–3 phút tùy GPU</p>
            </div>
          )}

          {result && !generating && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-xl border border-hairline-cloud bg-ink-deep">
                <img
                  src={resolveMediaUrl(result.imageUrl)}
                  alt="Ảnh phòng sau decor AI"
                  className="w-full object-contain"
                />
              </div>

              <div className="rounded-xl bg-surface-press px-4 py-3 text-sm text-muted">
                <p>
                  Thời gian xử lý:{' '}
                  <span className="font-medium text-ink-deep">
                    {Math.round((result.durationMs || 0) / 1000)}s
                  </span>
                </p>
                {result.savedToRoom && (
                  <p className="mt-1 flex items-center gap-1.5 text-green-700">
                    <CheckCircle2 size={16} />
                    Đã lưu vào phòng
                  </p>
                )}
              </div>

              <a
                href={resolveMediaUrl(result.imageUrl)}
                download
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center rounded-xl border border-hairline-cloud py-2.5 text-sm font-medium text-ink-deep transition hover:bg-surface-press"
              >
                Tải ảnh về
              </a>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default RoomDecorPanel;
