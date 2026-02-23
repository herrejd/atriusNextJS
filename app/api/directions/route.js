import { NextResponse } from 'next/server';
import { getMapInstance } from '@/lib/mapService';

/**
 * Parse location parameter into proper format for Atrius SDK
 * Accepts either:
 * - POI ID: "1025" (numeric)
 * - Coordinates: "36.085,-115.150,1" (lat,lng,ordinal)
 */
function parseLocation(locationString) {
  if (!locationString) {
    return null;
  }

  // Try to parse as POI ID (numeric)
  const poiId = parseInt(locationString, 10);
  if (!isNaN(poiId)) {
    return { poiId };
  }

  // Try to parse as coordinates (lat,lng,ordinal)
  const parts = locationString.split(',');
  if (parts.length === 3) {
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    const ord = parseInt(parts[2], 10);

    if (!isNaN(lat) && !isNaN(lng) && !isNaN(ord)) {
      return { lat, lng, ord };
    }
  }

  // Invalid format
  throw new Error(
    'Invalid location format. Use either POI ID (e.g., "1025") or coordinates (e.g., "36.085,-115.150,1")'
  );
}

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');
  const accessibleParam = searchParams.get('accessible');

  // Validate required parameters
  if (!fromParam) {
    return NextResponse.json(
      { success: false, error: 'Query parameter "from" is required' },
      { status: 400 }
    );
  }

  if (!toParam) {
    return NextResponse.json(
      { success: false, error: 'Query parameter "to" is required' },
      { status: 400 }
    );
  }

  // Parse accessibility parameter
  const accessible = accessibleParam === 'true';

  try {
    // Parse location parameters
    let fromLocation;
    let toLocation;

    try {
      fromLocation = parseLocation(fromParam);
      toLocation = parseLocation(toParam);
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: parseError.message },
        { status: 400 }
      );
    }

    // Get map instance and fetch directions
    const map = await getMapInstance();
    const directions = await map.getDirections(
      fromLocation,
      toLocation,
      accessible
    );

    return NextResponse.json({
      success: true,
      data: directions,
      from: fromParam,
      to: toParam,
      accessible
    });
  } catch (error) {
    console.error('Error fetching directions:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
