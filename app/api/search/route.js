// Usage: http://localhost:3000/api/search?q=security&details=true

import { NextResponse } from 'next/server';
import { getMapInstance } from '@/lib/mapService';

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const details = searchParams.get('details'); // Get the details parameter

  if (!query) {
    return NextResponse.json(
      { success: false, error: 'Query parameter "q" is required' },
      { status: 400 }
    );
  }

  try {
    const map = await getMapInstance();
    
    // Convert details parameter to boolean
    // details=true or details=1 will set it to true
    // If not provided, defaults to false (returns POI IDs only)
    const includeDetails = details === 'true' || details === '1';
    
    const results = await map.search(query, includeDetails);
    
    // Convert to array if it's an object (when details=true, returns objects)
    let resultsArray;
    if (Array.isArray(results)) {
      resultsArray = results;
    } else if (results && typeof results === 'object') {
      resultsArray = Object.values(results);
    } else {
      resultsArray = [];
    }
    
    return NextResponse.json({
      success: true,
      data: resultsArray,
      count: resultsArray.length,
      query,
      includeDetails
    });
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}