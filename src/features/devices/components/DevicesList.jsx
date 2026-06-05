import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  DoorClosed,
  Trash2,
  Upload,
  Cpu,
  CheckCircle2,
  Wrench,
  AlertCircle,
  Plus,
  X,
  Check,
} from 'lucide-react';
import { useDevices } from '../hooks/useDevices';
import { DEVICE_STATUS_OPTIONS, getStatusConfig } from '../constants';
import { resolveItemIcon } from '../utils/itemIcons';

const STATUS_ICONS = {
  active: { Icon: CheckCircle2, className: 'text-green-500' },
  maintenance: { Icon: Wrench, className: 'text-amber-500' },
  broken: { Icon: AlertCircle, className: 'text-red-500' },
};

const formatPrice = (value, billingCycle = 'Monthly') => {
  const num = Number(value);
  if (!num) return 'Miễn phí';
  const suffix = billingCycle === 'Yearly' ? '/năm' : '/tháng';
  return `${num.toLocaleString('vi-VN')}₫${suffix}`;
};

/** Tách ra ngoài để tránh remount mỗi lần gõ → mất focus ô nhập giá */
const CatalogAddArea = ({
  category,
  active,
  saving,
  newName,
  newPrice,
  newBillingCycle,
  onStart,
  onCancel,
  onConfirm,
  onNameChange,
  onPriceChange,
  onBillingCycleChange,
}) => {
  if (!active) {
    return (
      <button
        type="button"
        onClick={onStart}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 p-3 text-sm font-medium text-gray-500 transition-colors hover:border-gray-500 hover:text-ink-deep"
      >
        <Plus size={16} />
        Thêm {category === 'service' ? 'dịch vụ' : 'thiết bị'} mới
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-primary/40 bg-primary/5 p-3">
      <input
        autoFocus
        type="text"
        value={newName}
        onChange={onNameChange}
        onKeyDown={(e) => e.key === 'Enter' && onConfirm()}
        placeholder={category === 'service' ? 'Tên dịch vụ...' : 'Tên thiết bị...'}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus-visible:outline-accent-violet"
      />
      {category === 'service' && (
        <>
          <input
            type="number"
            min="0"
            value={newPrice}
            onChange={onPriceChange}
            placeholder="Giá (₫) - để trống nếu miễn phí"
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus-visible:outline-accent-violet"
          />
          <select
            value={newBillingCycle}
            onChange={onBillingCycleChange}
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus-visible:outline-accent-violet"
          >
            <option value="Monthly">Tính theo tháng</option>
            <option value="Yearly">Tính theo năm</option>
          </select>
        </>
      )}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={saving}
          className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <Check size={15} />
          {saving ? 'Đang lưu...' : 'Lưu'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-surface-press"
        >
          Hủy
        </button>
      </div>
    </div>
  );
};

const RoomChip = ({ room, active, count, onSelect }) => {
  const label = room.roomNumber || room.roomName || room.id;
  return (
    <button
      type="button"
      onClick={() => onSelect(room.id)}
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? 'bg-primary text-on-primary'
          : 'border border-hairline-cloud bg-white text-ink-deep hover:bg-surface-press'
      }`}
    >
      Phòng {label}
      <span
        className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs ${
          active ? 'bg-white/25 text-on-primary' : 'bg-surface-press text-gray-500'
        }`}
      >
        {count}
      </span>
    </button>
  );
};

