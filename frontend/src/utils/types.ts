export interface Report {
  _id: string;
  type: string;
  urgency: string;
  description?: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  createdAt: string;
}
  export interface TrendingAlert {
    _id: string;
    type: string;
    summary?: string;
    location: {
      type: string;
      coordinates: [number, number];
    };
    reportCount: number;
    reports: Report[];
    createdAt: string;
    expiresAt: string;
  }

export interface Alert {
    _id: string;
    type: string;
    location: {
      type: string;
      coordinates: [number, number];
    };
    severity: 'low' | 'medium' | 'high';
    description: string;
    expiresAt: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  }


  export interface Operation {
    _id: string;
    name: string;
    description: string;
    status: 'planned' | 'active' | 'completed' | 'cancelled';
    location: {
      type: string;
      coordinates: [number, number];
    };
    startDate: string;
    endDate?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Post {
    _id: string;
    content: string;
    media?: string[];
    operation: string;
    author: string;
    createdAt: string;
    updatedAt: string;
  }



  export interface Zone {
    _id: string;
    name: string;
    type: 'safe-area' | 'evacuation' | 'medical' | 'shelter' | 'hazard';
    description?: string;
    coordinates?: [number, number][];  // Flat format
  geometry?: {                      // GeoJSON format
    type: 'Polygon';
    coordinates: [number, number][][];
  };
    createdBy: string; // Admin ID
    createdAt?: string;
    updatedBy?: string; // Admin ID
    updatedAt?: string;
  }
  
  export interface Route {
    _id: string;
    name: string;
    routeType: 'evacuation' | 'supply' | 'emergency-access';
    // Make geometry optional since we'll accept coordinates directly
    geometry?: {
      type: 'LineString';
      coordinates: [number, number][];
    };
    // Support both formats
    coordinates?: [number, number][];
    startPoint: {
      type: 'Point';
      coordinates: [number, number];
    };
    endPoint: {
      type: 'Point';
      coordinates: [number, number];
    };
    distance?: number; // Make optional since backend can calculate
    safetyScore?: number; // Make optional
    avoids?: {
      zones: string[];
      alerts: string[];
    };
    createdBy: string;
    createdAt?: string; // Make optional
    updatedAt?: string;
  }