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
 * NCAA API Service
 * Uses the official NCAA API at ncaa-api.henrygd.me for all data
 */
class NCAAWebScraperService {
  constructor() {
    // Use the current 'current/individual/{id}' endpoints for live data
    this.statsUrls = {
      batting: '/stats/softball/d1/current/individual/271',
      hits: '/stats/softball/d1/current/individual/1088',
      homeRuns: '/stats/softball/d1/current/individual/514',
      obp: '/stats/softball/d1/current/individual/510',
      slg: '/stats/softball/d1/current/individual/343',
      era: '/stats/softball/d1/current/individual/276',
      strikeoutsPerSeven: '/stats/softball/d1/current/individual/278',
      strikeouts: '/stats/softball/d1/current/individual/539'
    };
    
    // Last request timestamp to enforce rate limiting
    this.lastRequestTime = 0;
    this.minRequestInterval = 1000; // 1 second between requests (5 req/sec limit)
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
      return {
        title: data.title || 'NCAA Division I Softball Rankings',
        updated: data.updated || new Date().toLocaleDateString(),
        data: Array.isArray(data.data) ? data.data : []
      };
    } catch (error) {
      console.error('Error fetching rankings from NCAA API:', error.message);
      throw error;
    }
  }

  /**
   * Fetch statistics data using NCAA API
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
      // Format into application shape
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

      // Category-specific mapping
      switch (category) {
        case 'batting':
          value = parseFloat(item.BA || item.AVG || item.avg || item.ba) || 0;
          stats.g  = parseInt(item.G  || item.g)  || 0;
          stats.ab = parseInt(item.AB || item.ab) || 0;
          stats.h  = parseInt(item.H  || item.h)  || 0;
          break;
        case 'hits':
          value = parseInt(item.H || item.h) || 0;
          stats.g = parseInt(item.G || item.g) || 0;
          // AVG is not available in hits endpoint
          break;
        case 'homeRuns':
          value = parseInt(item.HR || item.hr) || 0;
          stats.g  = parseInt(item.G  || item.g)  || 0;
          stats.hr = parseInt(item.HR || item.hr) || 0;
          stats.hr_g = stats.g > 0 ? +(stats.hr / stats.g).toFixed(2) : 0;
          break;
        case 'obp': {
          // Map OBP stats including SF and SH
          stats.g   = parseInt(item.G   || item.g)   || 0;
          stats.ab  = parseInt(item.AB  || item.ab)  || 0;
          stats.h   = parseInt(item.H   || item.h)   || 0;
          stats.bb  = parseInt(item.BB  || item.bb)  || 0;
          stats.hbp = parseInt(item.HBP || item.hbp) || 0;
          stats.sf  = parseInt(item.SF  || item.sf)  || 0;
          stats.sh  = parseInt(item.SH  || item.sh)  || 0;
          // Calculate OBP: (H + BB + HBP) / (AB + BB + HBP + SF)
          const numerator = stats.h + stats.bb + stats.hbp;
          const denominator = stats.ab + stats.bb + stats.hbp + stats.sf;
          value = denominator > 0 ? parseFloat((numerator / denominator).toFixed(3)) : 0;
          break;
        }
        case 'slg':
          value = parseFloat(item.SLG || item.slg) || 0;
          stats.g    = parseInt(item.G    || item.g)    || 0;
          stats.ab   = parseInt(item.AB   || item.ab)   || 0;
          stats.h    = parseInt(item.H    || item.h)    || 0;
          stats['2b'] = parseInt(item['2B']   || item['2b'])   || 0;
          stats['3b'] = parseInt(item['3B']   || item['3b'])   || 0;
          stats.hr   = parseInt(item.HR   || item.hr)   || 0;
          break;
        case 'era':
          value = parseFloat(item.ERA || item.era) || 0;
          stats.app = parseInt(item.App || item.APP || item.app) || 0;
          stats.ip  = parseFloat(item.IP || item.ip)  || 0;
          stats.er  = parseInt(item.ER || item.er)  || 0;
          stats.r = parseInt(item.R || item.r) || 0;
          break;
        case 'strikeoutsPerSeven': {
          stats.app = parseInt(item.App || item.APP || item.app) || 0;
          stats.ip  = parseFloat(item.IP || item.ip)  || 0;
          stats.so  = parseInt(item.SO || item.so)    || 0;
          // Correctly parse K/7 rate
          const k7 = parseFloat(item['K/7'] || item.K7) || 0;
          value = k7;
          break;
        }
        case 'strikeouts': {
          // Total strikeouts mapping
          stats.app = parseInt(item.App || item.APP || item.app) || 0;
          stats.so  = parseInt(item.SO  || item.so)         || 0;
          value = stats.so;
          break;
        }
        default:
          value = parseFloat(item.Value || item.value) || 0;
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

module.exports = new NCAAWebScraperService();