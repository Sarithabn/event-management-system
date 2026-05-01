import React from 'react';

const Spinner = ({ fullPage, size = 40 }) => {
  const spinner = (
    <div className="spinner" style={{ width: size, height: size }}>
      <div className="spinner-ring"></div>
    </div>
  );

  if (fullPage) {
    return (
      <div className="spinner-overlay">
        {spinner}
        <p className="spinner-text">Loading...</p>
      </div>
    );
  }

  return spinner;
};

export default Spinner;
