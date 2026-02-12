import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://api-v3.mbta.com',
  headers: {
    'Accept': 'application/vnd.api+json',
  },
});

export default apiClient;
