const VIETNAM_BBOX = '102.14,8.18,109.46,23.39';

const formatPhotonAddress = (properties = {}) => {
  const parts = [
    properties.name,
    properties.housenumber && properties.street
      ? `${properties.housenumber} ${properties.street}`
      : properties.street,
    properties.locality,
    properties.district,
    properties.city,
    properties.state,
    properties.country,
  ].filter(Boolean);

  return [...new Set(parts)].join(', ');
};

const mapPhotonFeature = (feature) => ({
  name: formatPhotonAddress(feature.properties) || 'Địa điểm không tên',
  lat: feature.geometry.coordinates[1],
  lng: feature.geometry.coordinates[0],
});

export async function searchAddresses(query, { limit = 5 } = {}) {
  const trimmed = query?.trim();
  if (!trimmed || trimmed.length < 2) {
    return [];
  }

  const photonUrl = new URL('https://photon.komoot.io/api/');
  photonUrl.searchParams.set('q', trimmed);
  photonUrl.searchParams.set('limit', String(limit));
  photonUrl.searchParams.set('bbox', VIETNAM_BBOX);

  try {
    const response = await fetch(photonUrl);
    if (!response.ok) {
      throw new Error(`Photon error: ${response.status}`);
    }

    const data = await response.json();
    const results = (data.features || []).map(mapPhotonFeature);
    if (results.length > 0) {
      return results;
    }
  } catch (error) {
    console.warn('Photon search failed, trying Nominatim fallback:', error);
  }

  const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    trimmed
  )}&countrycodes=vn&limit=${limit}&accept-language=vi`;

  const response = await fetch(nominatimUrl, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Nominatim error: ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((item) => ({
    name: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
  }));
}

export async function reverseGeocode(lat, lng) {
  const photonUrl = `https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}`;

  try {
    const response = await fetch(photonUrl);
    if (response.ok) {
      const data = await response.json();
      const feature = data.features?.[0];
      if (feature) {
        return mapPhotonFeature(feature).name;
      }
    }
  } catch (error) {
    console.warn('Photon reverse failed, trying Nominatim fallback:', error);
  }

  const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`;
  const response = await fetch(nominatimUrl, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Reverse geocode error: ${response.status}`);
  }

  const data = await response.json();
  return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}
