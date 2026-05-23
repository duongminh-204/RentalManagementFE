import { useState, useEffect } from 'react';
import * as roomsApi from '../api/roomsApi';
import {
  normalizeRoomFromApi,
  normalizeRoomsList,
  mapRoomStatusToApi,
} from '../utils/roomHelpers';

export const useRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRooms = async () => {
  console.log("=== FETCH ROOMS ĐANG CHẠY ===");
  console.log("Current time:", new Date().toLocaleTimeString());

  try {
    setLoading(true);
    setError(null);

    const apiBaseUrl =
      import.meta.env.VITE_API_BASE_URL ||
      `${import.meta.env.VITE_API_ORIGIN || 'http://localhost:8090'}/api`;
    console.log(` Gọi API: ${apiBaseUrl.replace(/\/+$/, '')}/room`);

    const payload = await roomsApi.getAllRooms();
    
    console.log("API trả về thành công:", payload);
    console.log("Số phòng nhận được:", payload?.data?.length || 0);

    const roomsData = normalizeRoomsList(payload);
    console.log("Sau normalize:", roomsData);

    setRooms(roomsData);
  } catch (err) {
    console.error("LỖI KHI GỌI API:", err);
    console.error("Error response:", err.response?.data);
    console.error("Error status:", err.response?.status);
    
    setError(err.response?.data?.message || err.message || 'Lỗi khi tải phòng');
  } finally {
    setLoading(false);
  }
};

  const addRoom = async (roomData) => {
    try {
      setError(null);
      const created = await roomsApi.createRoom(roomData);
      const roomWithFloor = normalizeRoomFromApi(created?.data ?? created);
      setRooms((prev) => [...prev, roomWithFloor]);
      return roomWithFloor;
    } catch (err) {
      console.error('Error creating room:', err);
      setError(err.response?.data?.message || err.message || 'Lỗi khi tạo phòng mới');
      throw err;
    }
  };

  const editRoom = async (roomId, roomData) => {
    try {
      setError(null);
      const updated = await roomsApi.updateRoom(roomId, roomData);
      const roomWithFloor = normalizeRoomFromApi(updated?.data ?? updated);
      setRooms((prev) =>
        prev.map((room) => (String(room.id) === String(roomId) ? roomWithFloor : room))
      );
      return roomWithFloor;
    } catch (err) {
      console.error('Error updating room:', err);
      setError(err.response?.data?.message || err.message || 'Lỗi khi cập nhật phòng');
      throw err;
    }
  };

  const changeRoomStatus = async (roomId, status) => {
    try {
      setError(null);
      const updated = await roomsApi.updateRoomStatus(roomId, mapRoomStatusToApi(status));
      const normalized = normalizeRoomFromApi(updated?.data ?? updated);
      setRooms((prev) =>
        prev.map((room) => (String(room.id) === String(roomId) ? normalized : room))
      );
      return normalized;
    } catch (err) {
      console.error('Error updating room status:', err);
      setError(err.response?.data?.message || err.message || 'Lỗi khi cập nhật trạng thái phòng');
      throw err;
    }
  };

  const removeRoom = async (roomId) => {
    try {
      setError(null);
      await roomsApi.deleteRoom(roomId);
      setRooms((prev) => prev.filter((room) => String(room.id) !== String(roomId)));
    } catch (err) {
      console.error('Error deleting room:', err);
      setError(err.response?.data?.message || err.message || 'Lỗi khi xóa phòng');
      throw err;
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return {
    rooms,
    loading,
    error,
    refetch: fetchRooms,
    addRoom,
    editRoom,
    changeRoomStatus,
    removeRoom,
  };
};
