import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import Onboarding from './components/Onboarding';
import './App.css';

function App() {
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On app start, check if a profile already exists in local storage
  useEffect(() => {
    const savedProfile = localStorage.getItem('foodleUserProfile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
    setIsLoading(false);
  }, []);

  // This function is called when the user completes the onboarding
  const handleOnboardingComplete = (profile) => {
    localStorage.setItem('foodleUserProfile', JSON.stringify(profile));
    setUserProfile(profile);
  };
  
  // Don't render anything until we've checked local storage
  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <div className="app-container">
      {userProfile ? (
        <HomePage userProfile={userProfile} />
      ) : (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}
    </div>
  );
}

export default App;