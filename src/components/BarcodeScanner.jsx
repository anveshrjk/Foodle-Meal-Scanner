import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useState } from 'react';

const BarcodeScanner = ({ onNewScanResult }) => {
  const [isScanning, setIsScanning] = useState(false);
  // Using a state for the scanner instance to manage it properly
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    const newScanner = new Html5Qrcode('reader', false);
    setScanner(newScanner);

    return () => {
      if (scanner && scanner.isScanning) {
        scanner.stop().catch(err => console.error("Error stopping scanner on cleanup.", err));
      }
    };
  }, []); // Runs only once

  const handleStart = () => {
    if (!scanner) return;
    const config = { fps: 10, qrbox: { width: 250, height: 150 }, facingMode: "environment" };
    
    const onScanSuccess = (decodedText, decodedResult) => {
      onNewScanResult(decodedText);
      handleStop();
    };
    
    scanner.start({ facingMode: "environment" }, config, onScanSuccess)
      .then(() => setIsScanning(true))
      .catch(err => console.error("Failed to start scanner.", err));
  };

  const handleStop = () => {
    if (scanner && scanner.isScanning) {
      scanner.stop()
        .then(() => setIsScanning(false))
        .catch(err => console.error("Failed to stop scanner.", err));
    }
  };

  const buttonStyle = {
    backgroundColor: '#42b883',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div id="reader" style={{ width: '100%', display: isScanning ? 'block' : 'none', marginBottom: '1rem' }} />
      {!isScanning ? (
        <button onClick={handleStart} style={buttonStyle}>Start Scanner</button>
      ) : (
        <button onClick={handleStop} style={buttonStyle}>Stop Scanner</button>
      )}
    </div>
  );
};

export default BarcodeScanner;