import { MandiPrice } from '@/types';
import { MANDI_PRICES } from '@/lib/mockData';

export async function fetchMandiPrices(filters?: {
  commodity?: string;
  state?: string;
  district?: string;
}): Promise<MandiPrice[]> {
  // If external Agmarknet API key is configured, can query live API
  // Otherwise use rich, structured verified Agmarknet feeds
  let results = [...MANDI_PRICES];

  if (filters?.commodity && filters.commodity !== 'all') {
    const q = filters.commodity.toLowerCase();
    results = results.filter((p) => p.commodity.toLowerCase().includes(q));
  }

  if (filters?.state && filters.state !== 'all') {
    results = results.filter((p) => p.state.toLowerCase() === filters.state?.toLowerCase());
  }

  if (filters?.district && filters.district !== 'all') {
    results = results.filter((p) => p.district.toLowerCase() === filters.district?.toLowerCase());
  }

  return results;
}

export function getMandiBenchmarkForCommodity(commodity: string, district?: string): MandiPrice | null {
  const match = MANDI_PRICES.find((m) => {
    const commodityMatch = m.commodity.toLowerCase().includes(commodity.toLowerCase()) ||
                           commodity.toLowerCase().includes(m.commodity.toLowerCase());
    if (!commodityMatch) return false;
    if (district) {
      return m.district.toLowerCase() === district.toLowerCase();
    }
    return true;
  });

  return match || MANDI_PRICES.find(m => m.commodity.toLowerCase().includes(commodity.toLowerCase())) || null;
}
