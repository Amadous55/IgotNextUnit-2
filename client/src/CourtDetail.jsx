import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const CourtDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [court, setCourt] = useState(null);
  const [liveCount, setLiveCount] = useState(0);

  useEffect(() => {
    fetch(`/api/courts/${id}`)
      .then(res => res.json())
      .then(data => setCourt(data));

    fetch(`/api/courts/${id}/live-count`)
      .then(res => res.json())
      .then(count => setLiveCount(count));
  }, [id]);

  if (!court) return <p>Loading...</p>;

  return (
    <div className="court-detail">
      <button onClick={() => navigate(-1)}>← Back</button>
      <h1>{court.name}</h1>
      <p><strong>City:</strong> {court.city || 'N/A'}</p>
      <p><strong>Outdoor:</strong> {court.outdoor ? 'Yes' : 'No'}</p>
      <p><strong>Players Now:</strong> {liveCount}</p>
    </div>
  );
};

export default CourtDetail;
