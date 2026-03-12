import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CourtDetail.css';
import { useToast } from './useToast';
import { useAuth } from './AuthContext';

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

const CourtDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [court, setCourt] = useState(null);
  const [error, setError] = useState(false);
  const [liveCount, setLiveCount] = useState(0);
  const [checkinId, setCheckinId] = useState(() => {
    const stored = localStorage.getItem('igotNext_active_checkin');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed.courtId === parseInt(id) ? parsed.checkinId : null;
  });
  const [ratingData, setRatingData] = useState({ average: 0, count: 0 });
  const [lastActive, setLastActive] = useState(null);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submittedRating, setSubmittedRating] = useState(0);
  const { showToast, ToastContainer } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetch(`/api/courts/${id}`)
      .then(res => {
        if (!res.ok) { setError(true); return; }
        return res.json();
      })
      .then(data => { if (data) setCourt(data); })
      .catch(() => setError(true));

    fetch(`/api/courts/${id}/live-count`)
      .then(res => res.json())
      .then(data => {
        const count = typeof data === 'object' ? data.playerCount : data;
        setLiveCount(count);
      });

    fetch(`/api/courts/${id}/ratings/average`)
      .then(res => res.json())
      .then(data => setRatingData({ average: data.average, count: data.count }));

    fetch(`/api/courts/${id}/checkins`)
      .then(res => res.json())
      .then(data => setLastActive(data[0]?.createdAt || null));
  }, [id]);

  const handleCheckIn = () => {
    if (!user) {
      showToast('🔒 Please log in to check in to a court.', 'error');
      return;
    }

    const stored = localStorage.getItem('igotNext_active_checkin');
    if (stored) {
      const prev = JSON.parse(stored);
      if (prev.courtId !== parseInt(id)) {
        fetch(`/api/checkins/${prev.checkinId}`, { method: 'DELETE' });
      }
    }

    fetch(`/api/courts/${id}/checkins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partySize: 1, username: user.username }),
    })
      .then(res => res.json())
      .then(checkin => {
        setCheckinId(checkin.id);
        localStorage.setItem('igotNext_active_checkin', JSON.stringify({ courtId: parseInt(id), checkinId: checkin.id }));
        setLiveCount(prev => prev + 1);
        showToast('✅ Checked in! You got next.');
      });
  };

  const handleCheckOut = () => {
    fetch(`/api/checkins/${checkinId}`, { method: 'DELETE' })
      .then(() => {
        setCheckinId(null);
        localStorage.removeItem('igotNext_active_checkin');
        setLiveCount(prev => Math.max(0, prev - 1));
        showToast('🚪 Checked out. See you next time!');
      });
  };

  const handleRate = (score) => {
    if (submittedRating) return;
    fetch(`/api/courts/${id}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score, username: user?.username || null }),
    })
      .then(res => res.json())
      .then(() => {
        setSubmittedRating(score);
        showToast(`⭐ Thanks for rating this court ${score}/5!`);
        fetch(`/api/courts/${id}/ratings/average`)
          .then(res => res.json())
          .then(data => setRatingData({ average: data.average, count: data.count }));
      });
  };

  const fallbackImg = 'https://images.unsplash.com/photo-1585776245991-01e7fcb6c66b?fit=crop&w=800&q=80';

  if (error) return (
    <div className="detail-loading">
      <p>Court not found.</p>
      <button onClick={() => navigate(-1)} style={{ marginTop: '12px', cursor: 'pointer' }}>← Go Back</button>
    </div>
  );
  if (!court) return <div className="detail-loading">Loading...</div>;

  const displayStars = hoveredStar || submittedRating || ratingData.average;

  return (
    <div className="court-detail-page">
      <ToastContainer />

      {/* Hero — full-bleed image with overlaid name */}
      <div className="detail-hero">
        <img
          src={court.imageUrl || fallbackImg}
          alt={court.name}
          className="detail-hero-img"
        />
        <div className="detail-hero-overlay" />
        <div className="detail-hero-content">
          <button className="detail-back-btn" onClick={() => navigate(-1)}>← Back</button>
          <div className="detail-hero-bottom">
            <span className={`detail-badge ${court.outdoor ? 'outdoor' : 'indoor'}`}>
              {court.outdoor ? '☀️ Outdoor' : '🏠 Indoor'}
            </span>
            <h1 className="detail-name">{court.name}</h1>
            <p className="detail-location">📍 {court.city || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Content below hero */}
      <div className="detail-content">
        <div className="rating-section">
          <div className="stars-display">
            {[1, 2, 3, 4, 5].map(star => (
              <span
                key={star}
                className={`star ${star <= displayStars ? 'filled' : ''} ${submittedRating ? 'locked' : ''}`}
                onMouseEnter={() => !submittedRating && setHoveredStar(star)}
                onMouseLeave={() => !submittedRating && setHoveredStar(0)}
                onClick={() => handleRate(star)}
              >
                ★
              </span>
            ))}
          </div>
          <span className="rating-label">
            {submittedRating
              ? `You rated this ${submittedRating}/5`
              : ratingData.count > 0
              ? `${ratingData.average}/5 (${ratingData.count} ${ratingData.count === 1 ? 'rating' : 'ratings'})`
              : 'No ratings yet — be the first!'}
          </span>
        </div>

        <div className="detail-count">
          🏀 <strong>{liveCount}</strong> players on the court right now
          <div className="detail-timestamp">🕐 {timeAgo(lastActive)}</div>
        </div>

        <button
          className={`detail-checkin-btn ${checkinId ? 'checkout' : ''}`}
          onClick={checkinId ? handleCheckOut : handleCheckIn}
        >
          {checkinId ? '🚪 Check Out' : '✅ I Got Next'}
        </button>
      </div>
    </div>
  );
};

export default CourtDetail;
