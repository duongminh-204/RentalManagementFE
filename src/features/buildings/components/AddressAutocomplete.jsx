import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import { GeoAlt, Compass } from 'react-bootstrap-icons';

const DEFAULT_CENTER = [10.8231, 106.6297]; // Ho Chi Minh City

export default function AddressAutocomplete({ address, latitude, longitude, onChange, error }) {
  const mapContainerRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);

  const [searchQuery, setSearchQuery] = useState(address || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  // Sync searchQuery when address prop changes from outside
  useEffect(() => {
    if (address !== undefined) {
      setSearchQuery(address);
    }
  }, [address]);

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
      // We don't destroy the map on minor updates, but if mapContainer is gone we should
    };
  }, [latitude, longitude]);

  // Handle marker drag end (reverse geocoding)
  const handleMarkerDragEnd = useCallback(async (event) => {
    const latlng = event.target.getLatLng();
    const lat = latlng.lat;
    const lng = latlng.lng;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`
      );
      const data = await response.json();
      const addr = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      
      setSearchQuery(addr);
      onChange({ address: addr, latitude: lat, longitude: lng });
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      onChange({ address: searchQuery, latitude: lat, longitude: lng });
    }
  }, [onChange, searchQuery]);

  // Search Address suggestions (Autocomplete) using Nominatim
  const fetchSuggestions = async (query) => {
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    setLoadingSuggestions(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&countrycodes=vn&limit=5&accept-language=vi`
      );
      const data = await response.json();
      setSuggestions(
        data.map((item) => ({
          display_name: item.display_name,
          lat: parseFloat(item.lat),
          lon: parseFloat(item.lon),
        }))
      );
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Debounced input change handler
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowDropdown(true);

    // Call suggestion with a slight delay
    const delayDebounceFn = setTimeout(() => {
      fetchSuggestions(value);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
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
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`
          );
          const data = await response.json();
          const addr = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

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
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
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
            {showDropdown && (suggestions.length > 0 || loadingSuggestions) && (
              <ul className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-lg bg-slate-800 border border-slate-700 text-slate-200 z-50 divide-y divide-slate-700 shadow-xl">
                {loadingSuggestions ? (
                  <li className="px-4 py-3 text-sm text-slate-400">Đang tìm kiếm địa chỉ...</li>
                ) : (
                  suggestions.map((item, idx) => (
                    <li
                      key={idx}
                      onClick={() => handleSelectSuggestion(item)}
                      className="px-4 py-2.5 text-sm hover:bg-slate-700 cursor-pointer transition-colors leading-snug"
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
      <div className="rounded-xl overflow-hidden border border-slate-600/50 shadow-lg relative z-0">
        <div 
          ref={mapContainerRef} 
          style={{ width: '100%', height: '300px' }} 
          className="z-0"
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
