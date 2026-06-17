import {
  normalizeContractsList,
  filterContractsByRoomId,
} from '../../contracts/utils/contractHelpers';

const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN ||
  (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090/api').replace(/\/api\/?$/, '') ||
  'http://localhost:8090';

// Format currency to Vietnamese Dong
export const formatCurrency = (value) => {
  if (value == null || value === '') return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(value) || 0);
};

export const resolveMediaUrl = (url) => {
  if (!url) return null;
  const s = String(url).trim();
  if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('data:')) {
    return s;
  }
  return s.startsWith('/') ? `${API_ORIGIN}${s}` : `${API_ORIGIN}/${s}`;
};

/** API status (Available, Occupied, ...) → frontend (vacant, occupied, maintenance) */
export const mapRoomStatusFromApi = (status) => {
  const normalized = String(status ?? '').trim().toLowerCase();
  if (normalized === 'occupied' || normalized === 'đang thuê') return 'occupied';
  if (normalized === 'maintenance' || normalized === 'bảo trì' || normalized === 'maintain') {
    return 'maintenance';
  }
  if (normalized === 'available' || normalized === 'vacant' || normalized === 'trống') {
    return 'vacant';
  }
  return 'vacant';
};

export const getRoomStatusLabel = (status) => {
  const key = mapRoomStatusFromApi(status);
  const labels = {
    vacant: 'Trống',
    occupied: 'Đang thuê',
    maintenance: 'Bảo trì',
  };
  return labels[key] ?? String(status ?? '—');
};

/** Frontend status → API status */
export const mapRoomStatusToApi = (status) => {
  const normalized = String(status ?? '').trim().toLowerCase();
  if (normalized === 'occupied') return 'Occupied';
  if (normalized === 'maintenance') return 'Maintenance';
  return 'Available';
};

export const deriveFloorFromRoomNumber = (roomNumber) => {
  if (!roomNumber) return 1;
  const match = String(roomNumber).match(/\d/);
  return match ? parseInt(match[0], 10) || 1 : 1;
};

export const getRoomDisplayName = (room) =>
  room?.roomName?.trim() || room?.roomNumber?.trim() || '—';

export const normalizeRoomServiceFromApi = (item) => {
  if (!item) return null;
  return {
    roomServiceId: item.roomServiceId ?? item.id,
    roomId: item.roomId,
    serviceId: item.serviceId,
    serviceName: item.serviceName ?? item.name ?? '',
    unitPrice: Number(item.unitPrice) || 0,
    unit: item.unit ?? null,
    billingCycle: item.billingCycle ?? 'Monthly',
    icon: item.icon ?? null,
  };
};

export const normalizeDeviceFromApi = (device) => {
  if (!device) return null;
  return {
    deviceId: device.deviceId ?? device.id,
    roomId: device.roomId,
    deviceCatalogId: device.deviceCatalogId ?? null,
    deviceName: device.deviceName ?? device.name ?? '',
    quantity: Number(device.quantity) || 1,
    status: device.status ?? 'Working',
    imageUrl: resolveMediaUrl(device.imageUrl ?? device.ImageUrl ?? null),
    icon: device.icon ?? null,
  };
};

export const getDeviceStatusLabel = (status) => {
  const normalized = String(status ?? '').trim().toLowerCase();
  if (normalized === 'working' || normalized === 'ok') return 'Hoạt động';
  if (normalized === 'broken' || normalized === 'faulty') return 'Hỏng';
  if (normalized === 'repair' || normalized === 'repairing') return 'Đang sửa';
  return status || '—';
};

export const normalizeUserFromApi = (user) => {
  if (!user) return null;
  const fullName = user.fullName ?? user.FullName ?? user.name ?? user.userName ?? null;
  const avatar = resolveMediaUrl(
    user.avatar ??
      user.Avatar ??
      user.avatarUrl ??
      user.profilePicture ??
      user.profilePictureUrl
  );
  if (!fullName && !avatar) return null;
  return {
    contractId: user.contractId ?? user.ContractId ?? null,
    userId: user.userId ?? user.UserId ?? user.tenantId ?? user.TenantId ?? user.id ?? null,
    fullName: fullName ?? 'Khách thuê',
    avatar,
    email: user.email ?? user.Email ?? null,
    phone: user.phone ?? user.phoneNumber ?? user.PhoneNumber ?? null,
  };
};

