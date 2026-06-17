import { resolveMediaUrl } from '../../tenants/utils/tenantHelpers';
import { downloadContractFile } from '../api/contractsApi';

export const getContractFileName = (contract, fallback = 'hop_dong') => {
  const url = contract?.fileUrl;
  if (url) {
    const segment = String(url).split('/').pop()?.split('?')[0];
    if (segment) return decodeURIComponent(segment);
  }
  const num = contract?.contractNumber;
  if (num) return `Hop_dong_${num}.pdf`;
  return `Hop_dong_${contract?.id ?? fallback}.pdf`;
};

export const isPdfUrl = (url) => /\.pdf($|\?)/i.test(String(url ?? ''));

export const isImageUrl = (url) =>
  /\.(jpe?g|png|gif|webp|bmp)($|\?)/i.test(String(url ?? '')) ||
  String(url ?? '').startsWith('data:image');

export const isPdfBlob = (blob) =>
  blob?.type === 'application/pdf' || blob?.type === 'application/octet-stream';

const blobLooksLikeJsonError = async (blob) => {
  if (!blob || blob.size > 8192) return false;
  if (blob.type?.includes('json')) return true;
  try {
    const head = await blob.slice(0, 1).text();
    return head === '{' || head === '[';
  } catch {
    return false;
  }
};

/** Mở xem hoặc tải file hợp đồng (ưu tiên fileUrl, fallback API blob) */
export const openOrDownloadContractFile = async (contract) => {
  if (!contract?.id && !contract?.fileUrl) {
    throw new Error('Không có file hợp đồng');
  }

  const directUrl = resolveMediaUrl(contract.fileUrl);
  const fileName = getContractFileName(contract);

  if (directUrl) {
    window.open(directUrl, '_blank', 'noopener,noreferrer');
    return;
  }

  const blob = await downloadContractFile(contract.id);
  if (await blobLooksLikeJsonError(blob)) {
    let message = 'Không tải được file hợp đồng';
    try {
      const err = JSON.parse(await blob.text());
      message = err.message ?? err.title ?? message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const blobUrl = URL.createObjectURL(blob);
  const isPdf = isPdfBlob(blob) || fileName.toLowerCase().endsWith('.pdf');

  if (isPdf) {
    window.open(blobUrl, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(blobUrl), 120000);
    return;
  }

  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
};
