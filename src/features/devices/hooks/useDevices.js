import { useCallback, useEffect, useMemo, useState } from 'react';
import * as buildingsApi from '../../buildings/api/buildingsApi';
import * as roomMgmtApi from '../../rooms/api/roomManagementApi';
import { getAllRooms, getRoomById } from '../../rooms/api/roomsApi';
import { normalizeRoomFromApi, normalizeRoomsList } from '../../rooms/utils/roomHelpers';
import { parseMoneyInputNumber } from '../../../utils/currencyInput';

const normalizeBuilding = (building) => ({
  buildingId: building.buildingId ?? building.id,
  buildingName: building.buildingName ?? building.name ?? 'Tòa nhà',
  address: building.address ?? null,
});

const sortRooms = (list) =>
  [...list].sort((a, b) =>
    String(a.roomNumber || a.roomName || '').localeCompare(
      String(b.roomNumber || b.roomName || ''),
      'vi',
      { numeric: true }
    )
  );
const mapDeviceStatusToApi = (status) => {
  if (status === 'maintenance') return 'Repair';
  if (status === 'broken') return 'Broken';
  return 'Working';
};

const mapDeviceStatusFromApi = (status) => {
  const s = String(status || '').toLowerCase();
  if (s === 'repair' || s === 'repairing' || s === 'maintenance') return 'maintenance';
  if (s === 'broken' || s === 'faulty') return 'broken';
  return 'active';
};

const guessIconFromName = (name) => {
  const lower = (name || '').toLowerCase();
  const rules = [
    [['máy lạnh', 'điều hòa'], 'AirVent'],
    [['tủ lạnh'], 'Refrigerator'],
    [['máy giặt', 'giặt'], 'WashingMachine'],
    [['tivi'], 'Tv'],
    [['quạt'], 'Fan'],
    [['đèn'], 'Lightbulb'],
    [['giường'], 'BedDouble'],
    [['sofa', 'ghế'], 'Sofa'],
    [['tủ quần áo', 'tủ áo'], 'Shirt'],
    [['internet', 'wifi', 'mạng'], 'Wifi'],
    [['camera'], 'Cctv'],
    [['nóng lạnh', 'bình nóng'], 'Flame'],
    [['bếp'], 'CookingPot'],
    [['khóa', 'khoá'], 'Lock'],
    [['bàn'], 'Table'],
    [['vệ sinh', 'dọn'], 'Sparkles'],
    [['giữ xe', 'gửi xe'], 'Car'],
    [['nước uống'], 'Droplet'],
    [['điện'], 'Zap'],
    [['bảo vệ', 'an ninh'], 'ShieldCheck'],
  ];
  for (const [keywords, icon] of rules) {
    if (keywords.some((kw) => lower.includes(kw))) return icon;
  }
  return 'Package';
};

const mapDeviceCatalogItem = (item) => ({
  id: item.deviceCatalogId,
  deviceCatalogId: item.deviceCatalogId,
  name: item.name,
  icon: item.icon || guessIconFromName(item.name),
  category: 'device',
});

const mapServiceCatalogItem = (item) => ({
  id: item.serviceId,
  serviceId: item.serviceId,
  name: item.serviceName,
  price: item.unitPrice,
  billingCycle: item.billingCycle || 'Monthly',
  unit: item.unit,
  icon: item.icon || guessIconFromName(item.serviceName),
  category: 'service',
});

const buildItemsFromRoomDetails = (rooms, roomDetails) => {
  const result = [];
  for (const room of rooms) {
    const detail = roomDetails[room.id];
    if (!detail) continue;
    const roomLabel = room.roomNumber || room.roomName;

    for (const d of detail.devices || []) {
      result.push({
        id: `device-${d.deviceId}`,
        deviceId: d.deviceId,
        roomId: room.id,
        roomNumber: roomLabel,
        catalogId: d.deviceCatalogId != null ? d.deviceCatalogId : d.deviceName,
        deviceCatalogId: d.deviceCatalogId ?? null,
        name: d.deviceName,
        category: 'device',
        status: mapDeviceStatusFromApi(d.status),
        image: d.imageUrl,
        icon: guessIconFromName(d.deviceName),
      });
    }

    for (const rs of detail.roomServices || []) {
      result.push({
        id: `service-${rs.roomServiceId}`,
        roomServiceId: rs.roomServiceId,
        roomId: room.id,
        roomNumber: roomLabel,
        catalogId: rs.serviceId,
        name: rs.serviceName,
        price: rs.unitPrice,
        billingCycle: rs.billingCycle,
        category: 'service',
        status: 'active',
        icon: guessIconFromName(rs.serviceName),
      });
    }
  }
  return result;
};

