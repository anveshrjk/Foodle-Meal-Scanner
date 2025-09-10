import React from 'react';
import './Verdict.css';

// The component now accepts the userProfile as a prop
function Verdict({ productData, userProfile }) {
  const productName = productData?.product_name || 'Product Name Not Available';
  const nutrients = productData?.nutriments || {};

  // This is our simple rules engine
  const getVerdict = () => {
    // Rule for Diabetes
    if (userProfile.conditions.includes('diabetes') && nutrients.sugars_100g > 15) {
      return {
        text: 'Not Advised for You',
        reason: `High sugar content (${nutrients.sugars_100g}g per 100g) conflicts with your diabetes management goal.`,
        color: '#ff6b6b' // Red
      };
    }

    // Rule for Weight Loss
    if (userProfile.goals.includes('weight_loss') && nutrients['energy-kcal_100g'] > 400) {
      return {
        text: 'Limit Intake',
        reason: `High in calories (${nutrients['energy-kcal_100g']} kcal per 100g).`,
        color: '#f0e68c' // Yellow
      };
    }

    // Default verdict if no rules are met
    return {
      text: 'Recommended',
      reason: 'This item fits within your current health profile.',
      color: '#42b883' // Green
    };
  };

  const finalVerdict = getVerdict();

  return (
    <div className="verdict-container">
      <h3>{productName}</h3>  {/* <-- ADD THIS LINE BACK IN */}

      {/* --- VERDICT DISPLAY --- */}
      <div className="verdict-display" style={{ backgroundColor: finalVerdict.color }}>
        <h2>{finalVerdict.text}</h2>
      </div>
      <p className="verdict-reason">{finalVerdict.reason}</p>
      
      {/* --- NUTRITION DISPLAY --- */}
      <hr className="divider" />
      <div className="nutrition-grid">
        {/* ... the rest of the grid ... */}
      </div>
    </div>
  );
}

export default Verdict;