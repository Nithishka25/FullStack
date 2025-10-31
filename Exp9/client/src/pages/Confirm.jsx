import React from 'react';
import { useLocation, Link } from 'react-router-dom';

export default function Confirm() {
  const { state } = useLocation();
  return (
    <div>
      <h2>Submission Received</h2>
      <p>Response ID: {state?.id || 'N/A'}</p>
      <Link to="/survey">Back to Survey</Link>
    </div>
  );
}
