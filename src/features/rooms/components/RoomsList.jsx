import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, LayoutGrid, List } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import RoomTable from '../../../components/tables/RoomTable';
import FloorPlanCanvas from './FloorPlanCanvas';
import RoomStatusGuide from './RoomStatusGuide';
import RoomDetailModal from './RoomDetailModal';
import RoomManagementPanel from './RoomManagementPanel';
import { useRooms } from '../hooks/useRooms';
import { getRoomById } from '../api/roomsApi';
import { normalizeRoomFromApi } from '../utils/roomHelpers';

const RoomsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { rooms, loading, error, addRoom, editRoom, changeRoomStatus, removeRoom, refetch } =
    useRooms();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('floorplan'); // 'floorplan' or 'table'
  const [panelMode, setPanelMode] = useState(null); // null | 'create' | 'edit'
  const [managementRoom, setManagementRoom] = useState(null);
  const [panelLoading, setPanelLoading] = useState(false);
  const [panelSaveLoading, setPanelSaveLoading] = useState(false);
  const [panelSaveError, setPanelSaveError] = useState(null);
  const [selectedRoomDetail, setSelectedRoomDetail] = useState(null);
  const [showRoomDetail, setShowRoomDetail] = useState(false);

  useEffect(() => {
    const statusFromQuery = searchParams.get('status');
    const viewFromQuery = searchParams.get('view');
    const allowedStatuses = ['all', 'occupied', 'vacant', 'maintenance'];
    const allowedViews = ['floorplan', 'table'];

    if (statusFromQuery && allowedStatuses.includes(statusFromQuery) && statusFromQuery !== statusFilter) {
      setStatusFilter(statusFromQuery);
    }

    if (viewFromQuery && allowedViews.includes(viewFromQuery) && viewFromQuery !== viewMode) {
      setViewMode(viewFromQuery);
    }
  }, [searchParams, statusFilter, viewMode]);

  const updateRoomQuery = (nextViewMode, nextStatusFilter) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('view', nextViewMode);
    nextParams.set('status', nextStatusFilter);
    setSearchParams(nextParams, { replace: true });
  };

  // Filter rooms for table view
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchSearch = room.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'all' || room.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [rooms, searchTerm, statusFilter]);

  const loadRoomIntoPanel = async (roomId, fallback) => {
    setPanelLoading(true);
    setPanelSaveError(null);
    try {
      const payload = await getRoomById(roomId);
      const detailed = normalizeRoomFromApi(payload?.data ?? payload);
      setManagementRoom(detailed || fallback);
    } catch (err) {
      console.error('Error loading room detail:', err);
      setManagementRoom(fallback);
    } finally {
      setPanelLoading(false);
    }
  };

  const handlePanelRefresh = async () => {
    const roomId = managementRoom?.id ?? managementRoom?.roomId;
    if (!roomId) return;
    await loadRoomIntoPanel(roomId, managementRoom);
    await refetch();
  };

  const handlePanelSaveRoom = async (formData) => {
    try {
      setPanelSaveLoading(true);
      setPanelSaveError(null);
      if (panelMode === 'create') {
        const created = await addRoom(formData);
        const newId = created?.id ?? created?.roomId;
        setPanelMode('edit');
        if (newId) {
          await loadRoomIntoPanel(newId, created);
        } else {
          setManagementRoom(created);
        }
        await refetch();
      } else {
        const roomId = managementRoom?.id ?? managementRoom?.roomId;
        await editRoom(roomId, formData);
        await loadRoomIntoPanel(roomId, managementRoom);
        await refetch();
      }
    } catch (err) {
      setPanelSaveError(err.response?.data?.message || 'Lỗi khi lưu phòng');
    } finally {
      setPanelSaveLoading(false);
    }
  };

  const handleOpenCreatePanel = () => {
    setPanelMode('create');
    setManagementRoom(null);
    setPanelSaveError(null);
    setViewMode('floorplan');
  };

  const handleClosePanel = () => {
    setPanelMode(null);
    setManagementRoom(null);
    setPanelSaveError(null);
  };

  const handleEdit = (room) => {
    const roomId = room?.id ?? room?.roomId;
    setPanelMode('edit');
    setManagementRoom(normalizeRoomFromApi(room));
    setPanelSaveError(null);
    setViewMode('floorplan');
    if (roomId) loadRoomIntoPanel(roomId, normalizeRoomFromApi(room));
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm('Bạn có chắc muốn xóa phòng này?')) return;
    try {
      await removeRoom(roomId);
      const currentId = managementRoom?.id ?? managementRoom?.roomId;
      if (String(currentId) === String(roomId)) handleClosePanel();
    } catch (err) {
      setPanelSaveError(err.response?.data?.message || 'Lỗi khi xóa phòng');
    }
  };

  const handleRoomClick = async (room) => {
    const roomId = room?.id ?? room?.roomId;
    setPanelMode('edit');
    setManagementRoom(normalizeRoomFromApi(room));
    setPanelSaveError(null);
    if (roomId) await loadRoomIntoPanel(roomId, normalizeRoomFromApi(room));
  };

  const handleDeleteSelectedRoom = () => {
    const roomId = managementRoom?.id ?? managementRoom?.roomId;
    if (!roomId || panelMode !== 'edit') return;
    handleDelete(roomId);
  };

  const selectedRoomId =
    panelMode === 'edit' ? managementRoom?.id ?? managementRoom?.roomId : null;

  const handleRoomHover = (room) => {
    // Can be used to show preview or tooltip
    console.log('Hovering over room:', room.roomNumber);
  };

  const handleExport = () => {
    console.log('Exporting rooms data...');
    // TODO: Implement CSV/Excel export
  };

  const stats = {
    total: rooms.length,
    occupied: rooms.filter(r => r.status === 'occupied').length,
    vacant: rooms.filter(r => r.status === 'vacant').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
  };

  const statCards = [
    { label: 'Tổng phòng', value: stats.total, color: 'blue' },
    { label: 'Đang thuê', value: stats.occupied, color: 'green' },
    { label: 'Trống', value: stats.vacant, color: 'amber' },
    { label: 'Bảo trì', value: stats.maintenance, color: 'orange' },
  ];

  const getBorderClass = (color) => {
    const map = {
      blue: 'border-blue-500',
      green: 'border-green-500',
      amber: 'border-amber-500',
      orange: 'border-orange-500',
    };
    return map[color] || 'border-gray-500';
  };

  return (
    <div className="min-h-screen w-full flex-1 bg-surface-light font-sans">
      <div className="page-content page-content--wide">

        {/* View Mode Selector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-2 mb-6"
        >
          <button
            onClick={() => {
              setViewMode('floorplan');
              updateRoomQuery('floorplan', statusFilter);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              viewMode === 'floorplan'
                ? 'bg-primary text-on-primary'
                : 'border border-hairline-cloud bg-surface-light text-ink-deep hover:bg-surface-press'
            }`}
          >
            <LayoutGrid size={20} />
            Sơ đồ tầng
          </button>
          <button
            onClick={() => {
              setViewMode('table');
              updateRoomQuery('table', statusFilter);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
              viewMode === 'table'
                ? 'bg-primary text-on-primary'
                : 'border border-hairline-cloud bg-surface-light text-ink-deep hover:bg-surface-press'
            }`}
          >
            <List size={20} />
            Bảng
          </button>
        </motion.div>

        {/* Floor Plan View */}
        {viewMode === 'floorplan' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <RoomStatusGuide />
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(440px,520px)] lg:items-stretch xl:gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(480px,560px)]">
              <div className="min-h-[520px] overflow-hidden rounded-xl border border-hairline-cloud bg-surface-light p-3 lg:min-h-[600px] xl:min-h-[640px]">
                <FloorPlanCanvas
                  rooms={rooms}
                  selectedRoomId={selectedRoomId}
                  onRoomClick={handleRoomClick}
                  onRoomHover={handleRoomHover}
                  onAddRoom={handleOpenCreatePanel}
                  onDeleteRoom={handleDeleteSelectedRoom}
                />
              </div>
              <RoomManagementPanel
                room={panelMode === 'create' ? null : managementRoom}
                mode={panelMode === 'create' ? 'create' : 'edit'}
                loading={panelLoading}
                onClose={handleClosePanel}
                onSaveRoom={panelMode ? handlePanelSaveRoom : undefined}
                onRefresh={handlePanelRefresh}
                saveLoading={panelSaveLoading}
                saveError={panelSaveError}
              />
            </div>
          </motion.div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo số phòng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus-visible:outline-accent-violet"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter size={20} className="text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    const nextStatus = e.target.value;
                    setStatusFilter(nextStatus);
                    updateRoomQuery(viewMode, nextStatus);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus-visible:outline-accent-violet"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="occupied">Đang thuê</option>
                  <option value="vacant">Trống</option>
                  <option value="maintenance">Đang bảo trì</option>
                </select>
              </div>
            </motion.div>

            {/* Global Error */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                {error}
              </div>
            )}

            {/* Table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <RoomTable
                rooms={filteredRooms}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={changeRoomStatus}
              />
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Room Detail Modal */}
      <AnimatePresence>
        {showRoomDetail && (
          <RoomDetailModal
            room={selectedRoomDetail}
            isOpen={showRoomDetail}
            onClose={() => setShowRoomDetail(false)}
            onEdit={(room) => {
              handleEdit(room);
              setShowRoomDetail(false);
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
};

export default RoomsList;
