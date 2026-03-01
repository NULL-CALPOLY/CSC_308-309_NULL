import React, { useState } from 'react';
import AddressAutocomplete from './Components/AddressAutocomplete/AddressAutocomplete';

export default function TestAddress() {
  const [result, setResult] = useState(null);

  return (
    <div style={{ padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px' }}>Address Autocomplete Test</h2>

      <AddressAutocomplete
        placeholder="Start typing an address..."
        onSelect={(data) => {
          console.log('Selected:', data);
          setResult(data);
        }}
      />

      {result && (
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#f0f4ff',
          borderRadius: '8px',
          fontSize: '14px',
          lineHeight: '1.8'
        }}>
          <strong>✅ Result:</strong><br />
          <strong>Address:</strong> {result.address}<br />
          <strong>Latitude:</strong> {result.lat}<br />
          <strong>Longitude:</strong> {result.lng}
        </div>
      )}
    </div>
  );
}