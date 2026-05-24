import { useRef, useState } from 'react';
import { Download, FileUp, LoaderCircle, ShieldCheck } from 'lucide-react';
import {
  downloadDashboardImportTemplate,
  uploadDashboardTemplateFile,
} from '../../dashboard/api/dashboardApi';

const ExcelTemplateAdminPage = () => {
  const inputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChooseFile = () => {
    inputRef.current?.click();
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setError('');
      setMessage('');

      const { blob, fileName } = await downloadDashboardImportTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải mẫu Excel hiện tại.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleUpload = async (event) => {
    const [file] = event.target.files || [];
    event.target.value = '';

    if (!file) {
      return;
    }

    try {
      setIsUploading(true);
      setError('');
      setMessage('');
      const result = await uploadDashboardTemplateFile(file);
      setMessage(result.message || 'Đã lưu mẫu Excel thành công.');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu mẫu Excel.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex-1 bg-surface-light">
      <div className="page-content page-content--wide">
        <section className="dashboard-section-card max-w-4xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#eef1ff] px-4 py-2 text-sm font-bold text-accent-violet-deep">
                <ShieldCheck className="h-4 w-4" />
                Khu vực quản trị
              </div>
              <h1 className="text-3xl font-bold text-ink-deep">Quản lý mẫu Excel</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
                Trang này dành riêng cho admin để cập nhật file mẫu Excel dùng chung cho chủ trọ.
                Sau khi tải file mới lên, người dùng ở trang dashboard sẽ tải đúng mẫu này.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <div className="dashboard-mini-card">
              <h2 className="text-xl font-bold text-ink-deep">Tải lên mẫu mới</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Chỉ nhận file `.xlsx`. File sẽ được lưu tại `wwwroot/uploads/templates/` với tên chuẩn của hệ thống.
              </p>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={handleChooseFile}
                  disabled={isUploading}
                  className="dashboard-action-button dashboard-action-button--primary"
                >
                  {isUploading ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <FileUp className="h-4 w-4" />
                  )}
                  {isUploading ? 'Đang lưu mẫu...' : 'Chọn file mẫu để tải lên'}
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx"
                  className="hidden"
                  onChange={handleUpload}
                />
              </div>
            </div>

            <div className="dashboard-mini-card">
              <h2 className="text-xl font-bold text-ink-deep">Kiểm tra mẫu hiện hành</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Dùng nút này để tải lại file mẫu đang được hệ thống phát cho chủ trọ, nhằm kiểm tra xem bản mới đã lưu đúng hay chưa.
              </p>

              <div className="mt-5">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="dashboard-action-button"
                >
                  {isDownloading ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {isDownloading ? 'Đang tải mẫu...' : 'Tải mẫu hiện hành'}
                </button>
              </div>
            </div>
          </div>

          {message ? (
            <div className="mt-6 rounded-2xl border border-[#cfe7be] bg-[#f8fff0] px-4 py-3 text-sm font-semibold text-ink-deep">
              {message}
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-2xl border border-[#f3c3d3] bg-[#fff6f9] px-4 py-3 text-sm font-semibold text-ink-deep">
              {error}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
};

export default ExcelTemplateAdminPage;
