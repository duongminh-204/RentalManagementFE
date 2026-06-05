import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import * as buildingsApi from '../api/buildingsApi';
import BuildingForm from '../components/BuildingForm';

const BuildingEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [building, setBuilding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const loadBuilding = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await buildingsApi.getBuildingById(id);
      setBuilding(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải thông tin tòa nhà');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBuilding();
  }, [loadBuilding]);

  const handleSubmit = async (payload) => {
    setSaving(true);
    setError(null);
    try {
      await buildingsApi.updateBuilding(id, payload);
      navigate('/buildings');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cập nhật tòa nhà');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex-1 bg-surface-light font-sans">
      <div className="page-content">
        <button
          type="button"
          onClick={() => navigate('/buildings')}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-ink-deep transition hover:text-primary"
        >
          <ArrowLeft size={18} />
          Quay lại danh sách
        </button>

        <section
          className="bg-white p-8"
          style={{ borderRadius: '20px', border: '1px solid #E5E7EB' }}
        >
          <h1 className="mb-6 text-[28px] font-bold leading-tight text-ink-deep">Sửa thông tin tòa nhà</h1>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-muted">
              <Loader2 className="animate-spin text-accent-violet" size={24} />
              <span className="text-sm">Đang tải thông tin tòa nhà…</span>
            </div>
          ) : (
            <BuildingForm
              initialData={building}
              loading={saving}
              error={error}
              onSubmit={handleSubmit}
              onCancel={() => navigate('/buildings')}
              submitLabel="Cập nhật tòa nhà"
            />
          )}
        </section>
      </div>
    </div>
  );
};

export default BuildingEdit;
