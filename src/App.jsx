import { useState, useEffect, useRef } from 'react'
import './App.css'
import { fetchTeamRankings, fetchStatLeaders } from './services/softballAPI';
import TeamRankings from './components/TeamRankings';
import StatLeaders from './components/StatLeaders';

function App() {
  const [rankings, setRankings] = useState(null);
  const [statData, setStatData] = useState(null);
  const [activeStatCategory, setActiveStatCategory] = useState('batting');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('rankings'); // Default to rankings tab
  const initialStatCategoryRef = useRef(activeStatCategory);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching initial data...');

        // Fetch rankings
        try {
          const rankingsData = await fetchTeamRankings();
          console.log('Rankings data received');
          setRankings(rankingsData);
        } catch (rankingsError) {
          console.error('Error fetching rankings:', rankingsError);
          setError('Failed to load rankings. Please try again later.');
        }

        // Fetch initial stats data
        try {
          const initialStatData = await fetchStatLeaders(initialStatCategoryRef.current);
          console.log('Stats data received');
          setStatData(initialStatData);
        } catch (statsError) {
          console.error('Error fetching stats:', statsError);
          setError('Failed to load statistics. Please try again later.');
        }

        setLoading(false);
      } catch (err) {
        console.error('Error in main data fetch:', err);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, [activeStatCategory]);

  // Handle stat category change
  const handleCategoryChange = async (category) => {
    console.log('Changing category to:', category);
    setActiveStatCategory(category);
    
    try {
      // Show loading state for this category
      setStatData(prev => ({ 
        ...prev, 
        isLoading: true,
        category: getCategoryTitle(category) 
      }));
      
      const newStatData = await fetchStatLeaders(category);
      console.log(`New stat data received for ${category}`);
      
      setStatData({
        ...newStatData,
        isLoading: false
      });
    } catch (err) {
      console.error(`Error fetching ${category} stats:`, err);
      setStatData(prev => ({
        ...prev,
        isLoading: false,
        error: `Failed to load ${getCategoryTitle(category)}. Please try again later.`
      }));
    }
  };
  
  // Helper function to get category title
  const getCategoryTitle = (category) => {
    const titles = {
      'batting': 'Batting Average',
      'hits': 'Hits',
      'homeRuns': 'Home Runs',
      'obp': 'On-Base Percentage',
      'slg': 'Slugging Percentage',
      'era': 'Earned Run Average',
      'strikeoutsPerSeven': 'Strikeouts Per Seven Innings',
      'strikeoutsTotal': 'Strikeouts'
    };
    return titles[category] || 'Statistical Leaders';
  };

  // Safely render the app even if some components might have issues
  const renderContent = () => {
    try {
      return (
        <div className="app-container">
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          
          <header className="app-header">
            <h1>NCAA D1 College Softball Stats & Rankings</h1>
            <p className="data-update-info">
              Data updated: {new Date().toLocaleDateString()}
            </p>
          </header>

          <nav className="app-navigation" role="navigation" aria-label="Main navigation">
            <ul>
              <li className={activeTab === 'rankings' ? 'active' : ''}>
                <button 
                  onClick={() => setActiveTab('rankings')}
                  aria-pressed={activeTab === 'rankings'}
                  aria-controls="main-content"
                >
                  Rankings
                </button>
              </li>
              <li className={activeTab === 'stats' ? 'active' : ''}>
                <button 
                  onClick={() => setActiveTab('stats')}
                  aria-pressed={activeTab === 'stats'}
                  aria-controls="main-content"
                >
                  Stat Leaders
                </button>
              </li>
            </ul>
          </nav>

          <main id="main-content" className="app-content">
            {activeTab === 'rankings' && (
              <div className="section-container">
                <TeamRankings rankings={rankings || { data: [] }} />
              </div>
            )}
            
            {activeTab === 'stats' && (
              <div className="section-container">
                <StatLeaders 
                  statData={statData || { category: 'Batting Average', leaders: [] }} 
                  activeCategory={activeStatCategory}
                  onCategoryChange={handleCategoryChange} 
                />
              </div>
            )}
          </main>

          <footer className="app-footer" role="contentinfo">
            <p>&copy; {new Date().getFullYear()} NCAA D1 College Softball Stats & Rankings | Data Sources: NCAA </p>
          </footer>
        </div>
      );
    } catch (renderError) {
      console.error('Render error:', renderError);
      return (
        <div className="error-container">
          <h2>Something went wrong</h2>
          <p>Please try refreshing the page</p>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="loading-container" role="status" aria-live="polite">
        <div className="spinner" aria-hidden="true"></div>
        <p>Loading NCAA D1 College Softball data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container" role="alert" aria-live="assertive">
        {error}
      </div>
    );
  }

  return renderContent();
}

export default App;
