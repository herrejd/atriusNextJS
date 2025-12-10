import { NextResponse } from 'next/server';
import { getMapInstance } from '@/lib/mapService';

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { success: false, error: 'Query parameter "q" is required' },
      { status: 400 }
    );
  }

  try {
    const map = await getMapInstance();
    const results = await map.search(query);
    
    // Convert to array if it's an object
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
      query
    });
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}