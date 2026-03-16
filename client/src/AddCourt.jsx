import React, { useState } from "react";
import './AddCourt.css';

function AddCourt() {
  const [courtName, setCourtName] = useState("");
  const [comment, setComment] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [addedCourts, setAddedCourts] = useState([]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImageFile(imageUrl);
    }
  };

  const handleSubmit = () => {
    if (!courtName.trim()) return;
    setSubmitError('');

    fetch('/api/courts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: courtName.trim() }),
    })
      .then(res => { if (!res.ok) throw new Error('Failed to submit court'); return res.json(); })
      .then(newCourt => {
        setAddedCourts(prev => [...prev, { ...newCourt, comment, image: imageFile }]);
        setCourtName("");
        setComment("");
        setImageFile(null);
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 2500);
      })
      .catch(() => setSubmitError('❌ Could not submit court. Make sure the server is running.'));
  };

  const handleDelete = (id) => {
    setAddedCourts(prev => prev.filter(court => court.id !== id));
  };

  return (
    <div className="add-court-container">
      <h2>Add a New Court</h2>

      <div className="form">
        <input
          type="text"
          placeholder="Court name"
          value={courtName}
          onChange={(e) => setCourtName(e.target.value)}
        />

        <textarea
          placeholder="Add a comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {imageFile && (
          <img src={imageFile} alt="Preview" className="preview" />
        )}

        <button className="submit-btn" onClick={handleSubmit}>
          Submit Court
        </button>

        {submitted && (
          <p className="submitted-msg">✅ Court successfully submitted!</p>
        )}
        {submitError && (
          <p className="submitted-msg" style={{ color: '#e74c3c' }}>{submitError}</p>
        )}
      </div>

      <hr />

      <div className="added-courts">
        {addedCourts.map((court) => (
          <div key={court.id} className="court-entry">
            <img src={court.image} alt="Uploaded court" className="court-image" />
            <h3>{court.name}</h3>
            <p>{court.comment}</p>
            <button onClick={() => handleDelete(court.id)}>🗑 Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AddCourt;
