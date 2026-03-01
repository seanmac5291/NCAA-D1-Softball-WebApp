import React from 'react';
import './TeamRankings.css';

const TeamRankings = ({ rankings }) => {
  // Early return if no data is available
  if (!rankings || !rankings.data || rankings.data.length === 0) {
    return (
      <div className="loading" role="status" aria-live="polite">
        Loading rankings...
      </div>
    );
  }

  return (
    <div className="team-rankings">
      <h2>NCAA D1 Softball Team Rankings</h2>
      <div className="rankings-table-container">
        <table className="rankings-table" role="table" aria-label="NCAA D1 Softball Team Rankings">
          <caption>Current NCAA Division I Softball team rankings with records and points</caption>
          <thead>
            <tr>
              <th scope="col">Rank</th>
              <th scope="col" className="team-column">Team</th>
              <th scope="col">Record</th>
              <th scope="col">Points</th>
              <th scope="col">Previous Rank</th>
            </tr>
          </thead>
          <tbody>
            {rankings.data.map((item) => (
              <tr key={item.RANK}>
                <td className="rank">{item.RANK}</td>
                <td className="team">
                  <span>{item.COLLEGE}</span>
                </td>
                <td>{item.RECORD}</td>
                <td>{item.POINTS}</td>
                <td>{item["PREVIOUS RANK"]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="update-info">
          <p>Source: {rankings.title}</p>
          <p>Last Updated: {rankings.updated}</p>
        </div>
      </div>
    </div>
  );
};

export default TeamRankings;