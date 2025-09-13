import React from 'react';
import './Verdict.css';

function Verdict({ productData, userProfile }) {
  const productName = productData?.product_name || 'Product Name Not Available';
  const nutrients = productData?.nutriments || {};

  const getVerdict = () => {
    if (userProfile.conditions.includes('diabetes') && nutrients.sugars_100g > 15) {
      return {
        text: 'Think Twice',
        reason: `High sugar content (${nutrients.sugars_100g}g) conflicts with a diabetes-conscious profile.`,
        color: '#ff6b6b'
      };
    }
    if (userProfile.conditions.includes('high_bp') && nutrients.sodium_100g > 0.6) {
      // Sodium is often given in g, 0.6g = 600mg
      return {
        text: 'Think Twice',
        reason: `High sodium content (${nutrients.sodium_100g}g) conflicts with a blood pressure-conscious profile.`,
        color: '#ff6b6b'
      };
    }
    if (userProfile.goals.includes('weight_loss') && nutrients['energy-kcal_100g'] > 400) {
      return {
        text: 'Enjoy in Moderation',
        reason: `High in calories (${nutrients['energy-kcal_100g']} kcal) for a weight loss goal.`,
        color: '#f0e68c'
      };
    }
    return {
      text: 'Good to Go!',
      reason: 'This item fits well within your current health profile.',
      color: '#42b883'
    };
  };

  const finalVerdict = getVerdict();
  const energy = nutrients['energy-kcal_100g'];
  const fat = nutrients.fat_100g;
  const sugars = nutrients.sugars_100g;
  const sodium = nutrients.sodium_100g;

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
          <span className="nutrient-value">{energy ? `${energy} kcal` : 'N/A'}</span>
        </div>
        <div className="nutrient-item">
          <span className="nutrient-label">Fat</span>
          <span className="nutrient-value">{fat ? `${fat} g` : 'N/A'}</span>
        </div>
        <div className="nutrient-item">
          <span className="nutrient-label">Sugars</span>
          <span className="nutrient-value">{sugars ? `${sugars} g` : 'N/A'}</span>
        </div>
        <div className="nutrient-item">
          <span className="nutrient-label">Sodium</span>
          <span className="nutrient-value">{sodium ? `${sodium} g` : 'N/A'}</span>
        </div>
      </div>
    </div>
  );
}

export default Verdict;