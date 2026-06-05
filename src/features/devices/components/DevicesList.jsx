import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Plus,
  Pencil,
  Trash2,
  Cpu,
  CheckCircle2,
  Wrench,
  AlertCircle,
  // Icon theo loại / thiết bị cụ thể
  AirVent,
  Refrigerator,
  WashingMachine,
  Tv,
  Microwave,
  Fan,
  Lightbulb,
  BedDouble,
  Sofa,
  Armchair,
  Shirt,
  Wifi,
  Router,
  Cctv,
  Camera,
  Flame,
  ShowerHead,
  Bath,
  CookingPot,
  Utensils,
  Speaker,
  Monitor,
  Lock,
  KeyRound,
  Table,
  Plug,
  Snowflake,
  ShieldCheck,
  Package,
  // Icon dịch vụ
  Sparkles,
  Car,
  Droplet,
  Zap,
} from 'lucide-react';
import { useDevices } from '../hooks/useDevices';
import {
  DEVICE_STATUS_OPTIONS,
  TYPE_ICON,
  ITEM_CATEGORY_OPTIONS,
  getStatusConfig,
  getCategory,
} from '../constants';
import DeviceFormModal from './DeviceFormModal';

// Bộ icon dùng được (resolve theo tên)
const ICON_REGISTRY = {
  AirVent, Refrigerator, WashingMachine, Tv, Microwave, Fan, Lightbulb,
  BedDouble, Sofa, Armchair, Shirt, Wifi, Router, Cctv, Camera, Flame,
  ShowerHead, Bath, CookingPot, Utensils, Speaker, Monitor, Lock, KeyRound,
  Table, Plug, Snowflake, ShieldCheck, Package, Sparkles, Car, Droplet, Zap,
};

// Đoán icon theo từ khóa trong tên (cho mục mới chưa gán icon)
const KEYWORD_ICONS = [
  [['máy lạnh', 'điều hòa', 'điều hoà'], AirVent],
  [['tủ lạnh'], Refrigerator],
  [['máy giặt', 'giặt', 'ủi'], WashingMachine],
  [['tivi', 'ti vi', ' tv'], Tv],
  [['vi sóng', 'lò vi'], Microwave],
  [['quạt'], Fan],
  [['đèn'], Lightbulb],
  [['giường'], BedDouble],
  [['sofa', 'ghế sofa'], Sofa],
  [['ghế'], Armchair],
  [['tủ quần áo', 'tủ áo', 'tủ đồ'], Shirt],
  [['internet', 'mạng', 'wifi', 'modem', 'router'], Wifi],
  [['camera'], Cctv],
  [['nóng lạnh', 'bình nóng'], Flame],
  [['vòi sen', 'sen tắm'], ShowerHead],
  [['bồn tắm', 'bồn'], Bath],
  [['bếp gas', 'bếp ga', 'bếp từ', 'bếp'], CookingPot],
  [['nồi'], Utensils],
  [['khóa', 'khoá'], Lock],
  [['chìa', 'key'], KeyRound],
  [['loa'], Speaker],
  [['màn hình', 'máy tính', 'monitor'], Monitor],
  [['bàn'], Table],
  // Dịch vụ
  [['vệ sinh', 'dọn', 'dọn dẹp'], Sparkles],
  [['giữ xe', 'gửi xe', 'bãi xe', 'đỗ xe'], Car],
  [['nước uống', 'nước'], Droplet],
  [['điện'], Zap],
];

const STATUS_ICONS = {
  active: { Icon: CheckCircle2, className: 'text-green-500' },
  maintenance: { Icon: Wrench, className: 'text-amber-500' },
  broken: { Icon: AlertCircle, className: 'text-red-500' },
};

const getDeviceIcon = (device) => {
  if (device.icon && ICON_REGISTRY[device.icon]) return ICON_REGISTRY[device.icon];

  const name = (device.name || '').toLowerCase();
  for (const [keywords, Icon] of KEYWORD_ICONS) {
    if (keywords.some((kw) => name.includes(kw))) return Icon;
  }

  return ICON_REGISTRY[TYPE_ICON[device.type]] || Package;
};

const formatPrice = (value) => {
  const num = Number(value);
  if (!num) return 'Miễn phí';
  return `${num.toLocaleString('vi-VN')}₫`;
};

