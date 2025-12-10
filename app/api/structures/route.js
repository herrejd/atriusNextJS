import { NextResponse } from 'next/server';
import { getMapInstance } from '@/lib/mapService';

export async function GET(request) {
  try {
    const map = await getMapInstance();
    const structures = await map.getStructures();
    
    // Convert to array if it's an object
    let structuresArray;
    if (Array.isArray(structures)) {
      structuresArray = structures;
    } else if (structures && typeof structures === 'object') {
      structuresArray = Object.values(structures);
    } else {
      structuresArray = [];
    }
    
    return NextResponse.json({
      success: true,
      data: structuresArray,
      count: structuresArray.length
    });
  } catch (error) {
    console.error('Error fetching structures:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}