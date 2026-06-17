import { useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { GeoAlt, ArrowCounterclockwise, ArrowRepeat, CarFront, Bicycle, PersonWalking, Search, XCircleFill } from 'react-bootstrap-icons';
import { reverseGeocode, searchAddresses } from '../../../utils/geocoding';

export default function BuildingMapRoutes({
  buildingName,
  address,
  latitude,
  longitude,
  embedded = false,
  layoutReady = true,
}) {
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
  const [searchError, setSearchError] = useState(null);

  const [destination, setDestination] = useState(null); // { name, lat, lng }
  const [matrixLoading, setMatrixLoading] = useState(false);
  const [distanceInfo, setDistanceInfo] = useState({
    driving: null,
    bicycling: null,
    walking: null,
  });

  const origin = [latitude, longitude];

  const refreshMapLayout = useCallback(() => {
    const map = mapInstance.current;
    if (!map) return;

    map.invalidateSize({ animate: false });

    if (latitude && longitude) {
      map.setView([latitude, longitude], map.getZoom(), { animate: false });
    }
  }, [latitude, longitude]);

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

  // Initialize Map only after modal/layout is ready so Leaflet gets correct dimensions.
  useEffect(() => {
    if (!layoutReady || !mapContainerRef.current || !latitude || !longitude) return;

    let disposed = false;

    const initMap = () => {
      if (disposed || !mapContainerRef.current || mapInstance.current) return;

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
      }).setView(origin, 14);

      mapInstance.current = map;

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });

      originMarkerRef.current = L.marker(origin, { icon: redIcon })
        .addTo(map)
        .bindPopup(`<b>${buildingName || 'Tòa nhà'}</b><br/>${address || ''}`)
        .openPopup();

      map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        try {
          const name = await reverseGeocode(lat, lng);
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

      map.whenReady(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            map.invalidateSize({ animate: false });
          });
        });
      });
    };

    requestAnimationFrame(() => {
      requestAnimationFrame(initMap);
    });

    return () => {
      disposed = true;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        originMarkerRef.current = null;
        destMarkerRef.current = null;
        polylineRef.current = null;
      }
    };
  }, [layoutReady, latitude, longitude, buildingName, address]);

  useEffect(() => {
    if (!mapInstance.current || !latitude || !longitude) return;

    mapInstance.current.setView(origin, mapInstance.current.getZoom(), { animate: false });
    if (originMarkerRef.current) {
      originMarkerRef.current.setLatLng(origin);
      originMarkerRef.current.setPopupContent(`<b>${buildingName || 'Tòa nhà'}</b><br/>${address || ''}`);
    }
  }, [latitude, longitude, buildingName, address]);

  // Leaflet renders incorrectly inside modals until the container has its final size.
  useEffect(() => {
    if (!layoutReady || !mapContainerRef.current || !latitude || !longitude) return;

    refreshMapLayout();

    const resizeTimers = [50, 150, 350, 700].map((delay) =>
      window.setTimeout(refreshMapLayout, delay)
    );

    const observer = new ResizeObserver(() => {
      refreshMapLayout();
    });

    observer.observe(mapContainerRef.current);
    window.addEventListener('resize', refreshMapLayout);

    return () => {
      resizeTimers.forEach((timerId) => window.clearTimeout(timerId));
      observer.disconnect();
      window.removeEventListener('resize', refreshMapLayout);
    };
  }, [layoutReady, latitude, longitude, refreshMapLayout]);

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
      setSuggestions(results);
      if (results.length === 0) {
        setSearchError('Không tìm thấy địa chỉ phù hợp.');
      }
    } catch (err) {
      console.error(err);
      setSuggestions([]);
      setSearchError('Không thể tải gợi ý địa chỉ. Vui lòng thử lại sau vài giây.');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setShowDropdown(true);
    setSearchError(null);

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
    setSearchError(null);
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
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
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

  const mapHeightClass = embedded ? 'h-[min(420px,calc(90vh-13rem))]' : 'h-[500px]';

  if (embedded && !layoutReady) {
    return (
      <div
        className={`flex w-full items-center justify-center rounded-xl border border-gray-200 bg-gray-100 text-sm text-gray-500 ${mapHeightClass}`}
      >
        <ArrowRepeat className="mr-2 animate-spin" size={16} />
        Đang tải bản đồ…
      </div>
    );
  }

  return (
    <div className={`w-full text-gray-800 ${embedded ? '' : 'max-w-5xl mx-auto'}`}>
      <div className={`relative ${mapHeightClass}`}>
        {/* ===== SEARCH BAR OVERLAY (outside clipped map layer) ===== */}
        <div
          className="absolute left-1/2 top-4 z-[1100] w-[90%] max-w-lg -translate-x-1/2 map-search-container"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <div className="flex items-center overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
              <div className="pl-4 pr-2 text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm địa điểm trên bản đồ..."
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => setShowDropdown(true)}
                className="flex-1 border-none bg-transparent px-2 py-3 text-sm text-gray-800 outline-none placeholder:text-gray-400"
              />
              {inputValue && (
                <button
                  type="button"
                  onClick={handleClearInput}
                  className="pr-3 text-gray-400 transition-colors hover:text-gray-600"
                >
                  <XCircleFill size={16} />
                </button>
              )}
              {destination && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="mr-1 flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
                >
                  <ArrowCounterclockwise size={13} />
                  Xóa
                </button>
              )}
            </div>

            {showDropdown && (loadingSuggestions || suggestions.length > 0 || searchError) && (
              <ul className="absolute left-0 right-0 z-[1200] mt-2 max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white text-gray-800 shadow-xl">
                {loadingSuggestions ? (
                  <li className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400">
                    <ArrowRepeat className="animate-spin" size={14} />
                    Đang tìm kiếm...
                  </li>
                ) : searchError ? (
                  <li className="px-4 py-3 text-sm text-gray-500">{searchError}</li>
                ) : (
                  suggestions.map((item, idx) => (
                    <li
                      key={`${item.lat}-${item.lng}-${idx}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectSuggestion(item)}
                      className="flex cursor-pointer items-start gap-2 border-b border-gray-50 px-4 py-3 text-sm leading-snug transition-colors last:border-b-0 hover:bg-blue-50"
                    >
                      <GeoAlt size={14} className="mt-0.5 shrink-0 text-red-500" />
                      <span>{item.name}</span>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          {!destination && !inputValue && (
            <p className="mt-2 text-center text-xs text-white/90 drop-shadow-md">
              Nhấn vào bản đồ hoặc nhập địa chỉ để chọn điểm đến
            </p>
          )}
        </div>

        {/* ===== DISTANCE INFO OVERLAY ===== */}
        {(destination || matrixLoading) && (
          <div className="absolute bottom-4 left-4 z-[1100] w-72">
            {matrixLoading ? (
              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg">
                <ArrowRepeat className="shrink-0 animate-spin text-blue-500" size={20} />
                <p className="text-xs text-gray-500">Đang tính khoảng cách...</p>
              </div>
            ) : destination ? (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                <div className="border-b border-gray-100 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Điểm đến</p>
                  <p className="mt-0.5 line-clamp-2 text-xs font-semibold leading-snug text-gray-800">
                    {destination.name}
                  </p>
                </div>

                <div className="divide-y divide-gray-50">
                  <div className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-gray-50">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50">
                      <CarFront size={14} className="text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-medium text-gray-400">Xe máy / Ô tô</p>
                      <p className="text-xs font-semibold text-gray-700">{distanceInfo.driving?.distance || '—'}</p>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-blue-600">
                      {distanceInfo.driving?.duration || '—'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-gray-50">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50">
                      <Bicycle size={14} className="text-teal-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-medium text-gray-400">Xe đạp</p>
                      <p className="text-xs font-semibold text-gray-700">{distanceInfo.bicycling?.distance || '—'}</p>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-teal-600">
                      {distanceInfo.bicycling?.duration || '—'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-gray-50">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50">
                      <PersonWalking size={14} className="text-amber-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-medium text-gray-400">Đi bộ</p>
                      <p className="text-xs font-semibold text-gray-700">{distanceInfo.walking?.distance || '—'}</p>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-amber-600">
                      {distanceInfo.walking?.duration || '—'}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* ===== LEAFLET MAP (clipped separately so dropdown is not hidden) ===== */}
        <div
          className={`absolute inset-0 overflow-hidden border border-gray-200 shadow-lg ${
            embedded ? 'rounded-xl' : 'rounded-2xl'
          }`}
        >
          <div ref={mapContainerRef} className="h-full w-full cursor-pointer" />
        </div>
      </div>
    </div>
  );
}
