import './TournamentBracket.css';

const TournamentBracket = ({ bracketData }) => {
  if (!bracketData) {
    return <div className="loading">Loading tournament bracket...</div>;
  }

  return (
    <div className="tournament-bracket">
      <div className="bracket-header">
        <h2>{bracketData.title}</h2>
        <p className="last-updated">Last Updated: {bracketData.lastUpdated}</p>
      </div>

      {/* Champion display (if tournament is complete) */}
      {bracketData.champion && (
        <div className="champion-container">
          <div className="champion-card">
            <h3 className="champion-title">National Champions</h3>
            <div className="champion-team">{bracketData.champion}</div>
          </div>
        </div>
      )}

      {/* World Series section */}
      <div className="bracket-section">
        <h3 className="section-title">Women's College World Series</h3>
        
        <div className="wcws-container">
          {bracketData.worldSeries.matches.length > 0 ? (
            <div className="wcws-matches">
              {bracketData.worldSeries.matches.map((match, index) => (
                <div key={`wcws-${index}`} className="match-card">
                  <div className="match-header">
                    <div className="match-round">{match.round}</div>
                    <div className="match-number">Game {match.gameNumber}</div>
                  </div>
                  
                  <div className="match-teams">
                    {match.teams.map((team, teamIndex) => (
                      <div 
                        key={`wcws-${index}-team-${teamIndex}`} 
                        className={`match-team ${team.isWinner ? 'winner' : ''}`}
                      >
                        <div className="team-seed">{team.seed}</div>
                        <div className="team-name">{team.name || 'TBD'}</div>
                        <div className="team-score">{team.score}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="match-info">
                    <div className="match-date">{match.gameDate}</div>
                    <div className="match-time">{match.gameTime}</div>
                    <div className="match-location">{match.gameLocation}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-bracket-section">
              Women's College World Series not yet available
            </div>
          )}
        </div>
      </div>

      {/* Regionals and Super Regionals */}
      <div className="bracket-section">
        <h3 className="section-title">Regionals & Super Regionals</h3>
        
        {bracketData.regionals.length > 0 ? (
          <div className="regionals-grid">
            {bracketData.regionals.map((regional, regionalIndex) => (
              <div key={`regional-${regionalIndex}`} className="regional-container">
                <h4 className="regional-title">{regional.name}</h4>
                
                <div className="regional-matches">
                  {regional.matches.map((match, matchIndex) => (
                    <div key={`regional-${regionalIndex}-match-${matchIndex}`} className="match-card">
                      <div className="match-header">
                        <div className="match-round">{match.round}</div>
                        <div className="match-number">Game {match.gameNumber}</div>
                      </div>
                      
                      <div className="match-teams">
                        {match.teams.map((team, teamIndex) => (
                          <div 
                            key={`regional-${regionalIndex}-match-${matchIndex}-team-${teamIndex}`} 
                            className={`match-team ${team.isWinner ? 'winner' : ''}`}
                          >
                            <div className="team-seed">{team.seed}</div>
                            <div className="team-name">{team.name || 'TBD'}</div>
                            <div className="team-score">{team.score}</div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="match-info">
                        <div className="match-date">{match.gameDate}</div>
                        <div className="match-time">{match.gameTime}</div>
                        <div className="match-location">{match.gameLocation}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-bracket-section">
            Regional information not yet available
          </div>
        )}
      </div>
      
      <div className="bracket-footer">
        <p>Visit <a href="https://www.ncaa.com/brackets/softball/d1/2025" target="_blank" rel="noopener noreferrer">NCAA.com</a> for the official tournament bracket</p>
      </div>
    </div>
  );
};

export default TournamentBracket;