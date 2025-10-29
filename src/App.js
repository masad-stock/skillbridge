import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import SkillsAssessment from './pages/SkillsAssessment';
import LearningPath from './pages/LearningPath';
import BusinessTools from './pages/BusinessTools';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import OfflineIndicator from './components/OfflineIndicator';
import { UserProvider } from './context/UserContext';
import { OfflineProvider } from './context/OfflineContext';
import './App.css';

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <UserProvider>
      <OfflineProvider value={isOnline}>
        <Router>
          <div className="App">
            <Header />
            <OfflineIndicator isOnline={isOnline} />
            <main className="main">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/assessment" element={<SkillsAssessment />} />
                <Route path="/learning" element={<LearningPath />} />
                <Route path="/business-tools" element={<BusinessTools />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </OfflineProvider>
    </UserProvider>
  );
}

export default App;