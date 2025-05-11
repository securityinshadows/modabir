import axiosInstance from '../utils/axiosInstance';
import { Alert } from '../utils/types';

// AXIOS INSANCE USES BASEURL
export const fetchAlerts = async (
  filters?: { [key: string]: string | boolean | { latitude: number; longitude: number } | undefined }
): Promise<Alert[]> => {
  try {
    const response = await axiosInstance.get('/alerts', { params: filters });
    return response.data?.data ?? [];
  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }
};

export const updateAlert = async (id: string, updatedData: Partial<Alert>) => {
  const response = await axiosInstance.put(`/alerts/${id}`, updatedData);
  return response.data.data;
};


export const fetchReports = async () => {
  try {
    const response = await axiosInstance.get('/reports');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};