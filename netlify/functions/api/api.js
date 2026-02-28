const axios = require('axios');

// NCAA API client with proper configuration
const ncaaApiClient = axios.create({
  baseURL: 'https://ncaa-api.henrygd.me',
  timeout: 15000,
  headers: {
    'User-Agent': 'College Softball App/1.0'
  }
});

/**
 * NCAA API Service for Netlify Functions
 * Simplified version of the ncaaWebScraper service
 */
class NCAAService {
  constructor() {
    // Use the current 'current/individual/{id}' endpoints for live data
    this.statsUrls = {
      batting: '/stats/softball/d1/current/individual/271', // Batting Average
      hits: '/stats/softball/d1/current/individual/1088',    // Hits
      homeRuns: '/stats/softball/d1/current/individual/514', // Home Runs
      obp: '/stats/softball/d1/current/individual/510',      // On-Base Percentage
      slg: '/stats/softball/d1/current/individual/343',      // Slugging Percentage
      era: '/stats/softball/d1/current/individual/276',      // Earned Run Average
      strikeoutsPerSeven: '/stats/softball/d1/current/individual/278', // Strikeouts Per Seven Innings
      strikeouts: '/stats/softball/d1/current/individual/539'  // Strikeouts (Total)
    };
    
    // Last request timestamp to enforce rate limiting
    this.lastRequestTime = 0;
    this.minRequestInterval = 1000; // 1 second between requests
  }

