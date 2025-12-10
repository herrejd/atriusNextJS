import { NextResponse } from 'next/server';
import { getMapInstance } from '@/lib/mapService';

export async function GET(request, { params }) {
  try {
    // Await params in Next.js 15+
    const { id } = await params;
    const poiId = parseInt(id, 10);
    
    if (isNaN(poiId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid POI ID - must be a number' },
        { status: 400 }
      );
    }
    
    const map = await getMapInstance();
    const poi = await map.getPOIDetails(poiId);
    
    return NextResponse.json({
      success: true,
      data: poi
    });
  } catch (error) {
    console.error('Error fetching POI details:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}