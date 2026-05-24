import { useState, useEffect } from 'react';
import * as dashboardApi from '../api/dashboardApi';

const emptyDashboardData = {
  stats: {
    totalRooms: 0,
    occupiedRooms: 0,
    emptyRooms: 0,
    monthlyRevenue: 0,
    unpaidTenantsCount: 0,
    totalDebt: 0,
  },
  roomStats: {
    totalRooms: 0,
    occupiedRooms: 0,
    emptyRooms: 0,
  },
  debtInfo: {
    unpaidTenantsCount: 0,
    totalDebt: 0,
    topDebtors: [],
  },
  revenue: {
    monthlyRevenue: 0,
    targetRevenue: 0,
  },
};

export const useDashboard = () => {
  const [data, setData] = useState({
    stats: null,
    roomStats: null,
    debtInfo: null,
    revenue: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        const dashboardData = await dashboardApi.getAllDashboardData(month, year);
        setData(dashboardData);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Lỗi khi tải dữ liệu dashboard');
        setData(emptyDashboardData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const refetch = async () => {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    try {
      const dashboardData = await dashboardApi.getAllDashboardData(month, year);
      setData(dashboardData);
      setError(null);
    } catch (err) {
      console.error('Error refetching dashboard data:', err);
      setError(err.message || 'Lỗi khi tải lại dữ liệu dashboard');
    }
  };

  return { ...data, loading, error, refetch };
};
