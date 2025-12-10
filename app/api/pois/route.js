import { NextResponse } from 'next/server';
import { getMapInstance } from '@/lib/mapService';

export async function GET(request) {
  try {
    console.log('API Route: Starting to fetch POIs...');
    
    // Get the map instance
    const map = await getMapInstance();
    console.log('API Route: Map instance obtained');
    
    // Call getAllPOIs function
    const pois = await map.getAllPOIs();
    console.log('API Route: getAllPOIs returned:', typeof pois, 'Is array?', Array.isArray(pois));
    
    // Convert object to array
    let poisArray;
    if (Array.isArray(pois)) {
      poisArray = pois;
    } else if (pois && typeof pois === 'object') {
      // Convert object with numeric keys to array
      poisArray = Object.values(pois);
      console.log('API Route: Converted object to array, length:', poisArray.length);
    } else {
      poisArray = [];
    }
    
    // Return the POIs as JSON
    return NextResponse.json({
      success: true,
      data: poisArray,
      count: poisArray.length
    });
  } catch (error) {
    console.error('Error fetching POIs:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch POIs',
        message: error.message
      },
      { status: 500 }
    );
  }
}