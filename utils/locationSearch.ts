export interface LocationSuggestion {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
}

interface NominatimLocationResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';

export const searchLocationSuggestions = async (
  query: string,
  signal?: AbortSignal,
): Promise<LocationSuggestion[]> => {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 3) {
    return [];
  }

  const params = new URLSearchParams({
    q: trimmedQuery,
    format: 'jsonv2',
    addressdetails: '1',
    limit: '5',
  });

  const response = await fetch(`${NOMINATIM_SEARCH_URL}?${params.toString()}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    throw new Error('Failed to load location suggestions.');
  }

  const results = (await response.json()) as NominatimLocationResult[];

  return results.map((result) => ({
    id: String(result.place_id),
    label: result.display_name,
    latitude: Number(result.lat),
    longitude: Number(result.lon),
  }));
};
