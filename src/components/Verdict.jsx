import React from 'react';
import './Verdict.css';

function Verdict({ productData, userProfile }) {
  const productName = productData?.product_name || 'Product Name Not Available';
  const nutrients = productData?.nutriments || {};

  const getVerdict = () => {
    if (userProfile.conditions.includes('diabetes') && nutrients.sugars_100g > 15) {
      return {
        text: 'Not Advised',
        reason: `High sugar content (${nutrients.sugars_100g}g) conflicts with your diabetes profile.`,
        color: '#ff6b6b'
      };
    }
    if (userProfile.goals.includes('weight_loss') && nutrients['energy-kcal_100g'] > 400) {
      return {
        text: 'Limit Intake',
        reason: `High in calories (${nutrients['energy-kcal_100g']} kcal) for a weight loss goal.`,
        color: '#f0e68c'
      };
    }
    return {
      text: 'Recommended',
      reason: 'This item fits within your current health profile.',
      color: '#42b883'
    };
  };

  const finalVerdict = getVerdict();

  return (
    <div className="verdict-container">
      <h3>{productName}</h3>
      <div className="verdict-display" style={{ backgroundColor: finalVerdict.color }}>
        <h2>{finalVerdict.text}</h2>
      </div>
      <p className="verdict-reason">{finalVerdict.reason}</p>
      <hr className="divider" />
      <div className="nutrition-grid">
        <div className="nutrient-item">
          <span className="nutrient-label">Energy</span>
          <span className="nutrient-value">{nutrients['energy-kcal_100g'] || 'N/A'} kcal</span>
        </div>
        <div className="nutrient-item">
          <span className="nutrient-label">Fat</span>
          <span className="nutrient-value">{nutrients.fat_100g || 'N/A'} g</span>
        </div>
        <div className="nutrient-item">
          <span className="nutrient-label">Sugars</span>
          <span className="nutrient-value">{nutrients.sugars_100g || 'N/A'} g</span>
        </div>
        <div className="nutrient-item">
          <span className="nutrient-label">Sodium</span>
          <span className="nutrient-value">{nutrients.sodium_100g || 'N/A'} g</span>
        </div>
      </div>
    </div>
  );
}

export default Verdict;