import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';

// This is the new, stable scanner component.
const BarcodeScanner = ({ onNewScanResult }) => {
  // We use a ref to hold the scanner instance.
  const scannerRef = useRef(null);
  // We use state to track if the camera is currently active.
  const [isScanning, setIsScanning] = useState(false);

  // This effect runs only once when the component is created.
  useEffect(() => {
    // Create the scanner instance and store it in our ref.
    scannerRef.current = new Html5Qrcode('reader', false);

    // This is the cleanup function that runs when the component is destroyed.
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error("Error stopping scanner on cleanup.", err));
      }
    };
  }, []);

  // Function to start the camera and scanning.
  const handleStart = () => {
    const config = { fps: 10, qrbox: { width: 250, height: 150 } };

    const onScanSuccess = (decodedText, decodedResult) => {
      onNewScanResult(decodedText);
      // Automatically stop the scanner after a successful scan.
      handleStop();
    };

    const onScanFailure = (error) => {
      // You can add logging here if you want to debug scan failures.
    };

    // Tell the scanner to start.
    scannerRef.current.start(
      { facingMode: "environment" }, // Use the rear camera on phones
      config,
      onScanSuccess,
      onScanFailure
    ).then(() => {
      setIsScanning(true);
    }).catch(err => {
      console.error("Failed to start scanner.", err);
    });
  };

  // Function to stop the camera.
  const handleStop = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop()
        .then(() => setIsScanning(false))
        .catch(err => console.error("Failed to stop scanner.", err));
    }
  };

return (
    <div>
      {/* This is the div the library will use. We've removed the conditional style. */}
      <div id="reader" style={{ width: '100%' }} />

      {/* Our buttons will still correctly show/hide based on the scanning state. */}
      {!isScanning ? (
        <button onClick={handleStart} style={buttonStyle}>Start Scanner</button>
      ) : (
        <button onClick={handleStop} style={buttonStyle}>Stop Scanner</button>
      )}
    </div>
  );
};

// A simple style object for our buttons.
const buttonStyle = {
  backgroundColor: '#42b883',
  color: 'white',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '16px',
  marginTop: '10px',
  fontWeight: 'bold',
};

export default BarcodeScanner;