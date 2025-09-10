import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useState, useRef } from 'react';

const BarcodeScanner = ({ onNewScanResult }) => {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    scannerRef.current = new Html5Qrcode('reader');
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(err => console.error("Error stopping scanner on cleanup.", err));
      }
    };
  }, []);

  const handleStart = () => {
    if (!scannerRef.current) return;
    const config = { fps: 10, qrbox: { width: 250, height: 150 } };
    const onScanSuccess = (decodedText) => {
      onNewScanResult(decodedText);
      handleStop();
    };
    scannerRef.current.start({ facingMode: "environment" }, config, onScanSuccess)
      .then(() => setIsScanning(true))
      .catch(err => alert("Could not start camera. Please grant permission."));
  };

  const handleStop = () => {
    if (scannerRef.current?.isScanning) {
      scannerRef.current.stop()
        .then(() => setIsScanning(false))
        .catch(err => console.error("Failed to stop scanner.", err));
    }
  };
  
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && scannerRef.current) {
      try {
        const decodedText = await scannerRef.current.scanFile(file, false);
        onNewScanResult(decodedText);
      } catch (err) {
        alert("Oops! We couldn't find a barcode in that image.");
      }
    }
  };

  const buttonStyle = {
    backgroundColor: '#42b883', color: 'white', border: 'none',
    padding: '12px 24px', borderRadius: '8px', cursor: 'pointer',
    fontSize: '16px', fontWeight: 'bold', margin: '5px'
  };
  const secondaryButtonStyle = {
    ...buttonStyle, backgroundColor: '#333', border: '1px solid #555'
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div id="reader" style={{ width: '100%', display: isScanning ? 'block' : 'none', marginBottom: '1rem' }} />
      <div className="button-group">
        {!isScanning ? (
          <>
            <button onClick={handleStart} style={buttonStyle}>Scan Your Food</button>
            <button onClick={() => fileInputRef.current.click()} style={secondaryButtonStyle}>Upload an Image</button>
          </>
        ) : (
          <button onClick={handleStop} style={buttonStyle}>Stop Scanning</button>
        )}
      </div>
      <input 
        type="file" ref={fileInputRef} onChange={handleFileChange} 
        accept="image/*" style={{ display: 'none' }} 
      />
    </div>
  );
};

export default BarcodeScanner;