// Usage: http://localhost:3000/api/search/nearby?q=burgers&lat=36.085&lng=-115.150&limit=5

import { NextResponse } from 'next/server';
import { getMapInstance } from '@/lib/mapService';

// Helper function to calculate distance between two points using Haversine formula
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Earth's radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lng2 - lng1) * Math.PI) / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in meters
}

// Estimate walking time based on distance (default 80 meters/minute = ~3 mph)
function estimateWalkingTime(distanceMeters, speedMpm = 80) {
    return Math.max(1, Math.round(distanceMeters / speedMpm));
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const lat = parseFloat(searchParams.get('lat'));
    const lng = parseFloat(searchParams.get('lng'));
    const limit = parseInt(searchParams.get('limit') || '5', 10);

    // Validate required parameters
    if (!q || isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: q, lat, lng'
      }, { status: 400 });
    }

    const map = await getMapInstance();

    // Search with full details (includeDetails: true)
    const searchResults = await map.search(q, true);

    // Convert to array if it's an object
    const resultsArray = Array.isArray(searchResults)
      ? searchResults
      : Object.values(searchResults);

    // Enrich each POI with distance and walking time
    const enrichedResults = resultsArray
      .map(poi => {
        // Extract POI coordinates (try multiple possible field names)
        // Atrius returns coordinates in position.latitude/longitude
        const poiLat = poi.position?.latitude || poi.latitude || poi.lat;
        const poiLng = poi.position?.longitude || poi.longitude || poi.lng;

        // Skip POIs without coordinates
        if (poiLat === undefined || poiLng === undefined) {
          return null;
        }

        // Calculate distance from kiosk
        const distance = calculateDistance(lat, lng, poiLat, poiLng);
        const walkingTime = estimateWalkingTime(distance);

        return {
          ...poi,
          distance_meters: Math.round(distance),
          walking_time_minutes: walkingTime
        };
      })
      .filter(poi => poi !== null); // Remove POIs without coordinates

    // Sort by distance (closest first)
    enrichedResults.sort((a, b) => a.distance_meters - b.distance_meters);

    // Limit results
    const finalResults = enrichedResults.slice(0, limit);

    return NextResponse.json({
      success: true,
      data: finalResults,
      count: finalResults.length,
      query: q
    });

  } catch (error) {
    console.error('Error in nearby search:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to perform nearby search'
    }, { status: 500 });
  }
}
