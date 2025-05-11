import { TrendingAlert } from './types';
import { getRegionName } from './moroccoRegions'; 


export const getTypeIcon = (type: string): string => { 
        switch (type.toLowerCase()) {
          case 'fire':
            return '🔥';
          case 'flood':
            return '🌊';
          case 'earthquake':
            return '🌍';
          case 'storm':
            return '🌪️';
          case 'medical':
            return '🩺';
          default:
            return '⚠️';
        }
};
export const capitalize = (text: string): string => { 
   return text.charAt(0).toUpperCase() + text.slice(1);
};
export const generateSummary = (alert: TrendingAlert): string => { 
    const type = capitalize(alert.type);
    const region = getRegionName(alert.location.coordinates);
    return `${type} alert ${region === "Near coordinates" ? 
      "near coordinates" : 
      `in ${region} region`}`;
  };  
export const formatDate = (dateStr: string): string => { 
    const date = new Date(dateStr);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
 };
