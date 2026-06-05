import { useState } from 'react';

// ===== Danh sách phòng hiện tại của trọ =====
const ROOMS = ['101', '102', '103', '104', '105', '201', '202', '203', '204'];

// ===== Catalog thiết bị (danh sách chọn bên trái) =====
const DEVICE_CATALOG = [
  { id: 'c-ac', name: 'Máy lạnh', type: 'Điện lạnh', icon: 'AirVent' },
  { id: 'c-fridge', name: 'Tủ lạnh', type: 'Nhà bếp', icon: 'Refrigerator' },
  { id: 'c-washer', name: 'Máy giặt', type: 'Điện gia dụng', icon: 'WashingMachine' },
  { id: 'c-tv', name: 'Tivi', type: 'Điện gia dụng', icon: 'Tv' },
  { id: 'c-microwave', name: 'Lò vi sóng', type: 'Nhà bếp', icon: 'Microwave' },
  { id: 'c-fan', name: 'Quạt trần', type: 'Điện gia dụng', icon: 'Fan' },
  { id: 'c-light', name: 'Đèn LED', type: 'Điện gia dụng', icon: 'Lightbulb' },
  { id: 'c-bed', name: 'Giường ngủ', type: 'Nội thất', icon: 'BedDouble' },
  { id: 'c-sofa', name: 'Ghế sofa', type: 'Nội thất', icon: 'Sofa' },
  { id: 'c-wardrobe', name: 'Tủ quần áo', type: 'Nội thất', icon: 'Shirt' },
  { id: 'c-heater', name: 'Bình nóng lạnh', type: 'Điện gia dụng', icon: 'Flame' },
  { id: 'c-camera', name: 'Camera an ninh', type: 'An ninh', icon: 'Cctv' },
  { id: 'c-desk', name: 'Bàn làm việc', type: 'Nội thất', icon: 'Table' },
  { id: 'c-lock', name: 'Khóa cửa thông minh', type: 'An ninh', icon: 'Lock' },
];

// ===== Catalog dịch vụ =====
const SERVICE_CATALOG = [
  { id: 's-internet', name: 'Internet cáp quang', type: 'Internet', icon: 'Wifi', price: '150000' },
  { id: 's-clean', name: 'Dọn vệ sinh', type: 'Vệ sinh', icon: 'Sparkles', price: '50000' },
  { id: 's-parking', name: 'Giữ xe', type: 'Giữ xe', icon: 'Car', price: '100000' },
  { id: 's-laundry', name: 'Giặt ủi', type: 'Giặt ủi', icon: 'WashingMachine', price: '20000' },
  { id: 's-water', name: 'Nước uống', type: 'Nước uống', icon: 'Droplet', price: '12000' },
  { id: 's-security', name: 'Bảo vệ 24/7', type: 'An ninh', icon: 'ShieldCheck', price: '0' },
];

export const CATALOG = [
  ...DEVICE_CATALOG.map((c) => ({ ...c, category: 'device' })),
  ...SERVICE_CATALOG.map((c) => ({ ...c, category: 'service' })),
];

const catalogById = (catalogId) => CATALOG.find((c) => c.id === catalogId);

const createId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `it-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const makeItem = (roomNumber, catalogItem) => ({
  id: createId(),
  roomNumber,
  catalogId: catalogItem.id,
  name: catalogItem.name,
  type: catalogItem.type,
  category: catalogItem.category,
  icon: catalogItem.icon,
  price: catalogItem.price ?? '',
  status: 'active',
  image: null,
});

// Gán sẵn vài mục cho một số phòng để minh hoạ
const seed = (roomNumber, catalogId, overrides = {}) => {
  const c = catalogById(catalogId);
  return { ...makeItem(roomNumber, c), ...overrides };
};

const INITIAL_ITEMS = [
  seed('101', 'c-ac'),
  seed('101', 'c-fridge'),
  seed('101', 's-internet'),
  seed('102', 'c-washer', { status: 'maintenance' }),
  seed('102', 'c-tv'),
  seed('201', 'c-camera'),
  seed('201', 's-security'),
];

const createCatalogId = (category) =>
  `${category === 'service' ? 's' : 'c'}-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2, 6)}`;

export const useDevices = () => {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [catalog, setCatalog] = useState(CATALOG);

  const getRoomItems = (roomNumber) =>
    items.filter((it) => String(it.roomNumber) === String(roomNumber));

  const isAssigned = (roomNumber, catalogId) =>
    items.some(
      (it) => String(it.roomNumber) === String(roomNumber) && it.catalogId === catalogId
    );

  const addCatalogItem = ({ name, category, price = '', icon }) => {
    const trimmed = (name || '').trim();
    if (!trimmed) return;
    const newItem = {
      id: createCatalogId(category),
      name: trimmed,
      type: 'Khác',
      category: category === 'service' ? 'service' : 'device',
      price: category === 'service' ? price : '',
      ...(icon ? { icon } : {}),
    };
    setCatalog((prev) => [...prev, newItem]);
  };

  const removeCatalogItem = (catalogId) => {
    setCatalog((prev) => prev.filter((c) => c.id !== catalogId));
    // Gỡ luôn các mục đã gán cho phòng tham chiếu tới catalog này
    setItems((prev) => prev.filter((it) => it.catalogId !== catalogId));
  };

  const toggleCatalogItem = (roomNumber, catalogItem) => {
    setItems((prev) => {
      const exists = prev.find(
        (it) => String(it.roomNumber) === String(roomNumber) && it.catalogId === catalogItem.id
      );
      if (exists) {
        return prev.filter((it) => it.id !== exists.id);
      }
      return [...prev, makeItem(roomNumber, catalogItem)];
    });
  };

  const removeItem = (itemId) => {
    setItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  const changeStatus = (itemId, status) => {
    setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, status } : it)));
  };

  const setItemImage = (itemId, image) => {
    setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, image } : it)));
  };

  return {
    rooms: ROOMS,
    catalog,
    deviceCatalog: catalog.filter((c) => c.category === 'device'),
    serviceCatalog: catalog.filter((c) => c.category === 'service'),
    items,
    getRoomItems,
    isAssigned,
    toggleCatalogItem,
    removeItem,
    changeStatus,
    setItemImage,
    addCatalogItem,
    removeCatalogItem,
  };
};
