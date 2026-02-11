import axios from 'axios';

// Determine the API base URL based on Vite's mode and env
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD
  ? '/api' // For Netlify production builds (redirected to the function)
  : 'http://localhost:5003/api/softball'); // For local development

console.log('Frontend connecting to backend at:', API_BASE_URL);
// Log Vite environment mode for debugging
console.log('Is production (import.meta.env.PROD):', import.meta.env.PROD);
console.log('Is development (import.meta.env.DEV):', import.meta.env.DEV);

// Create axios instance for our backend with longer timeout
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000 // 30 seconds to account for puppeteer/scraping time
});

/**
 * Fetch team rankings (ESPN poll)
 */
export const fetchTeamRankings = async () => {
  try {
    console.log('Frontend: Fetching team rankings from backend...');
    const response = await apiClient.get('/rankings');
    console.log('Frontend: Received team rankings with', response.data?.data?.length || 0, 'teams');
    return response.data;
  } catch (error) {
    console.error('Error fetching team rankings:', error.message);
    throw error;
  }
};

/**
 * Fetch statistical leaders
 */
export const fetchStatLeaders = async (category = 'batting') => {
  try {
    console.log(`Frontend: Fetching ${category} stats from backend...`);
    const response = await apiClient.get(`/stats/${category}`);
    console.log('Frontend: Received stats data with', response.data?.leaders?.length || 0, 'players');
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${category} stats:`, error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};