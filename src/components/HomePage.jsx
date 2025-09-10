import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './HomePage.css';
import BarcodeScanner from './BarcodeScanner';
import Verdict from './Verdict';
import ErrorBoundary from './ErrorBoundary';

function HomePage() {
  const profilePresets = {
    default: { name: 'default', goals: [], conditions: [] },
    diabetes: { name: 'diabetes', goals: [], conditions: ['diabetes'] },
    weight_loss: { name: 'weight_loss', goals: ['weight_loss'], conditions: [] },
  };

  const [userProfile, setUserProfile] = useState(profilePresets.default);
  const [scannedCode, setScannedCode] = useState(null);
  const [productData, setProductData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleNewScanResult = useCallback((decodedText) => {
    if (decodedText) {
      setScannedCode(decodedText);
    }
  }, []);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!scannedCode) return;
      setIsLoading(true);
      setError(null);
      setProductData(null);
      try {
        const url = `https://world.openfoodfacts.org/api/v2/product/${scannedCode}.json`;
        const response = await axios.get(url);
        if (response.data.status === 1 && response.data.product) {
          setProductData(response.data.product);
        } else {
          setError('Product not found in the database.');
        }
      } catch (err) {
        setError('Failed to fetch data. Please try again.');
      }
      setIsLoading(false);
    };
    fetchProductData();
  }, [scannedCode]);

  return (
    <div className="homepage-container">
      <header>
        <img src="/logo.png" alt="Foodle Logo" className="logo" />
      </header>

      <div className="profile-selector">
        <p>Simulate Profile:</p>
        <div>
          <button className={userProfile.name === 'default' ? 'active' : ''} onClick={() => setUserProfile(profilePresets.default)}>Default</button>
          <button className={userProfile.name === 'diabetes' ? 'active' : ''} onClick={() => setUserProfile(profilePresets.diabetes)}>Diabetes</button>
          <button className={userProfile.name === 'weight_loss' ? 'active' : ''} onClick={() => setUserProfile(profilePresets.weight_loss)}>Weight Loss</button>
        </div>
      </div>

      <main className="scanner-section">
        <BarcodeScanner onNewScanResult={handleNewScanResult} />
      </main>

      <section className="results-section">
        {isLoading && <p>Loading...</p>}
        {error && <p className="error-message">{error}</p>}
        {productData && (
          <ErrorBoundary>
            <Verdict productData={productData} userProfile={userProfile} />
          </ErrorBoundary>
        )}
        {!isLoading && !error && !productData && <p>Scan a product to see the results</p>}
      </section>
    </div>
  );
}

export default HomePage;