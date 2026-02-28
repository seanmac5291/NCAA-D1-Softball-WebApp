import React from 'react';
import './StatLeaders.css';

const StatLeaders = ({ statData, activeCategory, onCategoryChange }) => {
  // Use the activeCategory prop from parent instead of local state
  // This ensures synchronization between parent and child components
  
  const categories = [
    // Batting Categories
    { id: 'batting', label: 'Batting Average', group: 'batting' },
    { id: 'hits', label: 'Hits', group: 'batting' },
    { id: 'homeRuns', label: 'Home Runs', group: 'batting' },
    { id: 'obp', label: 'On-Base %', group: 'batting' },
    { id: 'slg', label: 'Slugging %', group: 'batting' },
    
    // Pitching Categories
    { id: 'era', label: 'ERA', group: 'pitching' },
    { id: 'strikeoutsPerSeven', label: 'K/7 Innings', group: 'pitching' },
    { id: 'strikeoutsTotal', label: 'Strikeouts', group: 'pitching' }
  ];
  
  const handleCategoryChange = (categoryId) => {
    if (onCategoryChange) {
      console.log('StatLeaders: Changing category to', categoryId);
      onCategoryChange(categoryId);
    }
  };
  
  // Determine if we're in a loading state
  const isLoading = 
    !statData || 
    statData.isLoading || 
    !Array.isArray(statData.leaders) || 
    statData.leaders.length === 0;
  
  // Filter categories by group to display them in separate sections
  const battingCategories = categories.filter(cat => cat.group === 'batting');
  const pitchingCategories = categories.filter(cat => cat.group === 'pitching');
  
  // Always render the category tabs, even during loading
  const renderCategoryTabs = () => (
    <div className="category-sections">
      <div className="category-section">
        <h3 className="section-title">Batting Stats</h3>
        <div className="category-tabs" role="tablist" aria-label="Batting statistics categories">
          {battingCategories.map(category => (
            <button 
              key={category.id}
              className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category.id)}
              role="tab"
              aria-selected={activeCategory === category.id}
              aria-controls="stats-content"
              id={`tab-${category.id}`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="category-section">
        <h3 className="section-title">Pitching Stats</h3>
        <div className="category-tabs" role="tablist" aria-label="Pitching statistics categories">
          {pitchingCategories.map(category => (
            <button 
              key={category.id}
              className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category.id)}
              role="tab"
              aria-selected={activeCategory === category.id}
              aria-controls="stats-content"
              id={`tab-${category.id}`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Format value based on category
  const formatValue = (value, category) => {
    switch(category) {
      case 'batting':
      case 'obp':
      case 'slg':
        // Format with 3 decimal places for percentages
        return typeof value === 'number' ? value.toFixed(3).replace(/^0+/, '') : value;
      case 'era':
        // Format with 2 decimal places for ERA
        return typeof value === 'number' ? value.toFixed(2) : value;
      default:
        return value;
    }
  };

  // Get the column label based on category
  const getColumnLabel = () => {
    switch(activeCategory) {
      case 'batting': return 'AVG';
      case 'hits': return 'H';
      case 'homeRuns': return 'HR';
      case 'obp': return 'OB%';
      case 'slg': return 'SLG%';
      case 'era': return 'ERA';
      case 'strikeoutsTotal': return 'SO';
      case 'strikeoutsPerSeven': return 'K/7';
      default: return 'Value';
    }
  };

  // Render the correct additional stat columns based on category
  const renderAdditionalStatHeaders = () => {
    switch(activeCategory) {
      case 'batting':
        return (
          <>
            <th scope="col">G</th>
            <th scope="col">AB</th>
            <th scope="col">H</th>
          </>
        );
      case 'hits':
        return (
          <>
            <th scope="col">G</th>
            {/* Removed AVG column for Hits */}
          </>
        );
      case 'homeRuns':
        return (
          <>
            <th scope="col">G</th>
            <th scope="col">HR/G</th>
          </>
        );
      case 'obp':
        return (
          <>
            <th scope="col">G</th>
            <th scope="col">AB</th>
            <th scope="col">H</th>
            <th scope="col">BB</th>
            <th scope="col">HBP</th>
          </>
        );
      case 'slg':
        return (
          <>
            <th scope="col">G</th>
            <th scope="col">AB</th>
            <th scope="col">TB</th>
          </>
        );
      case 'era':
        return (
          <>
            <th scope="col">APP</th>
            <th scope="col">IP</th>
            <th scope="col">ER</th>
          </>
        );
      case 'strikeoutsPerSeven':
        return (
          <>
            <th scope="col">APP</th>
            <th scope="col">IP</th>
            <th scope="col">SO</th>
          </>
        );
      case 'strikeoutsTotal':
        return (
          <>
            <th scope="col">APP</th>
            {/* removed IP and K/7 for Strikeouts */}
          </>
        );
      default:
        return null;
    }
  };

  // Render additional stat values for a leader
  const renderAdditionalStatValues = (leader) => {
    const additionalStats = leader.additionalStats || {};
    
    switch(activeCategory) {
      case 'batting':
        return (
          <>
            <td>{additionalStats.g || '-'}</td>
            <td>{additionalStats.ab || '-'}</td>
            <td>{additionalStats.h || '-'}</td>
          </>
        );
      case 'hits':
        return (
          <>
            <td>{additionalStats.g || '-'}</td>
            {/* Removed AVG cell for Hits */}
          </>
        );
      case 'homeRuns':
        return (
          <>
            <td>{additionalStats.g || '-'}</td>
            <td>{additionalStats.hr_g ? additionalStats.hr_g.toFixed(2) : '-'}</td>
          </>
        );
      case 'obp':
        return (
          <>
            <td>{additionalStats.g || '-'}</td>
            <td>{additionalStats.ab || '-'}</td>
            <td>{additionalStats.h || '-'}</td>
            <td>{additionalStats.bb || '-'}</td>
            <td>{additionalStats.hbp || '-'}</td>
          </>
        );
      case 'slg':
        return (
          <>
            <td>{additionalStats.g || '-'}</td>
            <td>{additionalStats.ab || '-'}</td>
            <td>{additionalStats.tb || '-'}</td>
          </>
        );
      case 'era':
        return (
          <>
            <td>{additionalStats.app || '-'}</td>
            <td>{additionalStats.ip || '-'}</td>
            <td>{additionalStats.er || '-'}</td>
          </>
        );
      case 'strikeoutsPerSeven':
        return (
          <>
            <td>{additionalStats.app || '-'}</td>
            <td>{additionalStats.ip || '-'}</td>
            <td>{additionalStats.so || '-'}</td>
          </>
        );
      case 'strikeoutsTotal':
        return (
          <>
            <td>{additionalStats.app || '-'}</td>
            {/* removed IP and K/7 values */}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="stat-leaders">      
      {/* Always show category tabs */}
      {renderCategoryTabs()}
      
      <div id="stats-content" role="tabpanel" aria-labelledby={`tab-${activeCategory}`}>
        {isLoading ? (
          <div className="loading" role="status" aria-live="polite">
            Loading statistical leaders...
          </div>
        ) : (
          <>
            <h2 className="category-title">{statData.category}</h2>
            
            <div className="stats-table-container">
              <table className="stats-table" role="table" aria-label={`${statData.category} statistical leaders`}>
                <caption>Top NCAA Division I Softball players in {statData.category}</caption>
                <thead>
                  <tr>
                    <th scope="col">Rank</th>
                    <th scope="col">Player</th>
                    <th scope="col">Team</th>
                    <th scope="col">Class</th>
                    <th scope="col">Position</th>
                    {renderAdditionalStatHeaders()}
                    <th scope="col">{getColumnLabel()}</th>
                  </tr>
                </thead>
                <tbody>
                  {statData.leaders.map((leader) => (
                    <tr key={`${leader.rank}-${leader.player.name}-${leader.team.name}`}>
                      <td className="rank">{leader.rank}</td>
                      <td>{leader.player.name}</td>
                      <td>{leader.team.name}</td>
                      <td>{leader.player.classYear || '-'}</td>
                      <td>{leader.player.position}</td>
                      {renderAdditionalStatValues(leader)}
                      <td className="stat-value">{formatValue(leader.value, activeCategory)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="update-info">
              <p>Data Source: NCAA.com</p>
              <p>Last Updated: {statData.updated || new Date().toLocaleDateString()}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StatLeaders;