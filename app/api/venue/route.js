import { NextResponse } from 'next/server';
import { getMapInstance } from '@/lib/mapService';

export async function GET(request) {
  try {
    const map = await getMapInstance();
    const venueData = await map.getVenueData();
    
    return NextResponse.json({
      success: true,
      data: venueData
    });
  } catch (error) {
    console.error('Error fetching venue data:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}