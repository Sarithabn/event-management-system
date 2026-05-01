import React, { useState, useRef, useEffect, useCallback } from 'react';
import jsQR from 'jsqr';
import { bookingsAPI } from '../../services/api';
import { formatDate } from '../../utils/helpers';

const QRScanner = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [manualRef, setManualRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const streamRef = useRef(null);
  const animRef = useRef(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setScanning(false);
  }, []);

  const validateBooking = async (ref) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await bookingsAPI.checkIn({ bookingRef: ref });
      setResult({ ...data, type: 'checkin' });
      stopCamera();
    } catch (err) {
      setError(err.response?.data?.message || 'Validation failed');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const scanFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code) {
        try {
          const parsed = JSON.parse(code.data);
          if (parsed.bookingRef) validateBooking(parsed.bookingRef);
          return;
        } catch { /* not JSON */ }
      }
    }
    animRef.current = requestAnimationFrame(scanFrame);
  }, []);

  const startCamera = async () => {
    setResult(null);
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setScanning(true);
      animRef.current = requestAnimationFrame(scanFrame);
    } catch {
      setError('Camera access denied. Use manual entry below.');
    }
  };

  useEffect(() => () => stopCamera(), [stopCamera]);

  return (
    <div className="qr-scanner">
      <div className="qr-scanner-header">
        <h2>QR Check-In Scanner</h2>
        <p>Scan attendee QR codes to check them in</p>
      </div>

      <div className="qr-camera-section">
        {scanning ? (
          <div className="qr-camera-wrapper">
            <video ref={videoRef} className="qr-video" playsInline />
            <canvas ref={canvasRef} className="qr-canvas-hidden" />
            <div className="qr-overlay">
              <div className="qr-scan-line" />
              <div className="qr-corners" />
            </div>
            <button className="btn btn-outline" onClick={stopCamera}>Stop Camera</button>
          </div>
        ) : (
          <button className="btn btn-primary btn-lg qr-start-btn" onClick={startCamera}>
            📷 Start Camera Scan
          </button>
        )}
      </div>

      <div className="qr-divider"><span>OR</span></div>

      <div className="qr-manual">
        <h3>Manual Entry</h3>
        <div className="qr-manual-form">
          <input className="form-input" placeholder="Enter booking reference (e.g. EVT-XXXXX)" value={manualRef} onChange={e => setManualRef(e.target.value.toUpperCase())} />
          <button className="btn btn-primary" disabled={!manualRef || loading} onClick={() => validateBooking(manualRef)}>
            {loading ? 'Checking...' : 'Check In'}
          </button>
        </div>
      </div>

      {error && <div className="qr-error"><span>⚠️</span> {error}</div>}

      {result && (
        <div className={`qr-result ${result.booking?.checkedIn ? 'qr-result-success' : 'qr-result-warning'}`}>
          <div className="qr-result-icon">{result.booking?.checkedIn ? '✅' : '⚠️'}</div>
          <h3>{result.message || 'Check-in result'}</h3>
          {result.booking && (
            <div className="qr-result-details">
              <div className="qr-detail"><label>Ref:</label><span>{result.booking.bookingRef || result.booking.ref}</span></div>
              <div className="qr-detail"><label>Attendee:</label><span>{result.booking.user?.name}</span></div>
              <div className="qr-detail"><label>Event:</label><span>{result.booking.event?.title}</span></div>
              <div className="qr-detail"><label>Tickets:</label><span>{result.booking.quantity}</span></div>
              {result.booking.checkedInAt && <div className="qr-detail"><label>Checked In:</label><span>{formatDate(result.booking.checkedInAt)}</span></div>}
            </div>
          )}
          <button className="btn btn-outline" onClick={() => { setResult(null); setManualRef(''); }}>
            Scan Next
          </button>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
