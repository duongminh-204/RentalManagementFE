const API_ORIGIN =
  import.meta.env.VITE_API_ORIGIN ||
  (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090/api').replace(/\/api\/?$/, '') ||
  'http://localhost:8090';

export const resolveLegalFileUrl = (url) => {
  if (!url) return null;
  const s = String(url).trim();
  if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('data:')) return s;
  return s.startsWith('/') ? `${API_ORIGIN}${s}` : `${API_ORIGIN}/${s}`;
};

export const DOCUMENT_TYPE_OPTIONS = [
  { value: 'PCCC', label: 'Giấy chứng nhận PCCC' },
  { value: 'BusinessLicense', label: 'Giấy phép kinh doanh' },
  { value: 'Utility', label: 'Hồ sơ điện nước' },
  { value: 'Other', label: 'Giấy tờ khác' },
];

export const DOCUMENT_TYPE_LABELS = Object.fromEntries(
  DOCUMENT_TYPE_OPTIONS.map((o) => [o.value, o.label]),
);

export const ALERT_SEVERITY_STYLES = {
  danger: 'border-[#f3c3d3] bg-[#fff5f8] text-[#b33f69]',
  warning: 'border-[#f0d6a8] bg-[#fff9ee] text-[#9a5a00]',
  info: 'border-hairline-cloud bg-surface-light text-ink-deep',
};

export const getScoreTone = (score) => {
  if (score >= 80) return { label: 'Tốt', color: '#4d7a14', bg: '#e7f6d5' };
  if (score >= 50) return { label: 'Trung bình', color: '#9a5a00', bg: '#ffefcf' };
  return { label: 'Cần cải thiện', color: '#b33f69', bg: '#ffe0ea' };
};

export const formatLegalDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('vi-VN');
};

export const normalizeDashboard = (raw) => ({
  totalRooms: raw?.totalRooms ?? 0,
  occupiedRooms: raw?.occupiedRooms ?? 0,
  roomsComplete: raw?.roomsComplete ?? 0,
  roomsIncomplete: raw?.roomsIncomplete ?? 0,
  expiringContracts: raw?.expiringContracts ?? 0,
  pendingTempResidence: raw?.pendingTempResidence ?? 0,
  expiringDocuments: raw?.expiringDocuments ?? 0,
  actionItemsCount: raw?.actionItemsCount ?? 0,
  legalScore: raw?.legalScore ?? 0,
  actionItems: Array.isArray(raw?.actionItems) ? raw.actionItems : [],
});

export const normalizeChecklistItem = (item) => ({
  key: item?.key ?? '',
  label: item?.label ?? '',
  isCompleted: Boolean(item?.isCompleted),
  fileUrl: resolveLegalFileUrl(item?.fileUrl),
  note: item?.note ?? null,
  status: item?.status ?? null,
});

export const normalizeTenantSummary = (raw) => ({
  tenantId: raw?.tenantId,
  fullName: raw?.fullName ?? '',
  roomName: raw?.roomName ?? '',
  roomId: raw?.roomId ?? null,
  completionPercent: raw?.completionPercent ?? 0,
  completedCount: raw?.completedCount ?? 0,
  totalCount: raw?.totalCount ?? 0,
  tempResidencePending: Boolean(raw?.tempResidencePending),
  items: (raw?.items ?? []).map(normalizeChecklistItem),
});

export const normalizeTenantDetail = (raw) => ({
  ...normalizeTenantSummary(raw),
  phoneNumber: raw?.phoneNumber ?? '',
  cccd: raw?.cccd ?? '',
  cccdImage: resolveLegalFileUrl(raw?.cccdImage),
  moveInDate: raw?.moveInDate ?? null,
  activeContractId: raw?.activeContractId ?? null,
  emergencyContactName: raw?.emergencyContactName ?? '',
  emergencyContactPhone: raw?.emergencyContactPhone ?? '',
  emergencyContactRelation: raw?.emergencyContactRelation ?? '',
  depositReceiptFile: resolveLegalFileUrl(raw?.depositReceiptFile),
  tempResidenceFile: resolveLegalFileUrl(raw?.tempResidenceFile),
  tempResidenceDeclaredAt: raw?.tempResidenceDeclaredAt ?? null,
  tempResidenceCompleted: Boolean(raw?.tempResidenceCompleted),
});

export const normalizeRoomSummary = (raw) => ({
  roomId: raw?.roomId,
  roomName: raw?.roomName ?? '',
  buildingName: raw?.buildingName ?? '',
  buildingId: raw?.buildingId ?? null,
  roomStatus: raw?.roomStatus ?? '',
  tenantName: raw?.tenantName ?? '',
  tenantId: raw?.tenantId ?? null,
  completionPercent: raw?.completionPercent ?? 0,
  completedCount: raw?.completedCount ?? 0,
  totalCount: raw?.totalCount ?? 0,
  items: (raw?.items ?? []).map(normalizeChecklistItem),
});

export const normalizeRoomDetail = (raw) => ({
  ...normalizeRoomSummary(raw),
  handoverRecordFile: resolveLegalFileUrl(raw?.handoverRecordFile),
  handoverCompleted: Boolean(raw?.handoverCompleted),
  assetConditionNote: raw?.assetConditionNote ?? '',
  activeContractId: raw?.activeContractId ?? null,
  contractStatus: raw?.contractStatus ?? '',
  depositStatus: raw?.depositStatus ?? '',
  contractEndDate: raw?.contractEndDate ?? null,
});

export const normalizeBuildingDocument = (raw) => ({
  id: raw?.id,
  buildingId: raw?.buildingId,
  buildingName: raw?.buildingName ?? '',
  documentType: raw?.documentType ?? 'Other',
  title: raw?.title ?? '',
  fileUrl: resolveLegalFileUrl(raw?.fileUrl),
  issueDate: raw?.issueDate ?? null,
  expiryDate: raw?.expiryDate ?? null,
  note: raw?.note ?? '',
  isExpired: Boolean(raw?.isExpired),
  isExpiringSoon: Boolean(raw?.isExpiringSoon),
  daysUntilExpiry: raw?.daysUntilExpiry ?? null,
});
