'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPOIs();
  }, []);

  const fetchPOIs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/pois');
      const data = await response.json();
      
      if (data.success) {
        // Ensure data.data is an array
        const poisArray = Array.isArray(data.data) ? data.data : [];
        setPois(poisArray);
      } else {
        setError(data.error || 'Failed to fetch POIs');
      }
    } catch (err) {
      setError('Network error: Failed to fetch POIs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading POIs...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {error}</p>
          <button 
            onClick={fetchPOIs}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (pois.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No POIs found</p>
          <button 
            onClick={fetchPOIs}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Refresh
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Points of Interest</h1>
        <p className="text-gray-600 mb-8">Total POIs: {pois.length}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pois.map((poi, index) => (
            <div 
              key={poi.id || index} 
              className="border rounded-lg p-6 shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-xl font-semibold mb-2">{poi.name || 'Unnamed POI'}</h3>
              {poi.type && (
                <p className="text-sm text-gray-500 mb-2">{poi.type}</p>
              )}
              {poi.description && (
                <p className="text-sm text-gray-700">{poi.description}</p>
              )}
              {poi.id && (
                <p className="text-xs text-gray-400 mt-2">ID: {poi.id}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}