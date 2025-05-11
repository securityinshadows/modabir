import axiosInstance from '../utils/axiosInstance';
import { Zone, Route } from '../utils/types';

// Zone CRUD Operations
export const createZone = async (zoneData: Omit<Zone, '_id'>) => {
  const response = await axiosInstance.post('/zones', zoneData);
  return response.data;
};

export const updateZone = async (id: string, zoneData: Partial<Zone>) => {
  const response = await axiosInstance.put(`/zones/${id}`, zoneData);
  return response.data;
};

export const deleteZone = async (id: string) => {
  const response = await axiosInstance.delete(`/zones/${id}`);
  return response.data;
};

export const getZones = async () => {
    const response = await axiosInstance.get('/zones');
    // Extract the "data" field from the response
    return response.data?.data || [];
  };

// Route CRUD Operations
export const createRoute = async (routeData: Omit<Route, '_id'> & { start: [number, number]; end: [number, number] }) => {
    const response = await axiosInstance.post('/routes/generate', routeData);
    return response.data;
  };

export const updateRoute = async (id: string, routeData: Partial<Route>) => {
  const response = await axiosInstance.put(`/routes/${id}`, routeData);
  return response.data;
};

export const deleteRoute = async (id: string) => {
  const response = await axiosInstance.delete(`/routes/${id}`);
  return response.data;
};

export const getRoutes = async () => {
    const response = await axiosInstance.get('/routes');
    // Extract the "data" field from the response
    return response.data?.data || [];
  };