const unwrapApiData = (response) => response?.data ?? response;

export const useDevices = () => {
  const [buildings, setBuildings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [deviceCatalog, setDeviceCatalog] = useState([]);
  const [serviceCatalog, setServiceCatalog] = useState([]);
  const [roomDetails, setRoomDetails] = useState({});
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingKey, setPendingKey] = useState(null);
  const [error, setError] = useState(null);

  const refreshRoomDetail = useCallback(async (roomId) => {
    if (!roomId) return;
    const raw = await getRoomById(roomId);
    const detail = normalizeRoomFromApi(raw);
    setRoomDetails((prev) => ({ ...prev, [roomId]: detail }));
    return detail;
  }, []);

  const loadAllRoomDetails = useCallback(async (roomList) => {
    const entries = await Promise.all(
      roomList.map(async (room) => {
        try {
          const raw = await getRoomById(room.id);
          return [room.id, normalizeRoomFromApi(raw)];
        } catch {
          return [room.id, null];
        }
      })
    );
    setRoomDetails(Object.fromEntries(entries.filter(([, v]) => v)));
  }, []);

  const loadCatalogs = useCallback(async () => {
    const [devices, services] = await Promise.all([
      roomMgmtApi.getDeviceCatalog(),
      roomMgmtApi.getServiceCatalog(),
    ]);
    setDeviceCatalog((Array.isArray(devices) ? devices : []).map(mapDeviceCatalogItem));
    setServiceCatalog((Array.isArray(services) ? services : []).map(mapServiceCatalogItem));
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [rawRooms, rawBuildings] = await Promise.all([
        getAllRooms(),
        buildingsApi.getAllBuildings(),
      ]);
      const normalizedBuildings = (Array.isArray(rawBuildings) ? rawBuildings : [])
        .map(normalizeBuilding)
        .sort((a, b) => a.buildingName.localeCompare(b.buildingName, 'vi'));
      const normalizedRooms = normalizeRoomsList(rawRooms);
      setBuildings(normalizedBuildings);
      setRooms(normalizedRooms);
      await Promise.all([loadCatalogs(), loadAllRoomDetails(normalizedRooms)]);
      setSelectedRoomId((prev) => {
        if (prev && normalizedRooms.some((r) => r.id === prev)) return prev;
        return normalizedRooms[0]?.id ?? null;
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Không tải được dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [loadAllRoomDetails, loadCatalogs]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const items = useMemo(
    () => buildItemsFromRoomDetails(rooms, roomDetails),
    [rooms, roomDetails]
  );

  const isAssigned = useCallback(
    (roomId, catalogId, category) =>
      items.some(
        (it) =>
          String(it.roomId) === String(roomId) &&
          String(it.catalogId) === String(catalogId) &&
          it.category === category
      ),
    [items]
  );

  const isPending = useCallback(
    (key) => pendingKey === key,
    [pendingKey]
  );

  const applyRoomDetailPatch = useCallback((roomId, patchFn) => {
    let snapshot;
    setRoomDetails((prev) => {
      snapshot = prev[roomId];
      if (!snapshot) return prev;
      return { ...prev, [roomId]: patchFn(snapshot) };
    });
    return () => {
      setRoomDetails((prev) => {
        if (snapshot === undefined) return prev;
        return { ...prev, [roomId]: snapshot };
      });
    };
  }, []);

  const applyCatalogPatch = useCallback((category, patchFn) => {
    let snapshot;
    const setter = category === 'service' ? setServiceCatalog : setDeviceCatalog;
    setter((prev) => {
      snapshot = prev;
      return patchFn(prev);
    });
    return () => setter(snapshot ?? []);
  }, []);

  const applyRemoveCatalogFromRooms = useCallback((catalogItem) => {
    let snapshot;
    const catalogId = catalogItem.serviceId ?? catalogItem.deviceCatalogId ?? catalogItem.id;
    setRoomDetails((prev) => {
      snapshot = prev;
      const next = {};
      for (const [roomId, detail] of Object.entries(prev)) {
        if (catalogItem.category === 'service') {
          next[roomId] = {
            ...detail,
            roomServices: (detail.roomServices || []).filter(
              (rs) => String(rs.serviceId) !== String(catalogId)
            ),
          };
        } else {
          next[roomId] = {
            ...detail,
            devices: (detail.devices || []).filter(
              (d) => String(d.deviceCatalogId) !== String(catalogId)
            ),
          };
        }
      }
      return next;
    });
    return () => setRoomDetails(snapshot ?? {});
  }, []);

  const removeRoomAssignment = useCallback(
    (roomId, item) =>
      applyRoomDetailPatch(roomId, (detail) => {
        if (item.category === 'service') {
          return {
            ...detail,
            roomServices: (detail.roomServices || []).filter(
              (rs) => String(rs.roomServiceId) !== String(item.roomServiceId)
            ),
          };
        }
        return {
          ...detail,
          devices: (detail.devices || []).filter(
            (d) => String(d.deviceId) !== String(item.deviceId)
          ),
        };
      }),
    [applyRoomDetailPatch]
  );

  const addRoomAssignmentOptimistic = useCallback(
    (roomId, catalogItem) =>
      applyRoomDetailPatch(roomId, (detail) => {
        if (catalogItem.category === 'service') {
          return {
            ...detail,
            roomServices: [
              ...(detail.roomServices || []),
              {
                roomServiceId: `temp-${Date.now()}`,
                roomId,
                serviceId: catalogItem.serviceId ?? catalogItem.id,
                serviceName: catalogItem.name,
                unitPrice: catalogItem.price ?? 0,
                billingCycle: catalogItem.billingCycle ?? 'Monthly',
                icon: catalogItem.icon ?? null,
              },
            ],
          };
        }
        return {
          ...detail,
          devices: [
            ...(detail.devices || []),
            {
              deviceId: `temp-${Date.now()}`,
              roomId,
              deviceCatalogId: catalogItem.deviceCatalogId ?? catalogItem.id,
              deviceName: catalogItem.name,
              quantity: 1,
              status: 'Working',
              imageUrl: null,
              icon: catalogItem.icon ?? null,
            },
          ],
        };
      }),
    [applyRoomDetailPatch]
  );

  const runMutation = useCallback(
    async ({ key, applyOptimistic, mutate, sync }) => {
      setPendingKey(key ?? null);
      setSaving(true);
      setError(null);

      const rollbacks = [];
      if (applyOptimistic) {
        const rollback = applyOptimistic();
        if (rollback) rollbacks.push(rollback);
      }

      try {
        const result = await mutate();
        if (sync) await sync(result);
        return result;
      } catch (err) {
        rollbacks.reverse().forEach((rollback) => rollback());
        setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra');
        throw err;
      } finally {
        setPendingKey(null);
        setSaving(false);
      }
    },
    []
  );

  const addCatalogItem = useCallback(
    async ({ name, category, price = '', billingCycle = 'Monthly', icon }) => {
      const trimmed = (name || '').trim();
      if (!trimmed) return;
      const guessedIcon = icon || guessIconFromName(trimmed);

      await runMutation({
        key: `catalog-add-${category}`,
        mutate: async () => {
          if (category === 'service') {
            const created = await roomMgmtApi.createService({
              serviceName: trimmed,
              unitPrice: parseMoneyInputNumber(price),
              billingCycle,
              icon: guessedIcon,
            });
            const mapped = mapServiceCatalogItem(unwrapApiData(created));
            setServiceCatalog((prev) => [...prev, mapped]);
            return mapped;
          }

          const created = await roomMgmtApi.createDeviceCatalog({
            name: trimmed,
            icon: guessedIcon,
          });
          const mapped = mapDeviceCatalogItem(unwrapApiData(created));
          setDeviceCatalog((prev) => [...prev, mapped]);
          return mapped;
        },
      });
    },
    [runMutation]
  );

  const removeCatalogItem = useCallback(
    async (catalogItem) => {
      const catalogId = catalogItem.serviceId ?? catalogItem.deviceCatalogId ?? catalogItem.id;

      await runMutation({
        key: `catalog-remove-${catalogItem.category}-${catalogId}`,
        applyOptimistic: () => {
          const rollbackCatalog = applyCatalogPatch(catalogItem.category, (prev) =>
            prev.filter((item) => String(item.id) !== String(catalogId))
          );
          const rollbackRooms = applyRemoveCatalogFromRooms(catalogItem);
          return () => {
            rollbackRooms();
            rollbackCatalog();
          };
        },
        mutate: async () => {
          if (catalogItem.category === 'service') {
            await roomMgmtApi.deleteService(catalogId);
          } else {
            await roomMgmtApi.deleteDeviceCatalog(catalogId);
          }
        },
      });
    },
    [applyCatalogPatch, applyRemoveCatalogFromRooms, runMutation]
  );

  const toggleCatalogItem = useCallback(
    async (roomId, catalogItem) => {
      const catalogId = catalogItem.id;
      const existing = items.find(
        (it) =>
          String(it.roomId) === String(roomId) &&
          String(it.catalogId) === String(catalogId) &&
          it.category === catalogItem.category
      );
      const key = `toggle-${roomId}-${catalogItem.category}-${catalogId}`;

      await runMutation({
        key,
        applyOptimistic: () => {
          if (existing) return removeRoomAssignment(roomId, existing);
          return addRoomAssignmentOptimistic(roomId, catalogItem);
        },
        mutate: async () => {
          if (existing) {
            if (existing.category === 'service') {
              await roomMgmtApi.deleteRoomService(roomId, existing.roomServiceId);
            } else {
              await roomMgmtApi.deleteDevice(roomId, existing.deviceId);
            }
            return;
          }

          if (catalogItem.category === 'service') {
            await roomMgmtApi.assignRoomService(roomId, {
              serviceId: catalogItem.serviceId ?? catalogItem.id,
            });
          } else {
            await roomMgmtApi.addDevice(roomId, {
              deviceCatalogId: catalogItem.deviceCatalogId ?? catalogItem.id,
              deviceName: catalogItem.name,
              quantity: 1,
              status: 'Working',
            });
          }
        },
        sync: existing
          ? undefined
          : async () => {
              await refreshRoomDetail(roomId);
            },
      });
    },
    [
      addRoomAssignmentOptimistic,
      items,
      refreshRoomDetail,
      removeRoomAssignment,
      runMutation,
    ]
  );

  const removeItem = useCallback(
    async (item) => {
      await runMutation({
        key: `remove-${item.id}`,
        applyOptimistic: () => removeRoomAssignment(item.roomId, item),
        mutate: async () => {
          if (item.category === 'service') {
            await roomMgmtApi.deleteRoomService(item.roomId, item.roomServiceId);
          } else {
            await roomMgmtApi.deleteDevice(item.roomId, item.deviceId);
          }
        },
      });
    },
    [removeRoomAssignment, runMutation]
  );

  const changeStatus = useCallback(
    async (item, status) => {
      if (item.category !== 'device') return;

      await runMutation({
        key: `status-${item.id}`,
        applyOptimistic: () =>
          applyRoomDetailPatch(item.roomId, (detail) => ({
            ...detail,
            devices: (detail.devices || []).map((device) =>
              String(device.deviceId) === String(item.deviceId)
                ? { ...device, status: mapDeviceStatusToApi(status) }
                : device
            ),
          })),
        mutate: async () => {
          await roomMgmtApi.updateDevice(item.roomId, item.deviceId, {
            deviceCatalogId:
              typeof item.catalogId === 'number' || /^\d+$/.test(String(item.catalogId))
                ? Number(item.catalogId)
                : undefined,
            deviceName: item.name,
            quantity: 1,
            status: mapDeviceStatusToApi(status),
            imageUrl: item.image?.startsWith('http') ? item.image : undefined,
          });
        },
      });
    },
    [applyRoomDetailPatch, runMutation]
  );

  const setItemImage = useCallback(
    async (item, file) => {
      if (!file || item.category !== 'device') return;

      await runMutation({
        key: `image-${item.id}`,
        mutate: async () => {
          await roomMgmtApi.uploadDeviceImage(item.roomId, item.deviceId, file);
        },
        sync: async () => {
          await refreshRoomDetail(item.roomId);
        },
      });
    },
    [refreshRoomDetail, runMutation]
  );

  const roomsByBuilding = useMemo(() => {
    const grouped = buildings.map((building) => ({
      building,
      rooms: sortRooms(
        rooms.filter((r) => String(r.buildingId) === String(building.buildingId))
      ),
    }));

    const knownBuildingIds = new Set(buildings.map((b) => String(b.buildingId)));
    const orphanRooms = sortRooms(
      rooms.filter((r) => r.buildingId != null && !knownBuildingIds.has(String(r.buildingId)))
    );
    const unassignedRooms = sortRooms(rooms.filter((r) => r.buildingId == null));

    return { grouped, orphanRooms, unassignedRooms };
  }, [buildings, rooms]);

  const selectedRoom = useMemo(() => {
    const room = rooms.find((r) => r.id === selectedRoomId);
    if (!room) return null;
    const building = buildings.find((b) => String(b.buildingId) === String(room.buildingId));
    return {
      ...room,
      buildingName: building?.buildingName ?? null,
    };
  }, [rooms, selectedRoomId, buildings]);

  return {
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
    pendingKey,
    isPending,
    error,
    isAssigned,
    toggleCatalogItem,
    removeItem,
    changeStatus,
    setItemImage,
    addCatalogItem,
    removeCatalogItem,
    refresh,
    refreshRoomDetail,
  };
};
