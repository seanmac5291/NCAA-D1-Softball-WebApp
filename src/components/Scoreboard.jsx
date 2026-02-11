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
    return <div className="loading">Loading games...</div>;
  }

  // Ensure games.games is always an array
  const gamesList = Array.isArray(games.games) ? games.games : [];

  return (
    <div className="scoreboard">
      <h2>{games.title || 'NCAA Softball Scoreboard'}</h2>

      <div className="date-select">
        <button onClick={handleToday} className="today-button">Today</button>
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
        />
      </div>

      <div className="display-date">
        <strong>Date:</strong> {games.date || new Date().toLocaleDateString()}
      </div>

      {gamesList.length === 0 ? (
        <div className="no-games">No games scheduled for this date.</div>
      ) : (
        <div className="games-grid">
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
              <div key={safeGame.id} className="game-card">
                <div className="game-status">
                  <span className={`status-indicator ${safeGame.gameState}`}></span>
                  <span className="status-text">{safeGame.currentPeriod}</span>
                </div>

                <div className="teams-container">
                  <div className="team away">
                    <span className="team-name">{safeGame.away.names.short}</span>
                    <span className="team-score">{safeGame.away.score}</span>
                  </div>
                  <div className="team home">
                    <span className="team-name">{safeGame.home.names.short}</span>
                    <span className="team-score">{safeGame.home.score}</span>
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