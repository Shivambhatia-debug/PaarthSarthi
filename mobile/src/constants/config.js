// Change this to your deployed backend URL in production
// For Android emulator: http://10.0.2.2:5000
// For iOS simulator: http://localhost:5000
// For physical device: use your computer's local IP (e.g., http://192.168.x.x:5000)

const DEV_API_URL = 'http://10.185.221.68:5000';
const PROD_API_URL = 'https://your-backend.onrender.com'; // Update this for production

const isDev = __DEV__;

export default {
  API_BASE_URL: isDev ? DEV_API_URL : PROD_API_URL,
  API_URL: isDev ? `${DEV_API_URL}/api` : `${PROD_API_URL}/api`,
  APP_NAME: 'ParthSarthi',
  APP_TAGLINE: 'Accelerate your career',
  VERSION: '1.0.0',
  PAGINATION_LIMIT: 10,
};
