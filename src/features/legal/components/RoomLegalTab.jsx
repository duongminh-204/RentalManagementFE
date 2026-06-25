import { useEffect, useRef, useState } from 'react';
import { DoorOpen, Loader2, Search, X } from 'lucide-react';
import ChecklistItemCard from './ChecklistItemCard';
import { formatLegalDate } from '../utils/legalHelpers';

const RoomLegalDetailPanel = ({ roomId, onClose, fetchDetail, onSaveProfile, onUploadHandover }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [handoverCompleted, setHandoverCompleted] = useState(false);
  const handoverRef = useRef(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchDetail(roomId);
        if (!active) return;
        setDetail(data);
        setNote(data.assetConditionNote || '');
        setHandoverCompleted(Boolean(data.handoverCompleted));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [roomId, fetchDetail]);

  const handleSave = async () => {
    await onSaveProfile(roomId, { assetConditionNote: note, handoverCompleted });
    const refreshed = await fetchDetail(roomId);
    setDetail(refreshed);
  };

  const handleUpload = async (file) => {
    if (!file) return;
    await onUploadHandover(roomId, file);
    const refreshed = await fetchDetail(roomId);
    setDetail(refreshed);
    setHandoverCompleted(true);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-accent-violet" size={28} />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-hairline-cloud px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-accent-lime/20 p-2 text-[#4d7a14]">
            <DoorOpen size={20} />
          </div>
          <div>
            <h3 className="font-bold text-ink-deep">{detail?.roomName}</h3>
            <p className="text-xs text-muted">
              {detail?.buildingName} · {detail?.tenantName || 'Trống'} · {detail?.completionPercent}%
            </p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-surface-press">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        {detail?.contractEndDate && (
          <div className="rounded-xl border border-hairline-cloud bg-surface-light p-3 text-sm">
            <p className="text-muted">Hợp đồng hết hạn</p>
            <p className="font-semibold">{formatLegalDate(detail.contractEndDate)}</p>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-bold text-ink-deep">Checklist phòng</h4>
          {(detail?.items ?? []).map((item) => (
            <ChecklistItemCard
              key={item.key}
              item={item}
              onUpload={item.key === 'handover_record' ? () => handoverRef.current?.click() : null}
              uploadLabel="Tải biên bản"
            />
          ))}
        </div>

        <div className="rounded-xl border border-hairline-cloud p-4">
          <h4 className="mb-3 text-sm font-bold text-ink-deep">Ghi chú hiện trạng tài sản</h4>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-lg border border-hairline-cloud px-3 py-2 text-sm outline-none focus:border-accent-violet"
            placeholder="Mô tả tình trạng thiết bị, đồ đạc khi bàn giao..."
          />
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={handoverCompleted}
              onChange={(e) => setHandoverCompleted(e.target.checked)}
            />
            Đã hoàn tất biên bản bàn giao
          </label>
          <button
            type="button"
            onClick={handleSave}
            className="mt-4 rounded-lg bg-accent-violet px-4 py-2 text-sm font-semibold text-white"
          >
            Lưu
          </button>
        </div>
      </div>

      <input
        ref={handoverRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={(e) => handleUpload(e.target.files?.[0])}
      />
    </div>
  );
};

const RoomLegalTab = ({ rooms, onSelectRoom, search, onSearchChange, statusFilter, onStatusFilterChange }) => {
  const filtered = rooms.filter((r) => {
    const matchSearch = !search ||
      r.roomName.toLowerCase().includes(search.toLowerCase()) ||
      (r.tenantName || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.buildingName || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' ||
      (statusFilter === 'complete' && r.completionPercent >= 100) ||
      (statusFilter === 'incomplete' && r.completionPercent < 100 && r.tenantId) ||
      (statusFilter === 'empty' && !r.tenantId);
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm phòng, khách thuê..."
            className="w-full rounded-xl border border-hairline-cloud py-2.5 pl-10 pr-4 text-sm outline-none focus:border-accent-violet"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="rounded-xl border border-hairline-cloud px-4 py-2.5 text-sm outline-none focus:border-accent-violet"
        >
          <option value="all">Tất cả phòng</option>
          <option value="complete">Đã đủ hồ sơ</option>
          <option value="incomplete">Còn thiếu</option>
          <option value="empty">Phòng trống</option>
        </select>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((room) => (
          <button
            key={room.roomId}
            type="button"
            onClick={() => onSelectRoom(room.roomId)}
            className="rounded-xl border border-hairline-cloud bg-white p-4 text-left transition hover:border-accent-violet/40 hover:shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-ink-deep">{room.roomName}</p>
                <p className="text-xs text-muted">{room.buildingName}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                room.roomStatus === 'Occupied' || room.tenantId
                  ? 'bg-[#e7f6d5] text-[#4d7a14]'
                  : 'bg-surface-press text-muted'
              }`}>
                {room.tenantName || 'Trống'}
              </span>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-muted">Checklist</span>
                <span className="font-bold">{room.completionPercent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-press">
                <div
                  className={`h-full rounded-full transition-all ${
                    room.completionPercent >= 100 ? 'bg-[#4d7a14]' : 'bg-accent-violet'
                  }`}
                  style={{ width: `${room.completionPercent}%` }}
                />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export { RoomLegalTab, RoomLegalDetailPanel };
