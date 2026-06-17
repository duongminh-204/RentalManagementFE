import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import * as buildingsApi from '../api/buildingsApi';
import BuildingForm from '../components/BuildingForm';

const BuildingCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      await buildingsApi.createBuilding(payload);
      navigate('/buildings');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tạo tòa nhà');
    } finally {
      setLoading(false);
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
          <h1 className="mb-6 text-[28px] font-bold leading-tight text-ink-deep">Thêm tòa nhà mới</h1>
          <BuildingForm
            loading={loading}
            error={error}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/buildings')}
            submitLabel="Tạo tòa nhà"
          />
        </section>
      </div>
    </div>
  );
};

export default BuildingCreate;
