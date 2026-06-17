import { useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { GeoAlt, Compass } from 'react-bootstrap-icons';
import { reverseGeocode, searchAddresses } from '../../../utils/geocoding';

const DEFAULT_CENTER = [10.8231, 106.6297]; // Ho Chi Minh City

export default function AddressAutocomplete({ address, latitude, longitude, onChange, error }) {
  const mapContainerRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);

  const [searchQuery, setSearchQuery] = useState(address || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const debounceRef = useRef(null);

  // Sync searchQuery when address prop changes from outside
  useEffect(() => {
    if (address !== undefined) {
      setSearchQuery(address);
    }
  }, [address]);

  const refreshMapLayout = useCallback(() => {
    const map = mapInstance.current;
    if (!map) return;

    map.invalidateSize();

    if (latitude && longitude) {
      map.setView([latitude, longitude], map.getZoom());
    }
  }, [latitude, longitude]);

  // Leaflet icon fix for Vite
  useEffect(() => {
    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
    L.Marker.prototype.options.icon = defaultIcon;
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialCenter = latitude && longitude ? [latitude, longitude] : DEFAULT_CENTER;
    const initialZoom = latitude && longitude ? 16 : 13;

    // Create map instance if it doesn't exist
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView(initialCenter, initialZoom);

      // Add OpenStreetMap tile layer (Bright/standard styling like Google Maps)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstance.current);
    } else {
      mapInstance.current.setView(initialCenter, initialZoom);
    }

    // Handle Marker
    if (latitude && longitude) {
      if (!markerInstance.current) {
        markerInstance.current = L.marker([latitude, longitude], {
          draggable: true,
        }).addTo(mapInstance.current);

        // Marker dragend event to reverse geocode
        markerInstance.current.on('dragend', handleMarkerDragEnd);
      } else {
        markerInstance.current.setLatLng([latitude, longitude]);
      }
    } else {
      if (markerInstance.current) {
        mapInstance.current.removeLayer(markerInstance.current);
        markerInstance.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerInstance.current = null;
      }
    };
  }, [latitude, longitude]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    refreshMapLayout();

    const resizeTimers = [100, 350, 700].map((delay) =>
      window.setTimeout(refreshMapLayout, delay)
    );

    const observer = new ResizeObserver(() => {
      refreshMapLayout();
    });

    observer.observe(mapContainerRef.current);

    return () => {
      resizeTimers.forEach((timerId) => window.clearTimeout(timerId));
      observer.disconnect();
    };
  }, [refreshMapLayout]);

  // Handle marker drag end (reverse geocoding)
  const handleMarkerDragEnd = useCallback(async (event) => {
    const latlng = event.target.getLatLng();
    const lat = latlng.lat;
    const lng = latlng.lng;

    try {
      const addr = await reverseGeocode(lat, lng);
      setSearchQuery(addr);
      onChange({ address: addr, latitude: lat, longitude: lng });
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      onChange({ address: searchQuery, latitude: lat, longitude: lng });
    }
  }, [onChange, searchQuery]);

  const fetchSuggestions = async (query) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setSearchError(null);
      return;
    }

    setLoadingSuggestions(true);
    setSearchError(null);

    try {
      const results = await searchAddresses(query, { limit: 5 });
      setSuggestions(
        results.map((item) => ({
          display_name: item.name,
          lat: item.lat,
          lon: item.lng,
        }))
      );
      if (results.length === 0) {
        setSearchError('Không tìm thấy địa chỉ phù hợp.');
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setSuggestions([]);
      setSearchError('Không thể tải gợi ý địa chỉ. Vui lòng thử lại.');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowDropdown(true);
    setSearchError(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 400);
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion) => {
    const { display_name, lat, lon } = suggestion;
    setSearchQuery(display_name);
    setSuggestions([]);
    setShowDropdown(false);

    onChange({ address: display_name, latitude: lat, longitude: lon });

    if (mapInstance.current) {
      mapInstance.current.setView([lat, lon], 17);
      if (!markerInstance.current) {
        markerInstance.current = L.marker([lat, lon], {
          draggable: true,
        }).addTo(mapInstance.current);
        markerInstance.current.on('dragend', handleMarkerDragEnd);
      } else {
        markerInstance.current.setLatLng([lat, lon]);
      }
    }
  };

  // Geolocation trigger
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ định vị.');
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          const addr = await reverseGeocode(lat, lng);
          setSearchQuery(addr);
          onChange({ address: addr, latitude: lat, longitude: lng });

          if (mapInstance.current) {
            mapInstance.current.setView([lat, lng], 17);
            if (!markerInstance.current) {
              markerInstance.current = L.marker([lat, lng], {
                draggable: true,
              }).addTo(mapInstance.current);
              markerInstance.current.on('dragend', handleMarkerDragEnd);
            } else {
              markerInstance.current.setLatLng([lat, lng]);
            }
          }
        } catch (err) {
          console.error(err);
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        alert('Không thể lấy vị trí hiện tại. Vui lòng cấp quyền truy cập vị trí.');
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.autocomplete-container')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className="space-y-3">
      {/* Search Bar & Autocomplete Dropdown */}
      <div className="relative autocomplete-container">
        <label className="block text-sm font-medium text-slate-300 mb-1">Địa chỉ *</label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={() => setShowDropdown(true)}
              placeholder="Nhập địa chỉ để tìm kiếm..."
              className="w-full rounded-lg bg-slate-700/50 border border-slate-600 px-4 py-2.5 text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            />
            {/* Suggestions Dropdown */}
            {showDropdown && (loadingSuggestions || suggestions.length > 0 || searchError) && (
              <ul className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-lg border border-slate-700 bg-slate-800 text-slate-200 shadow-xl divide-y divide-slate-700">
                {loadingSuggestions ? (
                  <li className="px-4 py-3 text-sm text-slate-400">Đang tìm kiếm địa chỉ...</li>
                ) : searchError ? (
                  <li className="px-4 py-3 text-sm text-slate-400">{searchError}</li>
                ) : (
                  suggestions.map((item, idx) => (
                    <li
                      key={`${item.lat}-${item.lon}-${idx}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectSuggestion(item)}
                      className="cursor-pointer px-4 py-2.5 text-sm leading-snug transition-colors hover:bg-slate-700"
                    >
                      {item.display_name}
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={geoLoading}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            title="Lấy vị trí hiện tại"
          >
            {geoLoading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Compass className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{geoLoading ? 'Đang định vị...' : 'Vị trí của tôi'}</span>
          </button>
        </div>
        {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
      </div>

      {/* Leaflet Map Div */}
      <div className="relative z-0 h-[300px] overflow-hidden rounded-xl border border-slate-600/50 shadow-lg">
        <div
          ref={mapContainerRef}
          className="absolute inset-0 z-0 h-[300px]"
        />
      </div>

      {/* Coordinates Display */}
      {latitude && longitude && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <GeoAlt className="h-3.5 w-3.5 text-indigo-400" />
          <span>Tọa độ: {latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
        </div>
      )}
    </div>
  );
}
