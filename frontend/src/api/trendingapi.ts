import axios from 'axios';

const BASE_URL = '/api/trending';
export const fetchTrendingAlerts = async () => {
  const response = await axios.get(BASE_URL);
  return response.data.data;
};
