# Next.js Application with Atrius Maps Node SDK Integration

This guide walks through creating a Next.js application and integrating the Atrius Maps Node SDK to call the `getAllPOIs` function.

## Prerequisites

- Node.js 18.17 or later installed
- npm or yarn package manager
- Atrius Maps account with `accountId` and `venueId`

## Step 1: Create a New Next.js Application

```bash
# Create a new Next.js app using create-next-app
npx create-next-app@latest my-atrius-maps-app

# During setup, choose your preferences:
# - TypeScript? (Yes/No)
# - ESLint? (Yes recommended)
# - Tailwind CSS? (Optional)
# - Use App Router? (Yes recommended)
# - Customize default import alias? (No)
```

Navigate into your project:

```bash
cd my-atrius-maps-app
```

## Step 2: Install the Atrius Maps Node SDK

```bash
npm install atriusmaps-node-sdk

# Or with yarn:
yarn add atriusmaps-node-sdk
```

## Step 3: Configure Next.js for Experimental JSON Modules

The SDK requires the `--experimental-json-modules` flag. Update your `package.json` scripts:

**File: `package.json`**

```json
{
  "scripts": {
    "dev": "NODE_OPTIONS='--experimental-json-modules' next dev",
    "build": "NODE_OPTIONS='--experimental-json-modules' next build",
    "start": "NODE_OPTIONS='--experimental-json-modules' next start",
    "lint": "next lint"
  }
}
```

## Step 4: Set Up Environment Variables

Create a `.env.local` file in your project root:

**File: `.env.local`**

```bash
ATRIUSMAPS_ACCOUNT_ID=your_account_id_here
ATRIUSMAPS_VENUE_ID=your_venue_id_here
```

**Important**: Add `.env.local` to your `.gitignore` to keep credentials secure.

## Step 5: Project Structure

Your project should look like this:

```
my-atrius-maps-app/
├── app/
│   ├── api/
│   │   └── pois/
│   │       └── route.js       # API route for getAllPOIs
│   ├── page.js                # Home page
│   └── layout.js              # Root layout (needs HTML/body tags)
├── lib/
│   └── mapService.js          # Map initialization service
├── .env.local                 # Environment variables
├── package.json
└── next.config.js
```

## Step 5a: Update Root Layout (Fix HTML/Body Tags)

Make sure your root layout includes the required HTML and body tags:

**File: `app/layout.js`**

```javascript
export const metadata = {
  title: 'Atrius Maps POI Viewer',
  description: 'View Points of Interest using Atrius Maps SDK',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

## Step 6: Create a Map Service Module

Create a reusable service to initialize the map:

**File: `lib/mapService.js`**

```javascript
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
```

## Step 7: Create API Route for getAllPOIs

Create an API route that uses the Node SDK on the server side:

**File: `app/api/pois/route.js`**

```javascript
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
```

## Step 8: Create Optional API Routes for Other Commands

You can create additional API routes for other SDK commands:

**File: `app/api/poi/[id]/route.js`** (Get POI details)

```javascript
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
```

**File: `app/api/search/route.js`** (Search POIs)

```javascript
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
```

**File: `app/api/structures/route.js`** (Get structures)

```javascript
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
```

**File: `app/api/venue/route.js`** (Get venue data)

```javascript
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
```

## Step 9: Create Client Component to Display POIs

**File: `app/page.js`**

```javascript
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
```

## Step 10: Run Your Application

```bash
# Development mode
npm run dev

# The app will be available at http://localhost:3000
```

For production:

```bash
# Build
npm run build

# Start production server
npm start
```

## Additional SDK Commands

You can extend your application with other SDK commands:

### Get Directions

```javascript
// In an API route
const directions = await map.getDirections({
  from: { lat: 37.7749, lng: -122.4194 },
  to: { lat: 37.7849, lng: -122.4094 }
});
```

### Get Venue Data

```javascript
const venueData = await map.getVenueData();
```

### Get Structures

```javascript
const structures = await map.getStructures();
```

### Get Available Commands

```javascript
const commands = await map.help();
console.log(commands); // Shows all available commands
```

## Troubleshooting

### JSON Module Errors
If you get errors about JSON modules:
- Ensure `NODE_OPTIONS='--experimental-json-modules'` is in your package.json scripts
- Restart your development server after making changes

### Environment Variable Issues
- Verify `.env.local` exists and contains correct values
- Restart the dev server after changing environment variables
- Check that variable names match exactly (case-sensitive)

### SDK Initialization Errors
- Verify your `accountId` and `venueId` are correct
- Check console logs for specific error messages
- Enable SDK logging: `Init.setLogging(true)` in `lib/mapService.js`

### Import Errors
- Make sure `atriusmaps-node-sdk` is installed
- Check that you're using the correct import statement
- Verify Node.js version is 18.17 or later

## Key Architecture Points

1. **Server-Side Only**: The Atrius Maps Node SDK runs exclusively in API routes (server-side), never in client components

2. **Map Instance Reuse**: The `mapService.js` module caches the map instance to avoid re-initialization on every request

3. **API Route Pattern**: Client components fetch data from Next.js API routes, which in turn use the Node SDK

4. **Environment Variables**: Sensitive credentials are stored in `.env.local` and accessed only server-side

5. **Async Operations**: All SDK commands return promises, so always use `await` or `.then()`

## Resources

- [Atrius Maps SDK Documentation](https://locusmapsjs.readme.io/docs/sdk-configuration)
- [Command Reference](https://locusmapsjs.readme.io/docs/commands)
- [Next.js Documentation](https://nextjs.org/docs)