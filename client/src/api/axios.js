import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000/api', // adjust based on your backend
  headers: {
    'Content-Type': 'application/json',
  },
});

export default instance;
