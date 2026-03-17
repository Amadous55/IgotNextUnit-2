import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import { ThemeProvider } from "./ThemeContext";
import HomePage from "./HomePage";
import CourtsPage from "./CourtsPage";
import CourtDetail from './CourtDetail';
import Footer from './footer';
import AddCourt from './AddCourt';
import Profile from './Profile';
import LoginPage from './LoginPage';
import NotFound from './NotFound';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/courts" element={<CourtsPage />} />
          <Route path="/court/:id" element={<CourtDetail />} />
          <Route path="/added-courts" element={<AddCourt />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<LoginPage />} />
          {/* Catch-all route for unknown paths */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
