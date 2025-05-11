// utils/moroccoRegions.ts

export interface Region {
    name: string;
    coordinates: [number, number]; // [longitude, latitude]
    approximateArea: [number, number]; // [width, height] in degrees
  }
  
  export const MOROCCO_REGIONS: Region[] = [
    {
      name: "Tanger-Tétouan-Al Hoceïma",
      coordinates: [-5.555, 35.25],
      approximateArea: [1.5, 1.5]
    },
    {
      name: "Oriental",
      coordinates: [-2.5, 34.0],
      approximateArea: [4.0, 3.0]
    },
    {
      name: "Fès-Meknès",
      coordinates: [-4.5, 34.0],
      approximateArea: [2.5, 2.0]
    },
    {
      name: "Rabat-Salé-Kénitra",
      coordinates: [-6.5, 34.0],
      approximateArea: [2.0, 1.5]
    },
    {
      name: "Béni Mellal-Khénifra",
      coordinates: [-6.0, 32.5],
      approximateArea: [2.5, 2.0]
    },
    {
      name: "Casablanca-Settat",
      coordinates: [-7.5, 33.5],
      approximateArea: [2.0, 1.5]
    },
    {
      name: "Marrakech-Safi",
      coordinates: [-8.0, 31.5],
      approximateArea: [3.0, 2.5]
    },
    {
      name: "Drâa-Tafilalet",
      coordinates: [-5.0, 30.5],
      approximateArea: [5.0, 3.0]
    },
    {
      name: "Souss-Massa",
      coordinates: [-9.0, 30.0],
      approximateArea: [2.5, 2.0]
    },
    {
      name: "Guelmim-Oued Noun",
      coordinates: [-10.0, 28.5],
      approximateArea: [3.0, 2.0]
    },
    {
      name: "Laâyoune-Sakia El Hamra",
      coordinates: [-12.0, 27.5],
      approximateArea: [4.0, 3.0]
    },
    {
      name: "Dakhla-Oued Ed-Dahab",
      coordinates: [-15.0, 23.5],
      approximateArea: [4.0, 3.0]
    }
  ];
  
  export const getRegionName = (coordinates: [number, number]): string => {
    const [lng, lat] = coordinates;
    
    for (const region of MOROCCO_REGIONS) {
      const [regionLng, regionLat] = region.coordinates;
      const [width, height] = region.approximateArea;
      
      const lngMin = regionLng - width/2;
      const lngMax = regionLng + width/2;
      const latMin = regionLat - height/2;
      const latMax = regionLat + height/2;
      
      if (lng >= lngMin && lng <= lngMax && lat >= latMin && lat <= latMax) {
        return region.name;
      }
    }
    
    return "Near coordinates"; // Default if not in any defined region
  };