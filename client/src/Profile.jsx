import React, { useState } from "react";
import './Profile.css';

function Profile() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [preference, setPreference] = useState("1");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="profile-container">
      <h2>Create Your Player Profile</h2>
      <form onSubmit={handleSubmit} className="profile-form">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Your age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          required
        />

        <select value={preference} onChange={(e) => setPreference(e.target.value)}>
          <option value="1">Solo hooper</option>
          <option value="2">Always play with randoms</option>
          <option value="3">Need a space for my team</option>
          <option value="4">Both 2 and 3</option>
          <option value="5">Get off the court — 5v5 only</option>
          <option value="6">Other</option>
        </select>

        <button type="submit">Submit Profile</button>
      </form>

      {submitted && (
        <div className="profile-summary">
          <h3>👤 You are logged in as:</h3>
          <p><strong>Name:</strong> {name}</p>
          <p><strong>Age:</strong> {age}</p>
          <p><strong>Play Preference:</strong> {getPreferenceText(preference)}</p>
        </div>
      )}
    </div>
  );
}

function getPreferenceText(value) {
  const options = {
    1: "Solo hooper",
    2: "Always play with randoms",
    3: "Need a space for my team",
    4: "Both 2 and 3",
    5: "Get off the court — 5v5 only",
    6: "Other"
  };
  return options[value];
}

export default Profile;