const BuildingRoomGroup = ({ buildingName, address, rooms, selectedRoomId, countByRoom, onSelectRoom }) => {
  if (!rooms.length) {
    return (
      <div className="rounded-xl border border-dashed border-hairline-cloud bg-white p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink-deep">
          <Building2 size={16} className="text-accent-violet-mid" />
          {buildingName}
        </p>
        <p className="mt-2 text-xs text-gray-400">Chưa có phòng trong tòa nhà này.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-hairline-cloud bg-white p-4">
      <div className="mb-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink-deep">
          <Building2 size={16} className="text-accent-violet-mid" />
          {buildingName}
        </p>
        {address && <p className="mt-0.5 pl-6 text-xs text-gray-400">{address}</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        {rooms.map((room) => (
          <RoomChip
            key={room.id}
            room={room}
            active={selectedRoomId === room.id}
            count={countByRoom(room.id)}
            onSelect={onSelectRoom}
          />
        ))}
      </div>
    </div>
  );
};

const DevicesList = () => {
  const {
    buildings,
    rooms,
    roomsByBuilding,
    selectedRoomId,
    setSelectedRoomId,
    selectedRoom,
    deviceCatalog,
    serviceCatalog,
    items,
    loading,
    saving,
    error,
    isAssigned,
    toggleCatalogItem,
    removeItem,
    changeStatus,
    setItemImage,
    addCatalogItem,
    removeCatalogItem,
  } = useDevices();

  const [addingFor, setAddingFor] = useState(null); // null | 'device' | 'service'
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newBillingCycle, setNewBillingCycle] = useState('Monthly');

  const roomItems = useMemo(
    () => items.filter((it) => String(it.roomId) === String(selectedRoomId)),
    [items, selectedRoomId]
  );
  const roomDevices = roomItems.filter((it) => it.category === 'device');
  const roomServices = roomItems.filter((it) => it.category === 'service');

  const countByRoom = (roomId) =>
    items.filter((it) => String(it.roomId) === String(roomId)).length;

  const handleImage = async (item, e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    try {
      await setItemImage(item, file);
    } catch {
      // error shown via hook
    }
    e.target.value = '';
  };

  const startAdding = (category) => {
    setAddingFor(category);
    setNewName('');
    setNewPrice('');
  };

  const cancelAdding = () => {
    setAddingFor(null);
    setNewName('');
    setNewPrice('');
    setNewBillingCycle('Monthly');
  };

  const confirmAdding = async () => {
    if (!newName.trim() || saving) return;
    try {
      await addCatalogItem({
        name: newName,
        category: addingFor,
        price: newPrice,
        billingCycle: newBillingCycle,
      });
      cancelAdding();
    } catch {
      // error shown via hook
    }
  };

  const handleRemoveCatalog = async (item) => {
    if (
      !window.confirm(
        `Xóa "${item.name}" khỏi danh sách? Mọi phòng đang dùng mục này cũng sẽ bị gỡ.`
      )
    ) {
      return;
    }
    try {
      await removeCatalogItem(item);
    } catch {
      // error shown via hook
    }
  };

  // ===== Ô chọn bên trái (lưới icon + nhãn) =====
  const CatalogCell = ({ item }) => {
    const Icon = resolveItemIcon(item);
    const checked = isAssigned(selectedRoomId, item.id, item.category);
    return (
      <div className="group/cell relative">
        <button
          type="button"
          disabled={saving || !selectedRoomId}
          onClick={() => toggleCatalogItem(selectedRoomId, item)}
          className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
            checked
              ? 'border-primary bg-primary/5'
              : 'border-hairline-cloud hover:border-gray-400 hover:bg-surface-press'
          }`}
        >
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              checked ? 'bg-primary text-on-primary' : 'bg-surface-light text-gray-500'
            }`}
          >
            {checked ? <Check size={18} /> : <Icon size={18} />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-ink-deep">{item.name}</span>
            {item.category === 'service' && (
              <span className="block truncate text-xs text-gray-400">
                {formatPrice(item.price, item.billingCycle)}
              </span>
            )}
          </span>
        </button>

        {/* Xóa khỏi danh sách */}
        <button
          type="button"
          onClick={() => handleRemoveCatalog(item)}
          title="Xóa khỏi danh sách"
          className="absolute -right-2 -top-2 hidden h-6 w-6 items-center justify-center rounded-full border border-red-200 bg-white text-accent-pink shadow-sm hover:bg-red-50 group-hover/cell:flex"
        >
          <X size={13} />
        </button>
      </div>
    );
  };

  // ===== Item bên phải (đã gán cho phòng) =====
  const AssignedRow = ({ item }) => {
    const Icon = resolveItemIcon(item);
    const isDevice = item.category === 'device';
    const statusIcon = STATUS_ICONS[item.status] || STATUS_ICONS.active;
    const StatusIcon = statusIcon.Icon;
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="flex items-center gap-3 rounded-xl border border-hairline-cloud p-3"
      >
        {/* Ảnh / icon — chỉ thiết bị mới upload ảnh */}
        {isDevice ? (
          <label
            title="Tải ảnh lên"
            className="group/img relative flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-hairline-cloud bg-surface-light text-ink-deep"
          >
            {item.image ? (
              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
            ) : (
              <Icon size={20} />
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-ink-deep/50 text-on-primary opacity-0 transition-opacity group-hover/img:opacity-100">
              <Upload size={16} />
            </span>
            <input type="file" accept="image/*" onChange={(e) => handleImage(item, e)} className="hidden" />
          </label>
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-hairline-cloud bg-surface-light text-ink-deep">
            <Icon size={20} />
          </span>
        )}

        {/* Tên + meta */}
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-ink-deep">{item.name}</p>
          <p className="truncate text-xs text-gray-400">
            {isDevice ? (
              <>
                Thiết bị ·{' '}
                <span className={statusIcon.className}>{getStatusConfig(item.status).label}</span>
              </>
            ) : (
              formatPrice(item.price, item.billingCycle)
            )}
          </p>
        </div>

        {/* Trạng thái — chỉ thiết bị (bảng Device có Status) */}
        {isDevice && (
          <>
            <StatusIcon size={18} className={`shrink-0 ${statusIcon.className}`} />
            <select
              value={item.status}
              onChange={(e) => changeStatus(item, e.target.value)}
              className="shrink-0 rounded-lg border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus-visible:outline-accent-violet"
            >
              {DEVICE_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </>
        )}

        {/* Gỡ khỏi phòng */}
        <button
          type="button"
          onClick={() => removeItem(item)}
          title="Gỡ khỏi phòng"
          className="shrink-0 rounded-lg border border-red-200 p-2 text-accent-pink transition-colors hover:bg-red-50"
        >
          <Trash2 size={15} />
        </button>
      </motion.div>
    );
  };

  const RoomSection = ({ title, list, emptyText }) => (
    <div>
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h4>
      {list.length === 0 ? (
        <p className="rounded-lg border border-dashed border-hairline-cloud px-4 py-6 text-center text-sm text-gray-400">
          {emptyText}
        </p>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {list.map((item) => (
              <AssignedRow key={item.id} item={item} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen w-full flex-1 bg-surface-light font-sans">
      <div className="page-content page-content--wide">
        <section
          className="bg-white p-8"
          style={{ borderRadius: '20px', border: '1px solid #E5E7EB' }}
        >
          {/* Header */}
          <div>
            <h1 className="text-[32px] font-bold leading-tight text-ink-deep">
              Quản lý thiết bị &amp; dịch vụ
            </h1>
            <p className="mt-1 text-gray-500">
              Chọn tòa nhà và phòng, tích thiết bị / dịch vụ bên trái — dữ liệu lưu vào hệ thống theo từng phòng.
            </p>
            {error && (
              <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
          </div>

          {/* Phòng theo tòa nhà */}
          <div className="mt-6 rounded-xl border border-hairline-cloud bg-surface-light p-4">
            <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-deep">
              <DoorClosed size={18} className="text-accent-violet-mid" />
              Phòng theo tòa nhà
            </p>

            {loading && rooms.length === 0 ? (
              <p className="text-sm text-gray-400">Đang tải danh sách phòng...</p>
            ) : rooms.length === 0 ? (
              <p className="text-sm text-gray-400">Chưa có phòng nào. Hãy tạo tòa nhà và phòng trước.</p>
            ) : (
              <div className="space-y-4">
                {roomsByBuilding.grouped.map(({ building, rooms: buildingRooms }) => (
                  <BuildingRoomGroup
                    key={building.buildingId}
                    buildingName={building.buildingName}
                    address={building.address}
                    rooms={buildingRooms}
                    selectedRoomId={selectedRoomId}
                    countByRoom={countByRoom}
                    onSelectRoom={setSelectedRoomId}
                  />
                ))}

                {roomsByBuilding.orphanRooms.length > 0 && (
                  <BuildingRoomGroup
                    buildingName="Phòng chưa gắn tòa nhà (dữ liệu cũ)"
                    rooms={roomsByBuilding.orphanRooms}
                    selectedRoomId={selectedRoomId}
                    countByRoom={countByRoom}
                    onSelectRoom={setSelectedRoomId}
                  />
                )}

                {roomsByBuilding.unassignedRooms.length > 0 && (
                  <BuildingRoomGroup
                    buildingName="Chưa phân tòa nhà"
                    rooms={roomsByBuilding.unassignedRooms}
                    selectedRoomId={selectedRoomId}
                    countByRoom={countByRoom}
                    onSelectRoom={setSelectedRoomId}
                  />
                )}

                {buildings.length === 0 && rooms.length > 0 && (
                  <BuildingRoomGroup
                    buildingName="Tất cả phòng"
                    rooms={rooms}
                    selectedRoomId={selectedRoomId}
                    countByRoom={countByRoom}
                    onSelectRoom={setSelectedRoomId}
                  />
                )}
              </div>
            )}
          </div>

          <hr className="my-6 border-t border-gray-200" />

          {/* 2 cột: trái = catalog checkbox, phải = chi tiết phòng */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Cột trái */}
            <div className="rounded-xl border border-hairline-cloud p-5">
              <p className="mb-4 text-base font-bold text-ink-deep">
                Danh sách thiết bị &amp; dịch vụ
              </p>

              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Thiết bị
              </h4>
              <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {deviceCatalog.map((item) => (
                  <CatalogCell key={item.id} item={item} />
                ))}
              </div>
              <div className="mb-6">
                <CatalogAddArea
                  category="device"
                  active={addingFor === 'device'}
                  saving={saving}
                  newName={newName}
                  newPrice={newPrice}
                  newBillingCycle={newBillingCycle}
                  onStart={() => startAdding('device')}
                  onCancel={cancelAdding}
                  onConfirm={confirmAdding}
                  onNameChange={(e) => setNewName(e.target.value)}
                  onPriceChange={(e) => setNewPrice(e.target.value)}
                  onBillingCycleChange={(e) => setNewBillingCycle(e.target.value)}
                />
              </div>

              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Dịch vụ
              </h4>
              <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {serviceCatalog.map((item) => (
                  <CatalogCell key={item.id} item={item} />
                ))}
              </div>
              <CatalogAddArea
                category="service"
                active={addingFor === 'service'}
                saving={saving}
                newName={newName}
                newPrice={newPrice}
                newBillingCycle={newBillingCycle}
                onStart={() => startAdding('service')}
                onCancel={cancelAdding}
                onConfirm={confirmAdding}
                onNameChange={(e) => setNewName(e.target.value)}
                onPriceChange={(e) => setNewPrice(e.target.value)}
                onBillingCycleChange={(e) => setNewBillingCycle(e.target.value)}
              />
            </div>

            {/* Cột phải */}
            <div className="rounded-xl border border-hairline-cloud p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-base font-bold text-ink-deep">
                    Phòng {selectedRoom?.roomNumber || selectedRoom?.roomName || '—'}
                  </p>
                  {selectedRoom?.buildingName && (
                    <p className="text-xs text-gray-400">{selectedRoom.buildingName}</p>
                  )}
                </div>
                <span className="text-sm text-gray-400">
                  {roomDevices.length} thiết bị · {roomServices.length} dịch vụ
                </span>
              </div>

              {roomItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Cpu size={36} className="text-gray-300" />
                  <p className="mt-3 text-sm font-medium text-gray-600">
                    Phòng này chưa có thiết bị / dịch vụ
                  </p>
                  <p className="text-sm text-gray-400">
                    Tích vào danh sách bên trái để thêm.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <RoomSection
                    title="Thiết bị"
                    list={roomDevices}
                    emptyText="Chưa có thiết bị. Tích ở danh sách Thiết bị bên trái."
                  />
                  <RoomSection
                    title="Dịch vụ"
                    list={roomServices}
                    emptyText="Chưa có dịch vụ. Tích ở danh sách Dịch vụ bên trái."
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DevicesList;
