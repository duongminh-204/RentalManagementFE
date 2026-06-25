import { useState, useEffect } from 'react';
import * as dashboardApi from '../api/dashboardApi';
import { getApiErrorMessage } from '../../../utils/apiError';

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
    lockedFeatures: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = async () => {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const dashboardData = await dashboardApi.getAllDashboardData(month, year);
    setData({
      stats: dashboardData.stats ?? emptyDashboardData.stats,
      roomStats: dashboardData.roomStats ?? emptyDashboardData.roomStats,
      debtInfo: dashboardData.debtInfo ?? emptyDashboardData.debtInfo,
      revenue: dashboardData.revenue ?? emptyDashboardData.revenue,
      lockedFeatures: dashboardData.lockedFeatures ?? [],
    });
    setError(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await loadDashboard();
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(getApiErrorMessage(err, 'Lỗi khi tải dữ liệu dashboard'));
        setData({ ...emptyDashboardData, lockedFeatures: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const refetch = async () => {
    try {
      await loadDashboard();
    } catch (err) {
      console.error('Error refetching dashboard data:', err);
      setError(getApiErrorMessage(err, 'Lỗi khi tải lại dữ liệu dashboard'));
    }
  };

  return { ...data, loading, error, refetch };
};
