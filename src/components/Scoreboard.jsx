import { useState, useEffect } from 'react';
import './Scoreboard.css';

const Scoreboard = ({ games, onDateChange }) => {
  // Helper to get today's date in YYYY-MM-DD for input
  const getTodayInput = () => new Date().toISOString().split('T')[0];
  // Convert YYYY-MM-DD to YYYYMMDD for API
  const formatDateParam = (dateStr) => dateStr.replace(/-/g, '');

  const [selectedDate, setSelectedDate] = useState(getTodayInput());

  // Notify parent on initial load
  useEffect(() => {
    onDateChange(formatDateParam(selectedDate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    onDateChange(formatDateParam(newDate));
  };

  const handleToday = () => {
    const today = getTodayInput();
    setSelectedDate(today);
    onDateChange(formatDateParam(today));
  };

  if (!games) {
    return (
      <div className="loading" role="status" aria-live="polite">
        Loading games...
      </div>
    );
  }

  // Ensure games.games is always an array
  const gamesList = Array.isArray(games.games) ? games.games : [];

  return (
    <div className="scoreboard">
      <h2>{games.title || 'NCAA Softball Scoreboard'}</h2>

      <div className="date-select" role="group" aria-labelledby="date-selection-heading">
        <h3 id="date-selection-heading" className="visually-hidden">Select Game Date</h3>
        <button onClick={handleToday} className="today-button" aria-describedby="current-date">
          Today
        </button>
        <label htmlFor="game-date" className="visually-hidden">
          Select date for games
        </label>
        <input
          id="game-date"
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          aria-describedby="current-date"
        />
      </div>

      <div id="current-date" className="display-date" aria-live="polite">
        <strong>Date:</strong> {games.date || new Date().toLocaleDateString()}
      </div>

      {gamesList.length === 0 ? (
        <div className="no-games" role="status">
          No games scheduled for this date.
        </div>
      ) : (
        <div className="games-grid" role="list" aria-label="Game scores and status">
          {gamesList.map((game) => {
            // Ensure game has all required properties with defaults
            const safeGame = {
              id: game?.id || `game-${Math.random()}`,
              gameState: game?.gameState || 'scheduled',
              currentPeriod: game?.currentPeriod || '',
              home: {
                names: {
                  short: game?.home?.names?.short || 'Home Team',
                  seo: game?.home?.names?.seo || 'HOME'
                },
                score: game?.home?.score || '0'
              },
              away: {
                names: {
                  short: game?.away?.names?.short || 'Away Team',
                  seo: game?.away?.names?.seo || 'AWAY'
                },
                score: game?.away?.score || '0'
              }
            };
            
            return (
              <div 
                key={safeGame.id} 
                className="game-card" 
                role="listitem"
                aria-label={`${safeGame.away.names.short} ${safeGame.away.score}, ${safeGame.home.names.short} ${safeGame.home.score}, ${safeGame.currentPeriod || 'Scheduled'}`}
              >
                <div className="game-status" role="status" aria-live="polite">
                  <span className={`status-indicator ${safeGame.gameState}`} aria-hidden="true"></span>
                  <span className="status-text">{safeGame.currentPeriod}</span>
                </div>

                <div className="teams-container" role="group" aria-label="Team scores">
                  <div className="team away" role="group" aria-label={`Away team: ${safeGame.away.names.short}`}>
                    <span className="team-name">{safeGame.away.names.short}</span>
                    <span className="team-score" aria-label={`Score: ${safeGame.away.score}`}>{safeGame.away.score}</span>
                  </div>
                  <div className="team home" role="group" aria-label={`Home team: ${safeGame.home.names.short}`}>
                    <span className="team-name">{safeGame.home.names.short}</span>
                    <span className="team-score" aria-label={`Score: ${safeGame.home.score}`}>{safeGame.home.score}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="update-info">
        <p>Last Updated: {games.updated || new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

export default Scoreboard;