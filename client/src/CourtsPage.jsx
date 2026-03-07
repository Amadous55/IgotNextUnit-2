import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CourtsPage.css';

function timeAgo(isoString) {
  if (!isoString) return 'No recent activity';
  const seconds = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (seconds < 60) return 'Active just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Last active ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Last active ${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `Last active ${days}d ago`;
}

const CourtsPage = () => {
  const navigate = useNavigate();
  const [courts, setCourts] = useState([]);
  const [checkins, setCheckins] = useState({}); // { courtId: checkinId }
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/courts')
      .then(res => res.json())
      .then(data => {
        const courtsWithCount = data.map(court => ({ ...court, liveCount: 0, avgRating: 0, ratingCount: 0, lastActive: null }));
        setCourts(courtsWithCount);
        courtsWithCount.forEach(court => {
          fetch(`/api/courts/${court.id}/live-count`)
            .then(res => res.json())
            .then(data => {
              const count = typeof data === 'object' ? data.playerCount : data;
              setCourts(prev => prev.map(c => c.id === court.id ? { ...c, liveCount: count } : c));
            });
          fetch(`/api/courts/${court.id}/ratings/average`)
            .then(res => res.json())
            .then(data => {
              setCourts(prev => prev.map(c => c.id === court.id ? { ...c, avgRating: data.average, ratingCount: data.count } : c));
            });
          fetch(`/api/courts/${court.id}/checkins`)
            .then(res => res.json())
            .then(data => {
              const latest = data[0]?.createdAt || null;
              setCourts(prev => prev.map(c => c.id === court.id ? { ...c, lastActive: latest } : c));
            });
        });
      });
  }, []);

  const handleCheckIn = (id) => {
    fetch(`/api/courts/${id}/checkins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partySize: 1 }),
    })
      .then(res => res.json())
      .then(checkin => {
        setCheckins(prev => ({ ...prev, [id]: checkin.id }));
        fetch(`/api/courts/${id}/live-count`)
          .then(res => res.json())
          .then(data => {
            const count = typeof data === 'object' ? data.playerCount : data;
            setCourts(prev => prev.map(c => c.id === id ? { ...c, liveCount: count } : c));
          });
      });
  };

  const handleCheckOut = (id) => {
    const checkinId = checkins[id];
    if (!checkinId) return;
    fetch(`/api/checkins/${checkinId}`, { method: 'DELETE' })
      .then(() => {
        setCheckins(prev => { const next = { ...prev }; delete next[id]; return next; });
        fetch(`/api/courts/${id}/live-count`)
          .then(res => res.json())
          .then(data => {
            const count = typeof data === 'object' ? data.playerCount : data;
            setCourts(prev => prev.map(c => c.id === id ? { ...c, liveCount: count } : c));
          });
      });
  };

  const filtered = courts.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.city || '').toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === 'all' || (filter === 'outdoor' ? c.outdoor : !c.outdoor);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="courts-page">
      <div className="courts-header">
        <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
        <h1>Nearby Courts</h1>
      </div>

      <div className="courts-controls">
        <input
          type="text"
          placeholder="Search by name or city..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
        <div className="filter-buttons">
          {['all', 'outdoor', 'indoor'].map(f => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? '🏀 All' : f === 'outdoor' ? '☀️ Outdoor' : '🏠 Indoor'}
            </button>
          ))}
        </div>
      </div>

      <div className="court-list">
        {filtered.map(court => (
          <CourtCard
            key={court.id}
            court={court}
            checkedIn={!!checkins[court.id]}
            onCheckIn={() => handleCheckIn(court.id)}
            onCheckOut={() => handleCheckOut(court.id)}
            onClick={() => navigate(`/court/${court.id}`)}
          />
        ))}
        {filtered.length === 0 && (
          <p className="no-results">No courts found.</p>
        )}
      </div>
    </div>
  );
};

function CourtCard({ court, checkedIn, onCheckIn, onCheckOut, onClick }) {
  const fallbackImg = 'https://images.unsplash.com/photo-1585776245991-01e7fcb6c66b?fit=crop&w=800&q=80';

  return (
    <div className="court-card-api" onClick={onClick}>
      <img
        src={court.imageUrl || fallbackImg}
        alt={court.name}
        className="court-card-img"
      />
      <div className="court-card-body">
        <h2 className="court-card-name">{court.name}</h2>
        <div className="court-card-meta">
          <span>📍 {court.city || 'N/A'}</span>
          <span className={`badge ${court.outdoor ? 'outdoor' : 'indoor'}`}>
            {court.outdoor ? '☀️ Outdoor' : '🏠 Indoor'}
          </span>
        </div>
        <div className="court-card-stars">
          {[1, 2, 3, 4, 5].map(star => (
            <span key={star} className={`card-star ${star <= Math.round(court.avgRating) ? 'filled' : ''}`}>★</span>
          ))}
          <span className="card-rating-label">
            {court.ratingCount > 0 ? `${court.avgRating}/5` : 'No ratings yet'}
          </span>
        </div>
        <div className="court-card-count">
          🏀 <strong>{court.liveCount}</strong> players on the court now
        </div>
        <div className="court-card-timestamp">🕐 {timeAgo(court.lastActive)}</div>
        <button
          className={`checkin-btn ${checkedIn ? 'checkout' : ''}`}
          onClick={e => { e.stopPropagation(); checkedIn ? onCheckOut() : onCheckIn(); }}
        >
          {checkedIn ? '🚪 Check Out' : '✅ Check In'}
        </button>
      </div>
    </div>
  );
}

export default CourtsPage;
