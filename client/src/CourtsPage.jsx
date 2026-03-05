import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CourtsPage = () => {
  const navigate = useNavigate();
  const [courts, setCourts] = useState([]);

  useEffect(() => {
    fetch('/api/courts')
      .then(res => res.json())
      .then(data => {
        const courtsWithCount = data.map(court => ({ ...court, liveCount: 0 }));
        setCourts(courtsWithCount);
        courtsWithCount.forEach(court => {
          fetch(`/api/courts/${court.id}/live-count`)
            .then(res => res.json())
            .then(data => {
              const count = typeof data === 'object' ? data.playerCount : data;
              setCourts(prev => prev.map(c => c.id === court.id ? { ...c, liveCount: count } : c));
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
      .then(() => {
        fetch(`/api/courts/${id}/live-count`)
          .then(res => res.json())
          .then(data => {
            const count = typeof data === 'object' ? data.playerCount : data;
            setCourts(prev => prev.map(c => c.id === id ? { ...c, liveCount: count } : c));
          });
      });
  };

  return (
    <div className="courts-page">
      <button
        onClick={() => navigate('/')}
        style={{
          marginBottom: '20px',
          padding: '8px 16px',
          borderRadius: '6px',
          backgroundColor: '#444',
          color: 'white',
          cursor: 'pointer',
          border: 'none',
        }}
      >
        ← Back
      </button>

      <h1>Nearby Basketball Courts</h1>
      <div className="court-list">
        {courts.map((court) => (
          <CourtCard
            key={court.id}
            court={court}
            onCheckIn={() => handleCheckIn(court.id)}
            onClick={() => navigate(`/court/${court.id}`)}
          />
        ))}
      </div>
    </div>
  );
};

function CourtCard({ court, onCheckIn, onClick }) {
  const cardStyle = {
    backgroundColor: '#222',
    color: 'white',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
    cursor: 'pointer',
  };

  const fallbackImg = 'https://images.unsplash.com/photo-1585776245991-01e7fcb6c66b?fit=crop&w=800&q=80';

  return (
    <div style={cardStyle} onClick={onClick}>
      <img
        src={court.imageUrl || fallbackImg}
        alt={court.name}
        style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }}
      />
      <h2>{court.name}</h2>
      <p><strong>City:</strong> {court.city || 'N/A'}</p>
      <p><strong>Outdoor:</strong> {court.outdoor ? 'Yes' : 'No'}</p>
      <p><strong>Players Now:</strong> {court.liveCount}</p>
      <button
        onClick={(e) => { e.stopPropagation(); onCheckIn(); }}
        style={{
          marginTop: '10px',
          padding: '6px 12px',
          backgroundColor: '#ffcc00',
          color: '#000',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        ✅ Check In
      </button>
    </div>
  );
}

export default CourtsPage;
