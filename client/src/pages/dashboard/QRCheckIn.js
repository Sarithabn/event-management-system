import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import QRScanner from '../../components/qr/QRScanner';

const QRCheckIn = () => (
  <DashboardLayout>
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>📷 QR Check-In</h1>
          <p>Scan attendee QR codes to check them in to your events</p>
        </div>
      </div>
      <QRScanner />
    </div>
  </DashboardLayout>
);

export default QRCheckIn;
