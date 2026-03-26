// Central API configuration for both local dev and Azure production
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default API_URL;
