import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { GeoAlt, ArrowCounterclockwise, ArrowRepeat, CarFront, Bicycle, PersonWalking, Search, XCircleFill } from 'react-bootstrap-icons';

export default function BuildingMapRoutes({ buildingName, address, latitude, longitude }) {
  const mapContainerRef = useRef(null);
  const mapInstance = useRef(null);
  const originMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  const debounceRef = useRef(null);

  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const [destination, setDestination] = useState(null); // { name, lat, lng }
  const [matrixLoading, setMatrixLoading] = useState(false);
  const [distanceInfo, setDistanceInfo] = useState({
    driving: null,
    bicycling: null,
    walking: null,
  });

  const origin = [latitude, longitude];

  // Fix Leaflet icons
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
    if (!mapContainerRef.current || !latitude || !longitude) return;

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView(origin, 14);

      // Place zoom control at bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);

      // Add standard bright OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(mapInstance.current);

      // Add Origin Marker (Red Marker for building)
      const redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });

      originMarkerRef.current = L.marker(origin, { icon: redIcon })
        .addTo(mapInstance.current)
        .bindPopup(`<b>${buildingName || 'Tòa nhà'}</b><br/>${address || ''}`)
        .openPopup();

      // Click on map to select destination
      mapInstance.current.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        // Reverse geocode to get address name
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`
          );
          const data = await response.json();
          const name = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          const dest = { name, lat, lng };
          setInputValue(name);
          setDestination(dest);
          calculateRouteAndDistances(dest);
        } catch {
          const name = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          const dest = { name, lat, lng };
          setInputValue(name);
          setDestination(dest);
          calculateRouteAndDistances(dest);
        }
      });
    } else {
      mapInstance.current.setView(origin, 14);
      if (originMarkerRef.current) {
        originMarkerRef.current.setLatLng(origin);
      }
    }
  }, [latitude, longitude, buildingName, address]);

  // Clean markers and polylines helper
  const clearRouteElements = () => {
    if (mapInstance.current) {
      if (destMarkerRef.current) {
        mapInstance.current.removeLayer(destMarkerRef.current);
        destMarkerRef.current = null;
      }
      if (polylineRef.current) {
        mapInstance.current.removeLayer(polylineRef.current);
        polylineRef.current = null;
      }
    }
  };

  // Format OSRM distance and calculate walking/bicycling
  const formatDistance = (meters) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  const formatDuration = (seconds) => {
    const minutes = Math.round(seconds / 60);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours} giờ ${mins > 0 ? `${mins} phút` : ''}`;
    }
    return `${minutes} phút`;
  };

  // Call OSRM API to fetch route and display it
  const calculateRouteAndDistances = async (destLatLng) => {
    if (!latitude || !longitude || !destLatLng) return;
    setMatrixLoading(true);

    clearRouteElements();

    try {
      // OSRM API expects longitude,latitude
      const url = `https://router.project-osrm.org/route/v1/driving/${longitude},${latitude};${destLatLng.lng},${destLatLng.lat}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distanceMeters = route.distance;
        const durationSeconds = route.duration;

        // OSRM coordinates are [lng, lat] -> Map to [lat, lng] for Leaflet
        const polylineCoords = route.geometry.coordinates.map((coord) => [coord[1], coord[0]]);

        // Draw Polyline
        polylineRef.current = L.polyline(polylineCoords, {
          color: '#4285F4',
          weight: 5,
          opacity: 0.85,
        }).addTo(mapInstance.current);

        // Draw Destination Marker (Blue)
        const blueIcon = L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        });

        destMarkerRef.current = L.marker([destLatLng.lat, destLatLng.lng], { icon: blueIcon })
          .addTo(mapInstance.current)
          .bindPopup(`<b>${destLatLng.name}</b>`)
          .openPopup();

        // Fit Map bounds to show route
        const bounds = L.latLngBounds([origin, [destLatLng.lat, destLatLng.lng]]);
        mapInstance.current.fitBounds(bounds, { padding: [60, 60] });

        // Calculate other transit modes
        // Walking: avg speed ~5km/h (1.38 m/s)
        const walkingSeconds = distanceMeters / 1.38;
        // Bicycling: avg speed ~15km/h (4.16 m/s)
        const bicyclingSeconds = distanceMeters / 4.16;

        setDistanceInfo({
          driving: {
            distance: formatDistance(distanceMeters),
            duration: formatDuration(durationSeconds),
          },
          bicycling: {
            distance: formatDistance(distanceMeters),
            duration: formatDuration(bicyclingSeconds),
          },
          walking: {
            distance: formatDistance(distanceMeters),
            duration: formatDuration(walkingSeconds),
          },
        });
      } else {
        alert('Không tìm thấy tuyến đường.');
      }
    } catch (err) {
      console.error('OSRM route error:', err);
      alert('Không thể tính toán tuyến đường di chuyển.');
    } finally {
      setMatrixLoading(false);
    }
  };

  // Nominatim Autocomplete
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
          name: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        }))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setShowDropdown(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 400);
  };

  const handleSelectSuggestion = (suggestion) => {
    setInputValue(suggestion.name);
    setDestination(suggestion);
    setSuggestions([]);
    setShowDropdown(false);
    calculateRouteAndDistances(suggestion);
  };

  const handleClearInput = () => {
    setInputValue('');
    setSuggestions([]);
    setShowDropdown(false);
  };

  const handleReset = () => {
    setDestination(null);
    setInputValue('');
    setDistanceInfo({ driving: null, bicycling: null, walking: null });
    clearRouteElements();
    if (mapInstance.current) {
      mapInstance.current.setView(origin, 14);
      if (originMarkerRef.current) {
        originMarkerRef.current.openPopup();
      }
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.map-search-container')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  if (!latitude || !longitude) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 border border-gray-200 rounded-2xl">
        <GeoAlt size={40} className="text-gray-400 mb-3" />
        <p className="font-semibold text-gray-700">Tòa nhà chưa được định vị</p>
        <p className="text-sm text-gray-500 mt-1 max-w-sm">
          Tòa nhà này chưa có tọa độ GPS. Vui lòng cập nhật tọa độ trên bản đồ tại phần chỉnh sửa tòa nhà để sử dụng tính năng chỉ đường.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto text-gray-800">
      {/* Map container with overlays */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-lg" style={{ minHeight: '500px' }}>
        
        {/* ===== SEARCH BAR OVERLAY (top-center on map) ===== */}
        <div 
          className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-lg map-search-container"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <div className="flex items-center bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="pl-4 pr-2 text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm địa điểm trên bản đồ..."
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => setShowDropdown(true)}
                className="flex-1 px-2 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none border-none bg-transparent"
              />
              {inputValue && (
                <button
                  type="button"
                  onClick={handleClearInput}
                  className="pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircleFill size={16} />
                </button>
              )}
              {destination && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1 px-3 py-2 mr-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <ArrowCounterclockwise size={13} />
                  Xóa
                </button>
              )}
            </div>

            {/* Suggestions dropdown */}
            {showDropdown && (suggestions.length > 0 || loadingSuggestions) && (
              <ul className="absolute left-0 right-0 mt-2 max-h-60 overflow-y-auto rounded-xl bg-white border border-gray-200 text-gray-800 z-50 shadow-xl">
                {loadingSuggestions ? (
                  <li className="px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
                    <ArrowRepeat className="animate-spin" size={14} />
                    Đang tìm kiếm...
                  </li>
                ) : (
                  suggestions.map((item, idx) => (
                    <li
                      key={idx}
                      onClick={() => handleSelectSuggestion(item)}
                      className="px-4 py-3 text-sm hover:bg-blue-50 cursor-pointer transition-colors leading-snug flex items-start gap-2 border-b border-gray-50 last:border-b-0"
                    >
                      <GeoAlt size={14} className="text-red-500 mt-0.5 shrink-0" />
                      <span>{item.name}</span>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          {/* Hint text */}
          {!destination && !inputValue && (
            <p className="text-center text-xs text-white/90 mt-2 drop-shadow-md">
              Nhấn vào bản đồ hoặc nhập địa chỉ để chọn điểm đến
            </p>
          )}
        </div>

        {/* ===== DISTANCE INFO OVERLAY (bottom-left on map) ===== */}
        {(destination || matrixLoading) && (
          <div className="absolute bottom-4 left-4 z-[1000] w-72">
            {matrixLoading ? (
              <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-lg border border-gray-200">
                <ArrowRepeat className="animate-spin text-blue-500 shrink-0" size={20} />
                <p className="text-xs text-gray-500">Đang tính khoảng cách...</p>
              </div>
            ) : destination ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Destination name */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Điểm đến</p>
                  <p className="text-xs font-semibold text-gray-800 mt-0.5 line-clamp-2 leading-snug">{destination.name}</p>
                </div>

                {/* Transport modes */}
                <div className="divide-y divide-gray-50">
                  {/* Driving */}
                  <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <CarFront size={14} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-400 font-medium">Xe máy / Ô tô</p>
                      <p className="text-xs font-semibold text-gray-700">{distanceInfo.driving?.distance || '—'}</p>
                    </div>
                    <span className="text-xs font-bold text-blue-600 shrink-0">
                      {distanceInfo.driving?.duration || '—'}
                    </span>
                  </div>

                  {/* Bicycling */}
                  <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                      <Bicycle size={14} className="text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-400 font-medium">Xe đạp</p>
                      <p className="text-xs font-semibold text-gray-700">{distanceInfo.bicycling?.distance || '—'}</p>
                    </div>
                    <span className="text-xs font-bold text-teal-600 shrink-0">
                      {distanceInfo.bicycling?.duration || '—'}
                    </span>
                  </div>

                  {/* Walking */}
                  <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                      <PersonWalking size={14} className="text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-400 font-medium">Đi bộ</p>
                      <p className="text-xs font-semibold text-gray-700">{distanceInfo.walking?.distance || '—'}</p>
                    </div>
                    <span className="text-xs font-bold text-amber-600 shrink-0">
                      {distanceInfo.walking?.duration || '—'}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* ===== LEAFLET MAP ===== */}
        <div
          ref={mapContainerRef}
          style={{ width: '100%', height: '500px', cursor: 'pointer' }}
          className="z-0"
        />
      </div>
    </div>
  );
}
