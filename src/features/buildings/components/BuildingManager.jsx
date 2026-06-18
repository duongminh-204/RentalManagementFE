import { useState } from 'react';
import { Plus, Edit3, Trash2, Save, X, Loader2 } from 'lucide-react';
import * as buildingsApi from '../api/buildingsApi';
import AddressAutocomplete from './AddressAutocomplete';
import { useConfirmDelete } from '../../../hooks/useConfirmDelete';
import { deleteConfirmPresets } from '../../../utils/deleteConfirmPresets';

const initialForm = {
  buildingName: '',
  address: '',
  description: '',
  latitude: null,
  longitude: null,
};

const BuildingManager = ({
  buildings,
  loading,
  selectedBuildingId,
  onSelectBuilding,
  onBuildingsUpdated,
}) => {
  const { confirmDelete, ConfirmDeleteDialog } = useConfirmDelete();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(initialForm);

  const resetForm = () => {
    setEditId(null);
    setForm(initialForm);
    setError(null);
  };

  const handleSelectEdit = (building) => {
    setEditId(building.buildingId);
    setForm({
      buildingName: building.buildingName || '',
      address: building.address || '',
      description: building.description || '',
      latitude: building.latitude || null,
      longitude: building.longitude || null,
    });
    setError(null);
  };

  const handleDelete = async (id) => {
    const building = buildings?.find((item) => String(item.buildingId) === String(id));
    const confirmed = await confirmDelete(deleteConfirmPresets.building(building));
    if (!confirmed) return;
    setSaving(true);
    setError(null);
    try {
      await buildingsApi.deleteBuilding(id);
      onBuildingsUpdated?.();
      if (String(selectedBuildingId) === String(id)) {
        const first = buildings?.find((item) => item.buildingId !== id);
        onSelectBuilding?.(first?.buildingId ?? '');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xóa tòa nhà');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.buildingName.trim()) {
      setError('Tên tòa nhà là bắt buộc');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload = {
        buildingName: form.buildingName.trim(),
        address: form.address.trim(),
        description: form.description?.trim() || null,
        latitude: form.latitude,
        longitude: form.longitude,
      };
      if (editId) {
        await buildingsApi.updateBuilding(editId, payload);
      } else {
        const created = await buildingsApi.createBuilding(payload);
        onSelectBuilding?.(created?.buildingId ?? selectedBuildingId);
      }
      resetForm();
      onBuildingsUpdated?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu tòa nhà');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-hairline-cloud bg-surface-press p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink-deep">Quản lý tòa nhà</p>
          <p className="text-xs text-on-dark-muted">Tạo, sửa và xóa tòa nhà để sử dụng khi tạo phòng.</p>
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="inline-flex items-center gap-2 rounded-lg border border-hairline-cloud bg-white px-3 py-1.5 text-xs font-medium text-ink-deep transition hover:bg-surface-light"
        >
          <Plus size={14} />
          Tạo tòa nhà mới
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-on-dark-muted">
          <Loader2 className="animate-spin" size={18} />
          Đang tải danh sách tòa nhà…
        </div>
      ) : buildings?.length ? (
        <div className="space-y-3">
          <div className="grid gap-3">
            {buildings.map((building) => (
              <div
                key={building.buildingId}
                className="flex items-start justify-between gap-3 rounded-xl border border-hairline-cloud bg-white p-3"
              >
                <div>
                  <p className="font-semibold text-ink-deep">{building.buildingName}</p>
                  <p className="text-xs text-on-dark-muted">{building.address || 'Không có địa chỉ'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectEdit(building)}
                    className="rounded-lg border border-hairline-cloud bg-surface-light p-2 text-ink-deep transition hover:bg-surface-press"
                    title="Sửa"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(building.buildingId)}
                    className="rounded-lg border border-hairline-cloud bg-surface-light p-2 text-accent-pink transition hover:bg-surface-press"
                    title="Xóa"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-hairline-cloud bg-white p-4 text-sm text-on-dark-muted">
          Chưa có tòa nhà nào. Tạo tòa nhà mới để bắt đầu quản lý phòng theo tòa nhà.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-hairline-cloud bg-white p-4">
        <div>
          <label className="block text-sm text-ink-deep">
            <span className="block text-xs font-semibold uppercase text-accent-violet-mid mb-1">Tên tòa nhà <span className="text-accent-pink">*</span></span>
            <input
              type="text"
              value={form.buildingName}
              onChange={(e) => setForm((prev) => ({ ...prev, buildingName: e.target.value }))}
              className="text-input"
              required
              placeholder="Ví dụ: Tòa nhà A, Block B..."
            />
          </label>
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
        <label className="block text-sm text-ink-deep">
          <span className="block text-xs font-semibold uppercase text-accent-violet-mid">Mô tả</span>
          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            className="text-input mt-1 min-h-[100px] resize-none"
          />
        </label>
        {error && <p className="text-sm text-accent-pink">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Save size={16} />
            {saving ? 'Đang lưu…' : editId ? 'Cập nhật tòa nhà' : 'Lưu tòa nhà'}
          </button>
          {editId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-hairline-cloud bg-surface-light px-3 py-2 text-sm text-ink-deep transition hover:bg-surface-press"
            >
              <X size={16} />
              Hủy
            </button>
          )}
        </div>
      </form>
      <ConfirmDeleteDialog />
    </div>
  );
};

export default BuildingManager;