const DevicesList = () => {
  const { devices, addDevice, editDevice, removeDevice, changeDeviceStatus } = useDevices();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all'); // all | device | service
  const [modalMode, setModalMode] = useState(null); // null | 'create' | 'edit'
  const [editingDevice, setEditingDevice] = useState(null);

  const filteredDevices = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return devices.filter((device) => {
      const matchSearch =
        device.name.toLowerCase().includes(term) ||
        device.roomNumber.toString().toLowerCase().includes(term);
      const matchStatus = statusFilter === 'all' || device.status === statusFilter;
      const matchCategory =
        categoryFilter === 'all' || getCategory(device) === categoryFilter;
      return matchSearch && matchStatus && matchCategory;
    });
  }, [devices, searchTerm, statusFilter, categoryFilter]);

  const counts = useMemo(
    () => ({
      all: devices.length,
      device: devices.filter((d) => getCategory(d) === 'device').length,
      service: devices.filter((d) => getCategory(d) === 'service').length,
    }),
    [devices]
  );

  const categoryTabs = [
    { value: 'all', label: 'Tất cả' },
    ...ITEM_CATEGORY_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
  ];

  const openCreate = () => {
    setEditingDevice(null);
    setModalMode('create');
  };

  const openEdit = (device) => {
    setEditingDevice(device);
    setModalMode('edit');
  };

  const closeModal = () => {
    setModalMode(null);
    setEditingDevice(null);
  };

  const handleSubmit = (formData) => {
    if (modalMode === 'edit' && editingDevice) {
      editDevice(editingDevice.id, formData);
    } else {
      addDevice(formData);
    }
    closeModal();
  };

  const handleDelete = (device) => {
    if (window.confirm(`Bạn có chắc muốn xóa "${device.name}"?`)) {
      removeDevice(device.id);
    }
  };

  const cycleStatus = (device) => {
    const order = ['active', 'maintenance', 'broken'];
    const next = order[(order.indexOf(device.status) + 1) % order.length];
    changeDeviceStatus(device.id, next);
  };

  return (
    <div className="min-h-screen w-full flex-1 bg-surface-light font-sans">
      <div className="page-content page-content--wide">
        <section
          className="bg-white p-8"
          style={{ borderRadius: '20px', border: '1px solid #E5E7EB' }}
        >
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-[32px] font-bold leading-tight text-ink-deep">
                Quản lý thiết bị &amp; dịch vụ
              </h1>
              <p className="mt-1 text-gray-500">
                Quản lý thiết bị, dịch vụ và trạng thái của từng phòng.
              </p>
            </div>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-semibold text-on-primary transition-opacity hover:opacity-90"
            >
              <Plus size={20} />
              Thêm mục
            </button>
          </div>

          {/* Tabs phân loại */}
          <div className="mt-5 flex flex-wrap gap-2">
            {categoryTabs.map((tab) => {
              const active = categoryFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setCategoryFilter(tab.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary text-on-primary'
                      : 'border border-hairline-cloud bg-surface-light text-ink-deep hover:bg-surface-press'
                  }`}
                >
                  {tab.label} ({counts[tab.value]})
                </button>
              );
            })}
          </div>

          {/* Toolbar */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Tìm theo tên hoặc phòng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus-visible:outline-accent-violet"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus-visible:outline-accent-violet"
              >
                <option value="all">Tất cả trạng thái</option>
                {DEVICE_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Divider */}
          <hr className="my-6 border-t border-gray-200" />

          {/* Grid */}
          {filteredDevices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <Cpu size={40} className="text-gray-300" />
              <p className="mt-3 font-medium text-gray-600">Chưa có mục nào</p>
              <p className="text-sm text-gray-400">Nhấn "Thêm mục" để thêm thiết bị hoặc dịch vụ.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-y-6 gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {filteredDevices.map((device) => {
                  const TypeIcon = getDeviceIcon(device);
                  const status = getStatusConfig(device.status);
                  const statusIcon = STATUS_ICONS[device.status] || STATUS_ICONS.active;
                  const StatusIcon = statusIcon.Icon;
                  const isService = getCategory(device) === 'service';
                  const subLine = isService
                    ? `${device.roomNumber || 'Toàn nhà'} · ${formatPrice(device.price)}`
                    : `Phòng ${device.roomNumber}`;
                  return (
                    <motion.div
                      key={device.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group flex items-center gap-3"
                    >
                      {/* Icon / ảnh thiết bị */}
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-hairline-cloud bg-surface-light text-ink-deep">
                        {device.image ? (
                          <img
                            src={device.image}
                            alt={device.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <TypeIcon size={20} />
                        )}
                      </div>

                      {/* Tên + phòng + trạng thái */}
                      <button
                        type="button"
                        onClick={() => openEdit(device)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="truncate font-medium text-ink-deep">{device.name}</p>
                        <p className="truncate text-xs text-gray-400">
                          {subLine} · {status.label}
                        </p>
                      </button>

                      {/* Trạng thái + hành động */}
                      <div className="relative ml-auto flex h-9 w-[88px] shrink-0 items-center justify-end">
                        <button
                          type="button"
                          onClick={() => cycleStatus(device)}
                          title="Bấm để đổi trạng thái"
                          className={`transition-opacity group-hover:opacity-0 ${statusIcon.className}`}
                        >
                          <StatusIcon size={22} />
                        </button>

                        <div className="absolute right-0 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => openEdit(device)}
                            title="Sửa"
                            className="rounded-lg border border-gray-300 p-2 text-ink-deep transition-colors hover:bg-surface-press"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(device)}
                            title="Xóa"
                            className="rounded-lg border border-red-200 p-2 text-accent-pink transition-colors hover:bg-red-50"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>

      {/* Modal thêm / sửa */}
      <AnimatePresence>
        {modalMode && (
          <DeviceFormModal
            mode={modalMode}
            initialData={editingDevice}
            onSubmit={handleSubmit}
            onClose={closeModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DevicesList;
