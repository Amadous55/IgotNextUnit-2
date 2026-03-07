import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CourtDetail.css';

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
  const [liveCount, setLiveCount] = useState(0);
  const [checkinId, setCheckinId] = useState(null);
  const [ratingData, setRatingData] = useState({ average: 0, count: 0 });
  const [lastActive, setLastActive] = useState(null);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submittedRating, setSubmittedRating] = useState(0);

  useEffect(() => {
    fetch(`/api/courts/${id}`)
      .then(res => res.json())
      .then(data => setCourt(data));

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
    fetch(`/api/courts/${id}/checkins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partySize: 1 }),
    })
      .then(res => res.json())
      .then(checkin => {
        setCheckinId(checkin.id);
        setLiveCount(prev => prev + 1);
      });
  };

  const handleCheckOut = () => {
    fetch(`/api/checkins/${checkinId}`, { method: 'DELETE' })
      .then(() => {
        setCheckinId(null);
        setLiveCount(prev => Math.max(0, prev - 1));
      });
  };

  const handleRate = (score) => {
    if (submittedRating) return;
    fetch(`/api/courts/${id}/ratings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score }),
    })
      .then(res => res.json())
      .then(() => {
        setSubmittedRating(score);
        fetch(`/api/courts/${id}/ratings/average`)
          .then(res => res.json())
          .then(data => setRatingData({ average: data.average, count: data.count }));
      });
  };

  const fallbackImg = 'https://images.unsplash.com/photo-1585776245991-01e7fcb6c66b?fit=crop&w=800&q=80';

  if (!court) return <div className="detail-loading">Loading...</div>;

  const displayStars = hoveredStar || submittedRating || ratingData.average;

  return (
    <div className="court-detail-page">
      <img
        src={court.imageUrl || fallbackImg}
        alt={court.name}
        className="detail-hero-img"
      />
      <div className="detail-content">
        <button className="detail-back-btn" onClick={() => navigate(-1)}>← Back</button>
        <h1 className="detail-name">{court.name}</h1>
        <div className="detail-meta">
          <span>📍 {court.city || 'N/A'}</span>
          <span className={`detail-badge ${court.outdoor ? 'outdoor' : 'indoor'}`}>
            {court.outdoor ? '☀️ Outdoor' : '🏠 Indoor'}
          </span>
        </div>

        {/* Rating display */}
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
