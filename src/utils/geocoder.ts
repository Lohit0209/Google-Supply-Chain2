import type { Hub } from '../data/logisticsData';

export interface Coordinates {
  lat: number;
  lng: number;
}

const CACHE = new Map<string, Hub[]>();

export class Geocoder {
  /**
   * Fetches location suggestions from Nominatim (OpenStreetMap)
   * Highly accurate for global cities, airports (IATA), and ports.
   */
  static async fetchSuggestions(query: string): Promise<Hub[]> {
    if (!query || query.length < 2) return [];
    
    const normalizedQuery = query.toLowerCase().trim();
    if (CACHE.has(normalizedQuery)) return CACHE.get(normalizedQuery)!;

    try {
      // Prioritize logistics terms if likely an IATA/Port code
      const searchQuery = query.length === 3 ? `${query} airport` : query;
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&addressdetails=1&limit=5`,
        {
          headers: {
            'User-Agent': 'LogisticsProtocolV4/1.0'
          }
        }
      );

      if (!response.ok) throw new Error('Geocoding service unavailable');
      
      const data = await response.json();
      
      const suggestions: Hub[] = data.map((item: any) => {
        const addr = item.address;
        const name = item.display_name.split(',')[0];
        const city = addr.city || addr.town || addr.village || addr.suburb || name;
        const country = addr.country || '';
        
        // Infer logistics type
        let type: Hub['type'] = 'road';
        if (item.type === 'aerodrome' || name.toLowerCase().includes('airport')) type = 'air';
        else if (item.category === 'maritime' || name.toLowerCase().includes('port')) type = 'sea';

        return {
          id: `osm-${item.place_id}`,
          name: item.display_name,
          city,
          country,
          type,
          coordinates: [parseFloat(item.lat), parseFloat(item.lon)],
          congestionIndex: Math.random() * 0.5 + 0.2 // Simulated index for new locations
        };
      });

      CACHE.set(normalizedQuery, suggestions);
      return suggestions;
    } catch (error) {
      console.error('Geocoding error:', error);
      return [];
    }
  }

  /**
   * Quick search for precise coordinates
   */
  static async search(query: string): Promise<Coordinates | null> {
    const results = await this.fetchSuggestions(query);
    if (results.length > 0) {
      return { lat: results[0].coordinates[0], lng: results[0].coordinates[1] };
    }
    return null;
  }
}
