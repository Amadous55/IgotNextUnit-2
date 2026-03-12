import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './Profile.css';

function timeAgo(isoString) {
  if (!isoString) return '';
  const seconds = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [checkins, setCheckins] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    Promise.all([
      fetch(`/api/users/${user.username}/checkins`).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch(`/api/users/${user.username}/ratings`).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
    ]).then(([checkinsData, ratingsData]) => {
      setCheckins(checkinsData);
      setRatings(ratingsData);
      setLoading(false);
    }).catch(() => {
      setFetchError(true);
      setLoading(false);
    });
  }, [user, navigate]);

  if (!user) return null;

  if (fetchError) return (
    <div className="profile-page">
      <button className="profile-back-btn" onClick={() => navigate('/')}>← Back</button>
      <p style={{ color: '#888', textAlign: 'center', marginTop: '60px' }}>
        Could not load profile data. Make sure the server is running.
      </p>
    </div>
  );

  const initials = user.username.slice(0, 2).toUpperCase();

  // Find favorite court (most checked into)
  const courtCounts = checkins.reduce((acc, c) => {
    const name = c.court?.name || 'Unknown';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  const favoriteCourt = Object.entries(courtCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="profile-page">
      <button className="profile-back-btn" onClick={() => navigate('/')}>← Back</button>

      {/* Header Card */}
      <div className="profile-header">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-info">
          <h1 className="profile-username">@{user.username}</h1>
          <p className="profile-email">{user.email}</p>
          <button className="profile-logout-btn" onClick={() => { logout(); navigate('/'); }}>
            Log Out
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="profile-stats">
        <div className="stat-card">
          <span className="stat-number">{checkins.length}</span>
          <span className="stat-label">Check-ins</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{ratings.length}</span>
          <span className="stat-label">Courts Rated</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">
            {favoriteCourt ? favoriteCourt[1] : 0}
          </span>
          <span className="stat-label">Visits to Fav Court</span>
        </div>
      </div>

      {favoriteCourt && (
        <div className="profile-favorite">
          🏆 Favorite Court: <strong>{favoriteCourt[0]}</strong>
        </div>
      )}

      {loading ? (
        <p className="profile-loading">Loading your history...</p>
      ) : (
        <div className="profile-sections">

          {/* Check-in History */}
          <div className="profile-section">
            <h2 className="section-title">📍 Check-in History</h2>
            {checkins.length === 0 ? (
              <p className="empty-msg">No check-ins yet. Get out there! 🏀</p>
            ) : (
              <ul className="history-list">
                {checkins.slice(0, 10).map(c => (
                  <li key={c.id} className="history-item"
                    onClick={() => navigate(`/court/${c.court?.id}`)}>
                    <span className="history-court">{c.court?.name || 'Unknown Court'}</span>
                    <span className="history-time">{timeAgo(c.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Rating History */}
          <div className="profile-section">
            <h2 className="section-title">⭐ Your Ratings</h2>
            {ratings.length === 0 ? (
              <p className="empty-msg">You haven't rated any courts yet.</p>
            ) : (
              <ul className="history-list">
                {ratings.map(r => (
                  <li key={r.id} className="history-item"
                    onClick={() => navigate(`/court/${r.court?.id}`)}>
                    <span className="history-court">{r.court?.name || 'Unknown Court'}</span>
                    <span className="history-stars">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className={s <= r.score ? 'star-filled' : 'star-empty'}>★</span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default Profile;
