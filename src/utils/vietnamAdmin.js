const API_BASE = 'https://provinces.open-api.vn/api';

let provincesCache = null;
const districtsCache = new Map();
const wardsCache = new Map();

const normalizeText = (value = '') =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export async function getProvinces() {
  if (provincesCache) return provincesCache;

  const response = await fetch(`${API_BASE}/p/`);
  if (!response.ok) {
    throw new Error(`Không thể tải danh sách tỉnh/thành: ${response.status}`);
  }

  provincesCache = await response.json();
  return provincesCache;
}

export async function getDistricts(provinceCode) {
  if (!provinceCode) return [];

  if (districtsCache.has(provinceCode)) {
    return districtsCache.get(provinceCode);
  }

  const response = await fetch(`${API_BASE}/p/${provinceCode}?depth=2`);
  if (!response.ok) {
    throw new Error(`Không thể tải danh sách quận/huyện: ${response.status}`);
  }

  const data = await response.json();
  const districts = data.districts || [];
  districtsCache.set(provinceCode, districts);
  return districts;
}

export async function getWards(districtCode) {
  if (!districtCode) return [];

  if (wardsCache.has(districtCode)) {
    return wardsCache.get(districtCode);
  }

  const response = await fetch(`${API_BASE}/d/${districtCode}?depth=2`);
  if (!response.ok) {
    throw new Error(`Không thể tải danh sách xã/phường: ${response.status}`);
  }

  const data = await response.json();
  const wards = data.wards || [];
  wardsCache.set(districtCode, wards);
  return wards;
}

export function filterAdminItems(items = [], query = '', limit = 12) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return items.slice(0, limit);
  }

  return items
    .filter((item) => normalizeText(item.name).includes(normalizedQuery))
    .slice(0, limit);
}

export async function findProvinceByName(name) {
  if (!name?.trim()) return null;
  const provinces = await getProvinces();
  const normalizedName = normalizeText(name);
  return (
    provinces.find((item) => normalizeText(item.name) === normalizedName) ||
    provinces.find((item) => normalizeText(item.name).includes(normalizedName)) ||
    null
  );
}

export async function findDistrictByName(provinceCode, name) {
  if (!provinceCode || !name?.trim()) return null;
  const districts = await getDistricts(provinceCode);
  const normalizedName = normalizeText(name);
  return (
    districts.find((item) => normalizeText(item.name) === normalizedName) ||
    districts.find((item) => normalizeText(item.name).includes(normalizedName)) ||
    null
  );
}

export async function findWardByName(districtCode, name) {
  if (!districtCode || !name?.trim()) return null;
  const wards = await getWards(districtCode);
  const normalizedName = normalizeText(name);
  return (
    wards.find((item) => normalizeText(item.name) === normalizedName) ||
    wards.find((item) => normalizeText(item.name).includes(normalizedName)) ||
    null
  );
}