export const normalizeUsersList = (room) => {
  const raw =
    room?.users ??
    room?.Users ??
    room?.tenants ??
    room?.Tenants ??
    (room?.user ? [room.user] : []) ??
    [];

  const list = Array.isArray(raw) ? raw : [];
  const seen = new Set();
  return list
    .map(normalizeUserFromApi)
    .filter((u) => {
      if (!u) return false;
      const key = u.userId ?? u.fullName;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

export const normalizeRoomImageFromApi = (img) => {
  if (!img) return null;
  if (typeof img === 'string') {
    const url = resolveMediaUrl(img);
    return url ? { id: null, url, caption: null } : null;
  }
  const url = resolveMediaUrl(
    img.imageUrl ?? img.ImageUrl ?? img.url ?? img.path ?? img.filePath
  );
  if (!url) return null;
  return {
    id: img.roomImageId ?? img.RoomImageId ?? img.id ?? null,
    url,
    caption: img.caption ?? img.description ?? null,
  };
};

/** Chuẩn hóa 1 phòng từ response API .NET */
export const normalizeRoomFromApi = (room) => {
  if (!room) return null;

  const id = room.id ?? room.roomId;
  const roomNumber = room.roomNumber ?? '';
  const roomName = room.roomName ?? room.roomNumber ?? '';
  const price = Number(room.price ?? room.rentalPrice) || 0;
  const electricPrice = Number(room.electricPrice ?? room.electricityPrice) || 0;
  const waterPrice = Number(room.waterPrice) || 0;

  const rawImages = room.roomImages ?? room.RoomImages ?? room.images ?? [];
  const roomImages = (Array.isArray(rawImages) ? rawImages : rawImages ? [rawImages] : [])
    .map(normalizeRoomImageFromApi)
    .filter(Boolean);

  const rawDevices = room.devices ?? room.Devices ?? [];
  const devices = (Array.isArray(rawDevices) ? rawDevices : [])
    .map(normalizeDeviceFromApi)
    .filter(Boolean);

  const rawServices = room.roomServices ?? room.RoomServices ?? [];
  const roomServices = (Array.isArray(rawServices) ? rawServices : [])
    .map(normalizeRoomServiceFromApi)
    .filter(Boolean);

  const users = normalizeUsersList(room);
  const user = users[0] ?? normalizeUserFromApi(
    room.user ?? room.tenant ?? room.currentTenant ?? room.occupant
  );

  const rawContracts =
    room.contracts ??
    room.Contracts ??
    (room.contract || room.Contract ? [room.contract ?? room.Contract] : []);
  const contracts = filterContractsByRoomId(
    normalizeContractsList(rawContracts),
    id
  );

  return {
    id,
    roomId: room.roomId ?? id,
    buildingId: room.buildingId ?? null,
    roomNumber,
    roomName,
    status: mapRoomStatusFromApi(room.status),
    apiStatus: room.status,
    price,
    rentalPrice: price,
    electricPrice,
    electricityPrice: electricPrice,
    waterPrice,
    internetPrice: Number(room.internetPrice) || 0,
    additionalServices: room.additionalServices ?? '',
    area: room.area != null ? Number(room.area) : null,
    maxPeople:
      room.maxPeople != null
        ? Number(room.maxPeople)
        : room.capacity != null
          ? Number(room.capacity)
          : null,
    description: room.description ?? '',
    roomImages,
    devices,
    roomServices,
    users,
    user,
    tenant: user,
    contracts,
    floor: room.floor ?? deriveFloorFromRoomNumber(roomNumber || roomName),
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
  };
};

/** Chuẩn hóa danh sách từ { data: [...] } hoặc mảng thuần */
export const normalizeRoomsList = (payload) => {
  const list = Array.isArray(payload) ? payload : payload?.data ?? [];
  return list.map(normalizeRoomFromApi).filter(Boolean);
};

/** Gửi lên API khi tạo / cập nhật */
export const denormalizeRoomForApi = (roomData) => ({
  roomNumber: roomData.roomNumber ?? roomData.roomName,
  roomName: roomData.roomName ?? roomData.roomNumber,
  rentalPrice: Number(roomData.rentalPrice ?? roomData.price) || 0,
  price: Number(roomData.price ?? roomData.rentalPrice) || 0,
  electricPrice: Number(roomData.electricityPrice ?? roomData.electricPrice) || 0,
  waterPrice: Number(roomData.waterPrice) || 0,
  internetPrice: Number(roomData.internetPrice) || 0,
  additionalServices: roomData.additionalServices || null,
  description: roomData.description || null,
  area: roomData.area != null ? Number(roomData.area) : null,
  maxPeople: roomData.maxPeople != null ? Number(roomData.maxPeople) : null,
  status: mapRoomStatusToApi(roomData.status),
  ...(roomData.buildingId != null ? { buildingId: roomData.buildingId } : {}),
});

// Format room data for display
export const formatRoomData = (room) => {
  return {
    ...room,
    rentalPriceFormatted: formatCurrency(room.rentalPrice ?? room.price),
    electricityPriceFormatted: formatCurrency(room.electricityPrice ?? room.electricPrice),
    waterPriceFormatted: formatCurrency(room.waterPrice),
    internetPriceFormatted: formatCurrency(room.internetPrice),
  };
};

// Calculate total monthly cost for a room
export const calculateRoomMonthlyCost = (room) => {
  return (room.rentalPrice ?? room.price ?? 0) + (room.internetPrice ?? 0);
};

// Parse additional services from string
export const parseAdditionalServices = (servicesString) => {
  if (!servicesString) return [];
  return servicesString
    .split(',')
    .map((service) => service.trim())
    .filter((service) => service.length > 0);
};

// Format services for display
export const formatAdditionalServices = (services) => {
  if (Array.isArray(services)) {
    return services.join(', ');
  }
  return services || '';
};

/** Nhóm phòng theo tòa nhà — dùng cho dropdown chọn phòng */
export const groupRoomsByBuilding = (rooms = [], buildings = []) => {
  const buildingMap = new Map(
    buildings.map((b) => [String(b.buildingId ?? b.id), b])
  );
  const groups = new Map();

  rooms.forEach((room) => {
    const bid = room.buildingId != null ? String(room.buildingId) : '__none__';
    if (!groups.has(bid)) {
      const building = buildingMap.get(bid);
      groups.set(bid, {
        buildingId: room.buildingId ?? null,
        buildingName:
          building?.buildingName ??
          building?.name ??
          (bid === '__none__' ? 'Chưa gán tòa' : `Tòa #${bid}`),
        rooms: [],
      });
    }
    groups.get(bid).rooms.push(room);
  });

  return [...groups.values()].sort((a, b) =>
    (a.buildingName || '').localeCompare(b.buildingName || '', 'vi')
  );
};
