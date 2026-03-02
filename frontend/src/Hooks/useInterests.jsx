// Hooks/useInterests.js
import { useState, useEffect } from 'react';

export default function useInterests() {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/interests/all`);
        const result = await response.json();

        if (result.success) {
          setInterests(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      
    };
    

    fetchInterests();
  }, []);

  return { interests, loading, error };
}
