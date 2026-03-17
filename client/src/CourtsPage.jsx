import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CourtsPage.css';
import { useToast } from './useToast';
import { useAuth } from './AuthContext';

// Converts an ISO timestamp into a human-readable "time ago" string
// Used to show when a court was last checked into
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
  const [activeCheckin, setActiveCheckin] = useState(() => {
    const stored = localStorage.getItem('igotNext_active_checkin');
    return stored ? JSON.parse(stored) : null;
  }); // { courtId, checkinId } | null
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loadError, setLoadError] = useState(false);
  const { showToast, ToastContainer } = useToast();
  const { user } = useAuth();

  // Set browser tab title for this page
  useEffect(() => { document.title = 'I Got Next — Courts'; }, []);

  useEffect(() => {
    fetch('/api/courts')
      .then(res => { if (!res.ok) throw new Error('Failed to load courts'); return res.json(); })
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
      })
      .catch(() => setLoadError(true));
  }, []);

  const handleCheckIn = (id) => {
    if (!user) {
      showToast('🔒 Please log in to check in to a court.', 'error');
      return;
    }

    // Auto-checkout from previous court if different
    if (activeCheckin && activeCheckin.courtId !== id) {
      fetch(`/api/checkins/${activeCheckin.checkinId}`, { method: 'DELETE' });
      setCourts(prev => prev.map(c => c.id === activeCheckin.courtId ? { ...c, liveCount: Math.max(0, c.liveCount - 1) } : c));
    }

    fetch(`/api/courts/${id}/checkins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partySize: 1, username: user.username }),
    })
      .then(res => res.json())
      .then(checkin => {
        const next = { courtId: id, checkinId: checkin.id };
        setActiveCheckin(next);
        localStorage.setItem('igotNext_active_checkin', JSON.stringify(next));
        setCourts(prev => prev.map(c => c.id === id ? { ...c, liveCount: c.liveCount + 1 } : c));
        showToast('✅ Checked in! You got next.');
      });
  };

  const handleCheckOut = (id) => {
    if (!activeCheckin) return;
    fetch(`/api/checkins/${activeCheckin.checkinId}`, { method: 'DELETE' })
      .then(() => {
        setActiveCheckin(null);
        localStorage.removeItem('igotNext_active_checkin');
        setCourts(prev => prev.map(c => c.id === id ? { ...c, liveCount: Math.max(0, c.liveCount - 1) } : c));
        showToast('🚪 Checked out. See you next time!');
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

  if (loadError) return (
    <div className="courts-page">
      <div className="courts-header">
        <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
        <h1>Nearby Courts</h1>
      </div>
      <p style={{ textAlign: 'center', color: '#888', marginTop: '60px' }}>
        Unable to load courts. Make sure the server is running.
      </p>
    </div>
  );

  return (
    <div className="courts-page">
      <ToastContainer />
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
            checkedIn={activeCheckin?.courtId === court.id}
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
