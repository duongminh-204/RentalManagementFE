import { useState } from 'react';

// Dữ liệu mẫu ban đầu (chưa có backend cho thiết bị => quản lý ở client state)
// Trường `icon` là tên icon Lucide, được resolve trong DevicesList.
const INITIAL_DEVICES = [
  {
    id: 'dv-1',
    name: 'Máy lạnh Daikin Inverter',
    type: 'Điện lạnh',
    roomNumber: '101',
    status: 'active',
    image: null,
    icon: 'AirVent',
    description: '9000 BTU, lắp đặt năm 2023',
  },
  {
    id: 'dv-2',
    name: 'Tủ lạnh Toshiba 150L',
    type: 'Nhà bếp',
    roomNumber: '101',
    status: 'active',
    image: null,
    icon: 'Refrigerator',
    description: 'Dung tích 150L, còn bảo hành',
  },
  {
    id: 'dv-3',
    name: 'Máy giặt LG Inverter 9kg',
    type: 'Điện gia dụng',
    roomNumber: '102',
    status: 'active',
    image: null,
    icon: 'WashingMachine',
    description: 'Lồng ngang, tiết kiệm điện',
  },
  {
    id: 'dv-4',
    name: 'Tivi Samsung 43"',
    type: 'Điện gia dụng',
    roomNumber: '102',
    status: 'maintenance',
    image: null,
    icon: 'Tv',
    description: 'Remote bị liệt vài nút, cần thay',
  },
  {
    id: 'dv-5',
    name: 'Lò vi sóng Sharp 20L',
    type: 'Nhà bếp',
    roomNumber: '103',
    status: 'active',
    image: null,
    icon: 'Microwave',
    description: 'Công suất 800W',
  },
  {
    id: 'dv-6',
    name: 'Quạt trần Panasonic',
    type: 'Điện gia dụng',
    roomNumber: '103',
    status: 'active',
    image: null,
    icon: 'Fan',
    description: '3 cánh, 5 mức gió',
  },
  {
    id: 'dv-7',
    name: 'Đèn LED trần',
    type: 'Điện gia dụng',
    roomNumber: '104',
    status: 'active',
    image: null,
    icon: 'Lightbulb',
    description: 'Ánh sáng trắng 24W',
  },
  {
    id: 'dv-8',
    name: 'Giường ngủ gỗ 1m6',
    type: 'Nội thất',
    roomNumber: '104',
    status: 'active',
    image: null,
    icon: 'BedDouble',
    description: 'Gỗ công nghiệp, kèm nệm',
  },
  {
    id: 'dv-9',
    name: 'Ghế sofa đơn',
    type: 'Nội thất',
    roomNumber: '105',
    status: 'active',
    image: null,
    icon: 'Sofa',
    description: 'Bọc nỉ màu xám',
  },
  {
    id: 'dv-10',
    name: 'Tủ quần áo 3 cánh',
    type: 'Nội thất',
    roomNumber: '105',
    status: 'active',
    image: null,
    icon: 'Shirt',
    description: 'Có gương soi',
  },
  {
    id: 'dv-11',
    name: 'Modem Wifi FPT',
    type: 'Điện gia dụng',
    roomNumber: '201',
    status: 'active',
    image: null,
    icon: 'Router',
    description: 'Băng tần kép 2.4/5GHz',
  },
  {
    id: 'dv-12',
    name: 'Camera an ninh Imou',
    type: 'An ninh',
    roomNumber: '201',
    status: 'active',
    image: null,
    icon: 'Cctv',
    description: 'Xoay 360°, có đàm thoại',
  },
  {
    id: 'dv-13',
    name: 'Bình nóng lạnh Ariston',
    type: 'Điện gia dụng',
    roomNumber: '202',
    status: 'maintenance',
    image: null,
    icon: 'Flame',
    description: 'Đang rò điện nhẹ, cần kiểm tra',
  },
  {
    id: 'dv-14',
    name: 'Vòi sen nóng lạnh',
    type: 'Khác',
    roomNumber: '202',
    status: 'active',
    image: null,
    icon: 'ShowerHead',
    description: 'Vòi tăng áp inox',
  },
  {
    id: 'dv-15',
    name: 'Bếp gas đôi Rinnai',
    type: 'Nhà bếp',
    roomNumber: '203',
    status: 'active',
    image: null,
    icon: 'CookingPot',
    description: 'Kèng đánh lửa IC',
  },
  {
    id: 'dv-16',
    name: 'Bồn tắm nằm',
    type: 'Khác',
    roomNumber: '203',
    status: 'broken',
    image: null,
    icon: 'Bath',
    description: 'Nứt mép bồn, chờ thay mới',
  },
  {
    id: 'dv-17',
    name: 'Khóa cửa thông minh',
    type: 'An ninh',
    roomNumber: '204',
    status: 'active',
    image: null,
    icon: 'Lock',
    description: 'Mở bằng vân tay & mã PIN',
  },
  {
    id: 'dv-18',
    name: 'Bàn làm việc',
    type: 'Nội thất',
    roomNumber: '204',
    status: 'active',
    image: null,
    icon: 'Table',
    description: 'Mặt gỗ 1m2, kèm ngăn kéo',
  },
];

const createId = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `dv-${Date.now()}-${Math.random().toString(16).slice(2)}`);

export const useDevices = () => {
  const [devices, setDevices] = useState(INITIAL_DEVICES);

  const addDevice = (data) => {
    const newDevice = { ...data, id: createId() };
    setDevices((prev) => [newDevice, ...prev]);
    return newDevice;
  };

  const editDevice = (deviceId, data) => {
    setDevices((prev) =>
      prev.map((device) =>
        device.id === deviceId ? { ...device, ...data, id: deviceId } : device
      )
    );
  };

  const removeDevice = (deviceId) => {
    setDevices((prev) => prev.filter((device) => device.id !== deviceId));
  };

  const changeDeviceStatus = (deviceId, status) => {
    setDevices((prev) =>
      prev.map((device) =>
        device.id === deviceId ? { ...device, status } : device
      )
    );
  };

  return {
    devices,
    addDevice,
    editDevice,
    removeDevice,
    changeDeviceStatus,
  };
};
