import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import CourtsPage from "./CourtsPage";
import CourtDetail from './CourtDetail';
import Footer from './footer';
import AddCourt from './AddCourt'; 
import Profile from './Profile';


function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/courts" element={<CourtsPage />} />
        <Route path="/court/:id" element={<CourtDetail />} />
        <Route path="/added-courts" element={<AddCourt />} /> 
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
