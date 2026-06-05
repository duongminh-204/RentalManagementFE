import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ContractForm from '../components/ContractForm';
import { useTenants } from '../../tenants';
import { useRooms } from '../../rooms';
import { useContracts } from '../hooks/useContracts';
import { prepareContractPayload } from '../utils/contractHelpers';

const DEFAULT_TERMS = `1. Bên thuê thanh toán tiền phòng đúng hạn theo chu kỳ đã thỏa thuận.
2. Bên thuê giữ gìn tài sản, vệ sinh phòng và tuân thủ nội quy tòa nhà.
3. Bên cho thuê bảo trì kết cấu chính; bên thuê chịu trách nhiệm hư hỏng do sử dụng.
4. Chấm dứt hợp đồng: báo trước 30 ngày và bàn giao phòng đúng hiện trạng.`;

const CreateContractPage = () => {
  const navigate = useNavigate();
  const { tenants } = useTenants();
  const { rooms } = useRooms();
  const { addContract, uploadFile, generateFromTemplate } = useContracts();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      const { contractFile, ...rest } = formData;
      const payload = prepareContractPayload({
        ...rest,
        terms: rest.terms || DEFAULT_TERMS,
      });
      const created = await addContract(payload);
      if (contractFile) await uploadFile(created.id, contractFile);
      else await generateFromTemplate(created.id, { templateName: 'default' });
      navigate(`/contracts/${created.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tạo hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-light px-4 py-8 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={() => navigate('/contracts')}
        className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft size={18} /> Quay lại danh sách
      </button>
      <div className="mx-auto max-w-3xl">
        <ContractForm
          tenants={tenants}
          rooms={rooms}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/contracts')}
          loading={loading}
          error={error}
          embedded
          defaultTerms={DEFAULT_TERMS}
        />
      </div>
    </div>
  );
};

export default CreateContractPage;
