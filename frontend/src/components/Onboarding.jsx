import React, { useState } from 'react';
import './Onboarding.css';

function Onboarding({ onComplete }) {
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [selectedGoals, setSelectedGoals] = useState([]);

  const conditions = ['diabetes', 'high_bp'];
  const goals = ['weight_loss', 'muscle_gain'];

  const handleConditionToggle = (condition) => {
    setSelectedConditions(prev => 
      prev.includes(condition) ? prev.filter(c => c !== condition) : [...prev, condition]
    );
  };

  const handleGoalToggle = (goal) => {
    setSelectedGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const handleSubmit = () => {
    onComplete({ conditions: selectedConditions, goals: selectedGoals });
  };

  return (
    <div className="onboarding-container">
      <img src="/logo.png" alt="Foodle Logo" className="logo" />
      <h1>Welcome to Foodle!</h1>
      <p className="subtitle">Let's personalize your journey to healthier eating. Select any goals or conditions that apply to you.</p>

      <div className="options-section">
        <h2>Health Conditions</h2>
        <div className="button-group">
          {conditions.map(c => (
            <button 
              key={c} 
              onClick={() => handleConditionToggle(c)} 
              className={selectedConditions.includes(c) ? 'active' : ''}
            >
              {c === 'high_bp' ? 'High Blood Pressure' : 'Diabetes'}
            </button>
          ))}
        </div>
      </div>

      <div className="options-section">
        <h2>Health Goals</h2>
        <div className="button-group">
          {goals.map(g => (
            <button 
              key={g} 
              onClick={() => handleGoalToggle(g)}
              className={selectedGoals.includes(g) ? 'active' : ''}
            >
              {g === 'weight_loss' ? 'Weight Loss' : 'Muscle Gain'}
            </button>
          ))}
        </div>
      </div>

      <button className="finish-button" onClick={handleSubmit}>Let's Go!</button>
    </div>
  );
}

export default Onboarding;