import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './HomePage.css';
import BarcodeScanner from './BarcodeScanner';
import Verdict from './Verdict';
import ErrorBoundary from './ErrorBoundary';

function HomePage() {
  // This mock profile simulates a logged-in user for the demo.
  const mockUserProfile = {
    goals: ['weight_loss'],
    conditions: ['diabetes'],
  };

  const [scannedCode, setScannedCode] = useState(null);
  const [productData, setProductData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // This is the stable callback function we pass to the scanner.
  const handleNewScanResult = useCallback((decodedText) => {
    if (decodedText) {
      setScannedCode(decodedText);
    }
  }, []);

  // This effect runs whenever a new barcode is scanned to fetch data.
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
        console.error("API call failed:", err);
        setError('Failed to fetch data. Please try again.');
      }

      setIsLoading(false);
    };

    fetchProductData();
  }, [scannedCode]);

  return (
    <div className="homepage-container">
      <header className="homepage-header">
        <h1>Foodle</h1>
      </header>

      <main className="scanner-section">
        <BarcodeScanner onNewScanResult={handleNewScanResult} />
      </main>

      <footer className="results-section">
        {isLoading && <p>Loading...</p>}
        {error && <p className="error-message">{error}</p>}
        
        {productData && (
          <ErrorBoundary>
            <Verdict productData={productData} userProfile={mockUserProfile} />
          </ErrorBoundary>
        )}
        
        {!isLoading && !error && !productData && <p>Results will show up here</p>}
      </footer>
    </div>
  );
}

export default HomePage;