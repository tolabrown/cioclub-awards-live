import { env } from "$env/dynamic/private";

export interface ShippingZone {
  zone: string;
  cities: string;
  id: number;
}

export interface ShippingRate {
  anchor: string;
  departure: string;
  arrival: string;
  small: string;
  medium: string;
  large: string;
  deliveryTime: string;
}

export interface JumiaShippingData {
  zones: ShippingZone[];
  rates: ShippingRate[];
}

class JumiaShippingService {
  private cache: JumiaShippingData | null = null;
  private lastFetch: number = 0;
  private CACHE_DURATION = 1000 * 60 * 60; // 1 hour

  async getData(): Promise<JumiaShippingData> {
    const now = Date.now();
    if (this.cache && now - this.lastFetch < this.CACHE_DURATION) {
      return this.cache;
    }

    const shippingUrl = env.JUMIA_SHIPPING;

    if (!shippingUrl || !shippingUrl.startsWith('http')) {
      console.error("[JumiaShippingService] Invalid or missing JUMIA_SHIPPING URL:", shippingUrl);
      return { zones: [], rates: [] };
    }

    try {
      const response = await fetch(shippingUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const rawData = await response.json();

      // The data comes as an array with one object containing zones and rates flattened or nested.
      // Based on user input: [{"zones": [...], "rates": [...]}]
      const data = Array.isArray(rawData) ? rawData[0] : rawData;

      this.cache = data;
      this.lastFetch = now;
      return data;
    } catch (error) {
      console.error("Failed to fetch Jumia Shipping data:", error);
      return { zones: [], rates: [] };
    }
  }

  async getZones() {
    const data = await this.getData();
    return data.zones;
  }

  async getRates() {
    const data = await this.getData();
    return data.rates;
  }

  async calculateShipping(arrivalZoneName: string, size: 'small' | 'medium' | 'large' = 'small', departureZoneName: string = 'Zone 1') {
    const rates = await this.getRates();
    const rate = rates.find(r => r.departure === departureZoneName && r.arrival === arrivalZoneName);

    if (!rate) return 0;

    const priceStr = rate[size]; // e.g., "₦1,400"
    return parseInt(priceStr.replace(/[^\d]/g, '')) || 0;
  }

  async getZoneForCity(cityName: string) {
    const zones = await this.getZones();
    return zones.find(z => z.cities.toLowerCase().includes(cityName.toLowerCase()));
  }
}

export const jumiaShipping = new JumiaShippingService();
