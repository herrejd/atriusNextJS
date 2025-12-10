import Init from 'atriusmaps-node-sdk';

let mapInstance = null;

export async function getMapInstance() {
  // Return existing instance if already initialized
  if (mapInstance) {
    return mapInstance;
  }

  // Configure the SDK
  const config = {
    accountId: process.env.ATRIUSMAPS_ACCOUNT_ID,
    venueId: process.env.ATRIUSMAPS_VENUE_ID,
    // headless is automatically set to true by the SDK
  };

  // Optional: Enable logging for debugging
  // Init.setLogging(true);

  try {
    // Initialize the map
    mapInstance = await Init.newMap(config);
    console.log('Atrius Maps SDK initialized successfully');
    return mapInstance;
  } catch (error) {
    console.error('Failed to initialize Atrius Maps SDK:', error);
    throw error;
  }
}

// Get SDK version (optional utility)
export function getSDKVersion() {
  return Init.getVersion();
}