  /**
   * Wait for rate limit to avoid IP blocks
   */
  async respectRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      console.log(`Rate limiting: waiting ${waitTime}ms before next request`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Fetch team rankings using NCAA API
   */
  async fetchRankings() {
    await this.respectRateLimit();
    try {
      console.log('Fetching rankings from NCAA API');
      const { data } = await ncaaApiClient.get('/rankings/softball/d1');
      // Normalize each row: trim whitespace from keys, map variant field names
      const normalized = Array.isArray(data.data) ? data.data.map(item => {
        const row = {};
        for (const [k, v] of Object.entries(item)) {
          row[k.trim()] = v;
        }
        // Map either SCHOOL or TEAM -> COLLEGE (frontend expects COLLEGE)
        if (!row.COLLEGE) row.COLLEGE = row.SCHOOL || row.TEAM || '';
        // Map either PREVIOUS or PREVIOUS RANK -> PREVIOUS RANK (frontend expects PREVIOUS RANK)
        if (!row['PREVIOUS RANK']) row['PREVIOUS RANK'] = row.PREVIOUS || '';
        return row;
      }) : [];
      return {
        title: data.title || 'NCAA Division I Softball Rankings',
        updated: data.updated || new Date().toLocaleDateString(),
        data: normalized
      };
    } catch (error) {
      console.error('Error fetching rankings from NCAA API:', error.message);
      throw error;
    }
  }

  /**
   * Fetch statistics data using NCAA API (with pagination)
   */
  async fetchStats(category) {
    const endpoint = this.statsUrls[category];
    if (!endpoint) throw new Error(`Invalid category: ${category}`);
    await this.respectRateLimit();
    try {
      console.log(`Fetching ${category} stats from NCAA API`);
      // Fetch first page
      const initialResp = await ncaaApiClient.get(endpoint);
      const apiData = initialResp.data;
      let allStats = Array.isArray(apiData.data) ? [...apiData.data] : [];
      const totalPages = apiData.pages || 1;
      // Fetch subsequent pages if any
      for (let p = 2; p <= totalPages; p++) {
        await this.respectRateLimit();
        console.log(`Fetching page ${p} for ${category}`);
        const pageResp = await ncaaApiClient.get(`${endpoint}/p${p}`);
        if (Array.isArray(pageResp.data.data)) {
          allStats = allStats.concat(pageResp.data.data);
        }
      }
      // Replace data with combined stats
      apiData.data = allStats;
      return this.formatStatsData(apiData, category);
    } catch (error) {
      console.error(`Error fetching ${category} stats from NCAA API:`, error.message);
      throw error;
    }
  }

  /**
   * Format stats JSON from NCAA API to our application format
   */
  formatStatsData(apiData, category) {
    const result = {
      sport: 'Softball',
      category: this.getCategoryTitle(category),
      updated: apiData.updated || new Date().toLocaleDateString(),
      leaders: []
    };
    
    if (!apiData.data || !Array.isArray(apiData.data)) return result;

    apiData.data.slice(0, 50).forEach((item, index) => {
      let rank = parseInt(item.Rank || item.rank) || index + 1;
      let value = 0;
      const stats = {};

      // Category-specific mapping based on ncaaWebScraper.js and StatLeaders.jsx requirements
      switch (category) {
        case 'batting': // Batting Average
          value = parseFloat(item.BA || item.AVG || item.avg || item.ba) || 0;
          stats.g  = parseInt(item.G  || item.g)  || 0;
          stats.ab = parseInt(item.AB || item.ab) || 0;
          stats.h  = parseInt(item.H  || item.h)  || 0;
          break;
        case 'hits':
          value = parseInt(item.H || item.h) || 0;
          stats.g = parseInt(item.G || item.g) || 0;
          break;
        case 'homeRuns':
          value = parseInt(item.HR || item.hr) || 0;
          stats.g  = parseInt(item.G  || item.g)  || 0;
          stats.hr = parseInt(item.HR || item.hr) || 0; // For HR/G calculation
          stats.hr_g = stats.g > 0 ? parseFloat((stats.hr / stats.g).toFixed(2)) : 0;
          break;
        case 'obp': // On-Base Percentage
          // The API returns on-base percentage in the "PCT" field
          value = parseFloat(item.PCT || item.OBP || item.obp || 0);
          
          // Include all required fields for the StatLeaders component
          stats.g   = parseInt(item.G   || item.g)   || 0;
          stats.ab  = parseInt(item.AB  || item.ab)  || 0;
          stats.h   = parseInt(item.H   || item.h)   || 0;
          stats.bb  = parseInt(item.BB  || item.bb)  || 0;
          stats.hbp = parseInt(item.HBP || item.hbp) || 0;
          stats.sf  = parseInt(item.SF  || item.sf)  || 0;
          stats.sh  = parseInt(item.SH  || item.sh)  || 0;
          break;
        case 'slg': // Slugging Percentage
          // The API returns slugging percentage in "SLG PCT" field (with space)
          value = parseFloat(item["SLG PCT"] || item.SLG || item.slg) || 0;
          
          // Include only the fields exactly as shown on NCAA website
          stats.g  = parseInt(item.G || item.g) || 0;
          stats.ab = parseInt(item.AB || item.ab) || 0;
          stats.tb = parseInt(item.TB || item.tb) || 0;
          break;
        case 'era': // Earned Run Average
          value = parseFloat(item.ERA || item.era) || 0;
          stats.app = parseInt(item.App || item.APP || item.app) || 0;
          stats.ip  = parseFloat(item.IP || item.ip)  || 0;
          stats.er  = parseInt(item.ER || item.er)  || 0;
          break;
        case 'strikeoutsPerSeven': // K/7
          value = parseFloat(item['K/7'] || item.K7 || item.Value || item.value) || 0;
          stats.app = parseInt(item.App || item.APP || item.app) || 0;
          stats.ip  = parseFloat(item.IP || item.ip)  || 0;
          stats.so  = parseInt(item.SO  || item.so)   || 0;
          break;
        case 'strikeouts': // Total Strikeouts (maps from 'strikeoutsTotal' in UI)
          value = parseInt(item.SO || item.so || item.Value || item.value) || 0;
          stats.app = parseInt(item.App || item.APP || item.app) || 0;
          break;
        default:
          // Fallback for any unhandled category, though all should be covered.
          value = parseFloat(item.Value || item.value) || 0;
          // Attempt to grab common fields if they exist
          if (item.G !== undefined || item.g !== undefined) stats.g = parseInt(item.G || item.g) || 0;
          if (item.AB !== undefined || item.ab !== undefined) stats.ab = parseInt(item.AB || item.ab) || 0;
          if (item.H !== undefined || item.h !== undefined) stats.h = parseInt(item.H || item.h) || 0;
          break;
      }

      result.leaders.push({
        rank,
        player: { 
          name: item.Name || item.name || '', 
          position: item.Position || item.POS || item.pos || '', 
          classYear: item.Cl || item.cl || '' 
        },
        team: { name: item.Team || item.TEAM || item.team || '' },
        value,
        additionalStats: stats
      });
    });

    return result;
  }

  /**
   * Get a display-friendly title for a stat category
   */
  getCategoryTitle(category) {
    const titles = {
      batting: 'Batting Average',
      hits: 'Hits',
      homeRuns: 'Home Runs',
      obp: 'On-Base Percentage',
      slg: 'Slugging Percentage',
      era: 'Earned Run Average',
      strikeoutsPerSeven: 'Strikeouts Per Seven Innings',
      strikeouts: 'Strikeouts'
    };
    
    return titles[category] || 'Statistical Leaders';
  }
}

// Create instance of the service
const ncaaService = new NCAAService();

/**
 * Netlify serverless function handler
 */
exports.handler = async (event, _context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  // Handle OPTIONS request (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }
  
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }
  
  // Parse path - event.path may be the original /api/* path or the function path
  const rawPath = event.path || event.rawPath || '';
  const path = rawPath
    .replace('/.netlify/functions/api', '')
    .replace(/^\/api/, '');
  const segments = path.split('/').filter(Boolean);
  
  try {
    // Handle different API endpoints
    if (segments[0] === 'rankings') {
      const rankings = await ncaaService.fetchRankings();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(rankings)
      };
    } else if (segments[0] === 'stats' && segments[1]) {
      const category = segments[1];
      const stats = await ncaaService.fetchStats(category);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(stats)
      };
    } else {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Endpoint not found' })
      };
    }
  } catch (error) {
    console.error('API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Server error', 
        message: error.message 
      })
    };
  }
};