import { useEffect, useState } from 'react';
import { Save, X, Loader2 } from 'lucide-react';
import AddressAutocomplete from './AddressAutocomplete';

const initialForm = {
  buildingName: '',
  address: '',
  description: '',
  latitude: null,
  longitude: null,
};

const BuildingForm = ({
  initialData = null,
  loading = false,
  error = null,
  onSubmit,
  onCancel,
  submitLabel = 'Lưu tòa nhà',
}) => {
  const [form, setForm] = useState(initialForm);
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        buildingName: initialData.buildingName || '',
        address: initialData.address || '',
        description: initialData.description || '',
        latitude: initialData.latitude || null,
        longitude: initialData.longitude || null,
      });
    } else {
      setForm(initialForm);
    }
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!form.buildingName.trim()) {
      setValidationError('Tên tòa nhà là bắt buộc');
      return;
    }
    if (!form.address.trim()) {
      setValidationError('Địa chỉ là bắt buộc');
      return;
    }
    setValidationError(null);
    onSubmit?.({
      buildingName: form.buildingName.trim(),
      address: form.address.trim(),
      description: form.description?.trim() || null,
      latitude: form.latitude,
      longitude: form.longitude,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-semibold uppercase text-accent-violet-mid">
          Tên tòa nhà <span className="text-accent-pink">*</span>
        </label>
        <input
          type="text"
          name="buildingName"
          value={form.buildingName}
          onChange={handleChange}
          className="text-input"
          placeholder="Ví dụ: Tòa nhà A, Block B..."
        />
      </div>

      <AddressAutocomplete
        address={form.address}
        latitude={form.latitude}
        longitude={form.longitude}
        onChange={({ address, latitude, longitude }) =>
          setForm((prev) => ({ ...prev, address, latitude, longitude }))
        }
        error={null}
      />

      <div>
        <label className="mb-1 block text-xs font-semibold uppercase text-accent-violet-mid">
          Mô tả
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="text-input resize-none"
          placeholder="Ghi chú thêm về tòa nhà (không bắt buộc)"
        />
      </div>

      {(validationError || error) && (
        <p className="rounded-lg border border-accent-pink/40 bg-accent-pink/10 px-3 py-2 text-sm text-accent-pink">
          {validationError || error}
        </p>
      )}

      <div className="flex flex-wrap gap-2 pt-2">
        <button type="submit" disabled={loading} className="btn-primary inline-flex items-center gap-2">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {loading ? 'Đang lưu…' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 rounded-lg border border-hairline-cloud bg-surface-light px-3 py-2 text-sm font-medium text-ink-deep transition hover:bg-surface-press"
          >
            <X size={16} />
            Hủy
          </button>
        )}
      </div>
    </form>
  );
};

export default BuildingForm;
