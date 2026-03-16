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

  // Follow state
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [followInput, setFollowInput] = useState('');
  const [followMsg, setFollowMsg] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    Promise.all([
      fetch(`/api/users/${user.username}/checkins`).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch(`/api/users/${user.username}/ratings`).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch(`/api/users/${user.username}/following`).then(r => r.ok ? r.json() : []),
      fetch(`/api/users/${user.username}/followers`).then(r => r.ok ? r.json() : []),
    ]).then(([checkinsData, ratingsData, followingData, followersData]) => {
      setCheckins(checkinsData);
      setRatings(ratingsData);
      setFollowing(followingData);
      setFollowers(followersData);
      setLoading(false);
    }).catch(() => {
      setFetchError(true);
      setLoading(false);
    });
  }, [user, navigate]);

  const handleFollow = async () => {
    const target = followInput.trim();
    if (!target) return;
    setFollowMsg('');
    try {
      const res = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerUsername: user.username, followingUsername: target }),
      });
      const data = await res.json();
      if (!res.ok) { setFollowMsg(data || 'Error'); return; }
      setFollowing(prev => [...prev, { username: target }]);
      setFollowInput('');
      setFollowMsg(`Now following @${target}!`);
    } catch {
      setFollowMsg('Could not connect to server.');
    }
  };

  const handleUnfollow = async (targetUsername) => {
    try {
      await fetch('/api/follow', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerUsername: user.username, followingUsername: targetUsername }),
      });
      setFollowing(prev => prev.filter(f => f.username !== targetUsername));
    } catch {
      setFollowMsg('Could not unfollow. Try again.');
    }
  };

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
        <div className="stat-card">
          <span className="stat-number">{following.length}</span>
          <span className="stat-label">Following</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{followers.length}</span>
          <span className="stat-label">Followers</span>
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

          {/* Following Section */}
          <div className="profile-section">
            <h2 className="section-title">👥 Following</h2>

            {/* Follow someone */}
            <div className="follow-input-row">
              <input
                type="text"
                className="follow-input"
                placeholder="Enter a username..."
                value={followInput}
                onChange={e => setFollowInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleFollow()}
              />
              <button className="follow-btn" onClick={handleFollow}>Follow</button>
            </div>
            {followMsg && <p className="follow-msg">{followMsg}</p>}

            {/* Following list */}
            {following.length === 0 ? (
              <p className="empty-msg">You're not following anyone yet.</p>
            ) : (
              <ul className="history-list" style={{ marginTop: '12px' }}>
                {following.map(f => (
                  <li key={f.username} className="history-item">
                    <span className="history-court">@{f.username}</span>
                    <button
                      className="unfollow-btn"
                      onClick={() => handleUnfollow(f.username)}
                    >
                      Unfollow
                    </button>
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
