import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './HomePage.css';
import BarcodeScanner from './BarcodeScanner';
import Verdict from './Verdict';
import ErrorBoundary from './ErrorBoundary';

function HomePage({ userProfile }) {
  const [scannedCode, setScannedCode] = useState(null);
  const [productData, setProductData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleNewScanResult = useCallback((decodedText) => {
    // Debouncing Fix: Ignore new scans if one is already processing.
    if (isLoading) {
      return;
    }
    if (decodedText) {
      setScannedCode(decodedText);
    }
  }, [isLoading]); // Dependency on isLoading is important

  const handleProfileReset = () => {
    localStorage.removeItem('foodleUserProfile');
    window.location.reload();
  };
  
  // The useEffect for fetching data...
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
          setError('Sorry, this product is not in our database.');
        }
      } catch (err) {
        setError('Oops! We had trouble fetching data. Please try again.');
      } finally {
        setIsLoading(false); // Ensure loading is set to false in all cases
      }
    };
    fetchProductData();
  }, [scannedCode]);

  return (
    <div className="homepage-container">
      <header>
        <img src="/logo.png" alt="Foodle Logo" className="logo" />
      </header>
      <main className="scanner-section">
        <BarcodeScanner onNewScanResult={handleNewScanResult} />
      </main>
      <section className="results-section">
        {isLoading && <p>Decoding your food...</p>}
        {error && <p className="error-message">{error}</p>}
        {productData && (
          <div className="verdict-wrapper">
            <ErrorBoundary>
              <Verdict productData={productData} userProfile={userProfile} />
            </ErrorBoundary>
          </div>
        )}
        {!isLoading && !error && !productData && <p>Your food's story will appear here...</p>}
      </section>
      <button onClick={handleProfileReset} className="reset-profile-button">
        Reset Profile & Start Over
      </button>
    </div>
  );
}

export default HomePage;