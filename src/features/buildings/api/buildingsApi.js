import api from '../../../utils/api';

export const getAllBuildings = async () => {
  const response = await api.get('/building');
  return response.data;
};

export const getBuildingById = async (id) => {
  const response = await api.get(`/building/${id}`);
  return response.data;
};

export const createBuilding = async (buildingData) => {
  const response = await api.post('/building', buildingData);
  return response.data;
};

export const updateBuilding = async (id, buildingData) => {
  const response = await api.put(`/building/${id}`, buildingData);
  return response.data;
};

export const deleteBuilding = async (id) => {
  const response = await api.delete(`/building/${id}`);
  return response.data;
};
