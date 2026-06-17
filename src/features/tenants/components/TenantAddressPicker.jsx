import { useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Compass, GeoAlt, Search } from 'react-bootstrap-icons';
import { reverseGeocodeStructured, searchAddressesStructured } from '../../../utils/geocoding';
import {
  filterAdminItems,
  findDistrictByName,
  findProvinceByName,
  findWardByName,
  getDistricts,
  getProvinces,
  getWards,
} from '../../../utils/vietnamAdmin';
import { composeTenantAddress } from '../utils/tenantHelpers';

const DEFAULT_CENTER = [21.0285, 105.8542];

const emptyAddressValue = () => ({
  address: '',
  province: '',
  district: '',
  ward: '',
  streetDetail: '',
  latitude: null,
  longitude: null,
});

function AdminAutocompleteField({
  label,
  value,
  placeholder,
  suggestions,
  loading,
  error,
  open,
  onOpen,
  onClose,
  onChange,
  onSelect,
  disabled = false,
  hint,
}) {
  return (
    <div className="relative tenant-address-field">
      <label className="mb-1 block text-xs font-semibold uppercase text-accent-violet-mid">{label}</label>
      <input
        type="text"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={onChange}
        onFocus={onOpen}
        className="text-input disabled:cursor-not-allowed disabled:opacity-60"
      />
      {hint && !open && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {open && (loading || suggestions.length > 0 || error) && (
        <ul className="absolute left-0 right-0 z-[1200] mt-1 max-h-52 overflow-y-auto rounded-lg border border-hairline-cloud bg-surface-light shadow-[var(--shadow-card)]">
          {loading ? (
            <li className="px-3 py-2.5 text-sm text-muted">Đang tải gợi ý...</li>
          ) : error ? (
            <li className="px-3 py-2.5 text-sm text-muted">{error}</li>
          ) : (
            suggestions.map((item) => (
              <li
                key={item.code ?? item.name}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                className="cursor-pointer border-b border-hairline-cloud/60 px-3 py-2.5 text-sm last:border-b-0 hover:bg-surface-press"
              >
                {item.name}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default function TenantAddressPicker({ value, onChange, error }) {
  const mapContainerRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);
  const debounceRef = useRef(null);
  const streetDebounceRef = useRef(null);
  const handleMarkerDragEndRef = useRef(null);

  const [province, setProvince] = useState(value?.province || '');
  const [district, setDistrict] = useState(value?.district || '');
  const [ward, setWard] = useState(value?.ward || '');
  const [streetDetail, setStreetDetail] = useState(value?.streetDetail || '');
  const [latitude, setLatitude] = useState(value?.latitude ?? null);
  const [longitude, setLongitude] = useState(value?.longitude ?? null);
  const [searchQuery, setSearchQuery] = useState('');

  const [provinceCode, setProvinceCode] = useState(null);
  const [districtCode, setDistrictCode] = useState(null);

  const [provinceItems, setProvinceItems] = useState([]);
  const [districtItems, setDistrictItems] = useState([]);
  const [wardItems, setWardItems] = useState([]);
  const [mapSuggestions, setMapSuggestions] = useState([]);

  const [openField, setOpenField] = useState(null);
  const [loadingField, setLoadingField] = useState(null);
  const [fieldError, setFieldError] = useState(null);
  const [mapSearchLoading, setMapSearchLoading] = useState(false);
  const [mapSearchError, setMapSearchError] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);

  const emitChange = useCallback(
    (updates) => {
      const next = {
        province,
        district,
        ward,
        streetDetail,
        latitude,
        longitude,
        ...updates,
      };

      onChange?.({
        ...next,
        address: composeTenantAddress(next),
      });
    },
    [district, latitude, longitude, onChange, province, streetDetail, ward]
  );

  const applyStructuredAddress = useCallback(
    async (payload) => {
      const nextProvince = payload.province || province;
      const nextDistrict = payload.district || district;
      const nextWard = payload.ward || ward;
      const nextStreet = payload.streetDetail || streetDetail;
      const nextLat = payload.lat ?? latitude;
      const nextLng = payload.lng ?? longitude;

      setProvince(nextProvince);
      setDistrict(nextDistrict);
      setWard(nextWard);
      setStreetDetail(nextStreet);
      setLatitude(nextLat);
      setLongitude(nextLng);

      try {
        const matchedProvince = await findProvinceByName(nextProvince);
        const nextProvinceCode = matchedProvince?.code ?? null;
        setProvinceCode(nextProvinceCode);

        let nextDistrictCode = null;
        if (nextProvinceCode && nextDistrict) {
          const matchedDistrict = await findDistrictByName(nextProvinceCode, nextDistrict);
          nextDistrictCode = matchedDistrict?.code ?? null;
        }
        setDistrictCode(nextDistrictCode);

        if (nextDistrictCode && nextWard) {
          await findWardByName(nextDistrictCode, nextWard);
        }
      } catch (lookupError) {
        console.warn('Could not match admin codes:', lookupError);
      }

      emitChange({
        province: nextProvince,
        district: nextDistrict,
        ward: nextWard,
        streetDetail: nextStreet,
        latitude: nextLat,
        longitude: nextLng,
      });

      if (mapInstance.current && nextLat && nextLng) {
        mapInstance.current.setView([nextLat, nextLng], 16);
        if (!markerInstance.current) {
          markerInstance.current = L.marker([nextLat, nextLng], { draggable: true }).addTo(mapInstance.current);
          markerInstance.current.on('dragend', (event) => handleMarkerDragEndRef.current?.(event));
        } else {
          markerInstance.current.setLatLng([nextLat, nextLng]);
        }
      }
    },
    [district, emitChange, latitude, longitude, province, streetDetail, ward]
  );

  handleMarkerDragEndRef.current = async (event) => {
    const latlng = event.target.getLatLng();
    try {
      const result = await reverseGeocodeStructured(latlng.lat, latlng.lng);
      await applyStructuredAddress(result);
      setSearchQuery(result.name);
    } catch (lookupError) {
      console.error(lookupError);
      emitChange({ latitude: latlng.lat, longitude: latlng.lng });
    }
  };

  useEffect(() => {
    if (!value) return;

    setProvince(value.province || '');
    setDistrict(value.district || '');
    setWard(value.ward || '');
    setStreetDetail(value.streetDetail || '');
    setLatitude(value.latitude ?? null);
    setLongitude(value.longitude ?? null);
    setSearchQuery(value.address || composeTenantAddress(value));
  }, [value]);

  useEffect(() => {
    getProvinces()
      .then(setProvinceItems)
      .catch((loadError) => console.error(loadError));
  }, []);

  useEffect(() => {
    if (!provinceCode) {
      setDistrictItems([]);
      return;
    }

    getDistricts(provinceCode)
      .then(setDistrictItems)
      .catch((loadError) => console.error(loadError));
  }, [provinceCode]);

  useEffect(() => {
    if (!districtCode) {
      setWardItems([]);
      return;
    }

    getWards(districtCode)
      .then(setWardItems)
      .catch((loadError) => console.error(loadError));
  }, [districtCode]);

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

  useEffect(() => {
    if (!mapContainerRef.current || mapInstance.current) return;

    mapInstance.current = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView(DEFAULT_CENTER, 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapInstance.current);

    mapInstance.current.on('click', async (event) => {
      const { lat, lng } = event.latlng;
      try {
        const result = await reverseGeocodeStructured(lat, lng);
        await applyStructuredAddress(result);
        setSearchQuery(result.name);
      } catch (lookupError) {
        console.error(lookupError);
      }
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        markerInstance.current = null;
      }
    };
  }, [applyStructuredAddress]);

  useEffect(() => {
    if (!mapInstance.current) return;

    const center = latitude && longitude ? [latitude, longitude] : DEFAULT_CENTER;
    const zoom = latitude && longitude ? 16 : 6;
    mapInstance.current.setView(center, zoom);

    if (latitude && longitude) {
      if (!markerInstance.current) {
        markerInstance.current = L.marker([latitude, longitude], { draggable: true }).addTo(mapInstance.current);
        markerInstance.current.on('dragend', (event) => handleMarkerDragEndRef.current?.(event));
      } else {
        markerInstance.current.setLatLng([latitude, longitude]);
      }
    } else if (markerInstance.current) {
      mapInstance.current.removeLayer(markerInstance.current);
      markerInstance.current = null;
    }
  }, [latitude, longitude]);

  useEffect(() => {
    if (!mapContainerRef.current || !mapInstance.current) return;

    const refresh = () => mapInstance.current?.invalidateSize({ animate: false });
    refresh();
    const timer = window.setTimeout(refresh, 250);
    const observer = new ResizeObserver(refresh);
    observer.observe(mapContainerRef.current);

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!event.target.closest('.tenant-address-field') && !event.target.closest('.tenant-address-search')) {
        setOpenField(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleProvinceChange = (event) => {
    const nextValue = event.target.value;
    setProvince(nextValue);
    setProvinceCode(null);
    setDistrict('');
    setDistrictCode(null);
    setWard('');
    setOpenField('province');
    setFieldError(null);
    setLoadingField(null);
    setDistrictItems([]);
    setWardItems([]);
    emitChange({
      province: nextValue,
      district: '',
      ward: '',
    });
  };

  const handleDistrictChange = (event) => {
    const nextValue = event.target.value;
    setDistrict(nextValue);
    setDistrictCode(null);
    setWard('');
    setOpenField('district');
    setFieldError(null);
    emitChange({ district: nextValue, ward: '' });
  };

  const handleWardChange = (event) => {
    const nextValue = event.target.value;
    setWard(nextValue);
    setOpenField('ward');
    setFieldError(null);
    emitChange({ ward: nextValue });
  };

  const handleStreetDetailChange = (event) => {
    const nextValue = event.target.value;
    setStreetDetail(nextValue);
    setOpenField('streetDetail');
    setFieldError(null);
    emitChange({ streetDetail: nextValue });

    if (streetDebounceRef.current) clearTimeout(streetDebounceRef.current);
    streetDebounceRef.current = setTimeout(async () => {
      if (nextValue.trim().length < 2) {
        setMapSuggestions([]);
        return;
      }

      setLoadingField('streetDetail');
      try {
        const query = [nextValue, ward, district, province].filter(Boolean).join(', ');
        const results = await searchAddressesStructured(query, { limit: 6 });
        setMapSuggestions(results);
        if (results.length === 0) {
          setFieldError('Không tìm thấy địa chỉ phù hợp.');
        }
      } catch (loadError) {
        setFieldError('Không thể tải gợi ý địa chỉ.');
        console.error(loadError);
      } finally {
        setLoadingField(null);
      }
    }, 400);
  };

  const handleProvinceFocus = async () => {
    setOpenField('province');
    setLoadingField('province');
    try {
      const items = await getProvinces();
      setProvinceItems(items);
      setFieldError(null);
    } catch (loadError) {
      setFieldError('Không thể tải danh sách tỉnh/thành.');
      console.error(loadError);
    } finally {
      setLoadingField(null);
    }
  };

  const handleDistrictFocus = async () => {
    setOpenField('district');
    if (!provinceCode) {
      setFieldError('Vui lòng chọn tỉnh/thành trước.');
      return;
    }

    setLoadingField('district');
    try {
      const items = await getDistricts(provinceCode);
      setDistrictItems(items);
      setFieldError(null);
    } catch (loadError) {
      setFieldError('Không thể tải danh sách quận/huyện.');
      console.error(loadError);
    } finally {
      setLoadingField(null);
    }
  };

  const handleWardFocus = async () => {
    setOpenField('ward');
    if (!districtCode) {
      setFieldError('Vui lòng chọn quận/huyện trước.');
      return;
    }

    setLoadingField('ward');
    try {
      const items = await getWards(districtCode);
      setWardItems(items);
      setFieldError(null);
    } catch (loadError) {
      setFieldError('Không thể tải danh sách xã/phường.');
      console.error(loadError);
    } finally {
      setLoadingField(null);
    }
  };

  const handleStreetDetailFocus = async () => {
    setOpenField('streetDetail');
    if (streetDetail.trim().length < 2) return;

    setLoadingField('streetDetail');
    setMapSearchError(null);
    try {
      const query = [streetDetail, ward, district, province].filter(Boolean).join(', ');
      const results = await searchAddressesStructured(query, { limit: 6 });
      setMapSuggestions(results);
      if (results.length === 0) {
        setFieldError('Không tìm thấy địa chỉ phù hợp.');
      } else {
        setFieldError(null);
      }
    } catch (loadError) {
      setFieldError('Không thể tải gợi ý địa chỉ.');
      console.error(loadError);
    } finally {
      setLoadingField(null);
    }
  };

  const handleMapSearchChange = (event) => {
    const nextValue = event.target.value;
    setSearchQuery(nextValue);
    setOpenField('mapSearch');
    setMapSearchError(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (nextValue.trim().length < 2) {
        setMapSuggestions([]);
        return;
      }

      setMapSearchLoading(true);
      try {
        const results = await searchAddressesStructured(nextValue, { limit: 6 });
        setMapSuggestions(results);
        if (results.length === 0) {
          setMapSearchError('Không tìm thấy địa chỉ phù hợp.');
        }
      } catch (loadError) {
        setMapSuggestions([]);
        setMapSearchError('Không thể tải gợi ý địa chỉ.');
        console.error(loadError);
      } finally {
        setMapSearchLoading(false);
      }
    }, 400);
  };

  const handleSelectMapSuggestion = async (item) => {
    setSearchQuery(item.name);
    setMapSuggestions([]);
    setOpenField(null);
    await applyStructuredAddress(item);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ định vị.');
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const result = await reverseGeocodeStructured(
            position.coords.latitude,
            position.coords.longitude
          );
          await applyStructuredAddress(result);
          setSearchQuery(result.name);
        } catch (lookupError) {
          console.error(lookupError);
        } finally {
          setGeoLoading(false);
        }
      },
      () => {
        alert('Không thể lấy vị trí hiện tại. Vui lòng cấp quyền truy cập vị trí.');
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-4 rounded-xl border border-hairline-cloud bg-surface-press/40 p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-accent-violet-mid">Địa chỉ khách thuê</p>
        <p className="mt-1 text-xs text-muted">
          Nhập từng cấp hoặc tìm trên bản đồ. Mỗi ô đều có gợi ý để chọn nhanh.
        </p>
      </div>

      <div className="tenant-address-search relative">
        <label className="mb-1 block text-xs font-semibold uppercase text-accent-violet-mid">
          Tìm trên bản đồ
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleMapSearchChange}
              onFocus={() => setOpenField('mapSearch')}
              placeholder="Nhập địa chỉ để tìm trên bản đồ..."
              className="text-input pl-10"
            />
            {openField === 'mapSearch' && (mapSearchLoading || mapSuggestions.length > 0 || mapSearchError) && (
              <ul className="absolute left-0 right-0 z-[1200] mt-1 max-h-52 overflow-y-auto rounded-lg border border-hairline-cloud bg-surface-light shadow-[var(--shadow-card)]">
                {mapSearchLoading ? (
                  <li className="px-3 py-2.5 text-sm text-muted">Đang tìm kiếm...</li>
                ) : mapSearchError ? (
                  <li className="px-3 py-2.5 text-sm text-muted">{mapSearchError}</li>
                ) : (
                  mapSuggestions.map((item, index) => (
                    <li
                      key={`${item.lat}-${item.lng}-${index}`}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleSelectMapSuggestion(item)}
                      className="cursor-pointer border-b border-hairline-cloud/60 px-3 py-2.5 text-sm last:border-b-0 hover:bg-surface-press"
                    >
                      {item.name}
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
            className="inline-flex items-center gap-1.5 rounded-lg border border-hairline-cloud bg-surface-light px-3 py-2 text-sm font-medium text-ink-deep transition hover:bg-surface-press disabled:opacity-50"
          >
            <Compass size={16} />
            {geoLoading ? 'Đang định vị...' : 'Vị trí của tôi'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <AdminAutocompleteField
          label="Tỉnh / Thành phố"
          value={province}
          placeholder="Ví dụ: Hà Nội"
          suggestions={filterAdminItems(provinceItems, province)}
          loading={loadingField === 'province'}
          error={openField === 'province' ? fieldError : null}
          open={openField === 'province'}
          onOpen={handleProvinceFocus}
          onClose={() => setOpenField(null)}
          onChange={handleProvinceChange}
          onSelect={(item) => {
            setProvince(item.name);
            setProvinceCode(item.code);
            setDistrict('');
            setDistrictCode(null);
            setWard('');
            emitChange({ province: item.name, district: '', ward: '' });
          }}
        />

        <AdminAutocompleteField
          label="Quận / Huyện"
          value={district}
          placeholder="Ví dụ: Cầu Giấy"
          suggestions={filterAdminItems(districtItems, district)}
          loading={loadingField === 'district'}
          error={openField === 'district' ? fieldError : null}
          open={openField === 'district'}
          onOpen={handleDistrictFocus}
          onClose={() => setOpenField(null)}
          onChange={handleDistrictChange}
          onSelect={(item) => {
            setDistrict(item.name);
            setDistrictCode(item.code);
            setWard('');
            emitChange({ district: item.name, ward: '' });
          }}
          hint={!provinceCode ? 'Chọn tỉnh/thành trước để gợi ý quận/huyện.' : undefined}
        />

        <AdminAutocompleteField
          label="Xã / Phường"
          value={ward}
          placeholder="Ví dụ: Dịch Vọng"
          suggestions={filterAdminItems(wardItems, ward)}
          loading={loadingField === 'ward'}
          error={openField === 'ward' ? fieldError : null}
          open={openField === 'ward'}
          onOpen={handleWardFocus}
          onClose={() => setOpenField(null)}
          onChange={handleWardChange}
          onSelect={(item) => {
            setWard(item.name);
            emitChange({ ward: item.name });
          }}
          hint={!districtCode ? 'Chọn quận/huyện trước để gợi ý xã/phường.' : undefined}
        />
      </div>

      <AdminAutocompleteField
        label="Địa chỉ chi tiết"
        value={streetDetail}
        placeholder="Số nhà, tên đường, thôn/xóm..."
        suggestions={mapSuggestions.map((item) => ({ code: `${item.lat}-${item.lng}`, name: item.name }))}
        loading={loadingField === 'streetDetail'}
        error={openField === 'streetDetail' ? fieldError : null}
        open={openField === 'streetDetail'}
        onOpen={handleStreetDetailFocus}
        onClose={() => setOpenField(null)}
        onChange={handleStreetDetailChange}
        onSelect={async (item) => {
          const selected = mapSuggestions.find((entry) => entry.name === item.name);
          if (selected) {
            await applyStructuredAddress(selected);
            setSearchQuery(selected.name);
          } else {
            setStreetDetail(item.name);
            emitChange({ streetDetail: item.name });
          }
        }}
      />

      <div className="relative h-[280px] overflow-hidden rounded-xl border border-hairline-cloud shadow-sm">
        <div ref={mapContainerRef} className="absolute inset-0 h-full w-full" />
      </div>

      {latitude && longitude && (
        <div className="flex items-center gap-2 text-xs text-muted">
          <GeoAlt size={14} className="text-accent-violet" />
          <span>
            Tọa độ: {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </span>
        </div>
      )}

      {composeTenantAddress({ streetDetail, ward, district, province }) && (
        <div className="rounded-lg border border-hairline-cloud bg-surface-light px-3 py-2 text-sm text-ink-deep">
          <span className="font-semibold text-accent-violet-mid">Địa chỉ đầy đủ: </span>
          {composeTenantAddress({ streetDetail, ward, district, province })}
        </div>
      )}

      {error && <p className="text-sm text-accent-pink">{error}</p>}
    </div>
  );
}

export { emptyAddressValue };
