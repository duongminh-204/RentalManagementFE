import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Building2,
  ClipboardCheck,
  DoorOpen,
  FileWarning,
  Loader2,
  Scale,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useLegal } from '../hooks/useLegal';
import LegalScoreRing from '../components/LegalScoreRing';
import LegalAlertsPanel from '../components/LegalAlertsPanel';
import { TenantLegalTab, TenantLegalDetailPanel } from '../components/TenantLegalTab';
import { RoomLegalTab, RoomLegalDetailPanel } from '../components/RoomLegalTab';
import BuildingDocumentsTab from '../components/BuildingDocumentsTab';
import FeatureLockedNotice from '../../../components/common/FeatureLockedNotice';
import StatCard from '../../dashboard/components/StatCard';

const TABS = [
  { id: 'overview', label: 'Tổng quan', icon: Scale },
  { id: 'tenants', label: 'Khách thuê', icon: Users },
  { id: 'rooms', label: 'Phòng trọ', icon: DoorOpen },
  { id: 'buildings', label: 'Giấy tờ khu trọ', icon: Building2 },
];

const LegalPage = () => {
  const {
    dashboard,
    alerts,
    tenants,
    rooms,
    documents,
    loading,
    error,
    accessNotice,
    fetchDashboard,
    fetchTenants,
    fetchRooms,
    fetchDocuments,
    fetchTenantDetail,
    fetchRoomDetail,
    saveTenantProfile,
    uploadTenantDoc,
    saveRoomProfile,
    uploadHandover,
    saveDocument,
    removeDocument,
    uploadDocumentFile,
    syncNotifications,
  } = useLegal();

  const [activeTab, setActiveTab] = useState('overview');
  const [tenantSearch, setTenantSearch] = useState('');
  const [roomSearch, setRoomSearch] = useState('');
  const [roomStatusFilter, setRoomStatusFilter] = useState('all');
  const [selectedTenantId, setSelectedTenantId] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    if (activeTab === 'tenants') fetchTenants();
    if (activeTab === 'rooms') fetchRooms();
    if (activeTab === 'buildings') fetchDocuments();
  }, [activeTab, fetchTenants, fetchRooms, fetchDocuments]);

  const handleAlertSelect = (alert) => {
    if (alert.tenantId) {
      setActiveTab('tenants');
      setSelectedTenantId(alert.tenantId);
    } else if (alert.roomId) {
      setActiveTab('rooms');
      setSelectedRoomId(alert.roomId);
    } else if (alert.buildingId) {
      setActiveTab('buildings');
    }
  };

  const handleSyncNotifications = async () => {
    setSyncing(true);
    setSyncMessage('');
    try {
      const result = await syncNotifications();
      setSyncMessage(result?.message || 'Đã đồng bộ thông báo.');
    } catch {
      setSyncMessage('Không thể đồng bộ thông báo.');
    } finally {
      setSyncing(false);
    }
  };

  if (accessNotice) {
    return (
      <div className="min-h-screen bg-surface-light p-6">
        <FeatureLockedNotice notice={accessNotice} />
      </div>
    );
  }

  if (loading && !dashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-light">
        <Loader2 className="animate-spin text-accent-violet" size={36} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-light">
      <div className="border-b border-hairline-cloud bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-accent-violet to-ink-deep p-3 text-white shadow-lg">
                <ClipboardCheck size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-ink-deep sm:text-3xl">Checklist Pháp lý</h1>
                <p className="text-sm text-muted">
                  Quản lý hồ sơ, hợp đồng, tạm trú và giấy tờ khu trọ
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSyncNotifications}
              disabled={syncing}
              className="inline-flex items-center gap-2 self-start rounded-xl border border-hairline-cloud bg-white px-4 py-2.5 text-sm font-semibold text-ink-deep hover:bg-surface-press disabled:opacity-60"
            >
              <Bell size={18} />
              {syncing ? 'Đang đồng bộ...' : 'Gửi thông báo nhắc nhở'}
            </button>
          </div>
          {syncMessage && (
            <p className="mt-3 text-sm text-accent-violet-deep">{syncMessage}</p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  active
                    ? 'bg-accent-violet text-white shadow-md'
                    : 'bg-white text-ink-deep border border-hairline-cloud hover:border-accent-violet/30'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-[#f3c3d3] bg-[#fff5f8] px-4 py-3 text-sm text-[#b33f69]">
            {error}
          </div>
        )}

        {activeTab === 'overview' && dashboard && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
              <div className="flex flex-col items-center justify-center rounded-2xl border border-hairline-cloud bg-white p-6 shadow-sm">
                <p className="mb-4 text-sm font-semibold text-muted">Điểm pháp lý (Legal Score)</p>
                <LegalScoreRing score={dashboard.legalScore} />
                <p className="mt-4 text-center text-xs text-muted">
                  Dựa trên tỷ lệ hoàn thành hồ sơ khách, phòng và giấy tờ khu trọ
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <StatCard
                  title="Phòng đủ hồ sơ"
                  value={dashboard.roomsComplete}
                  icon={ShieldCheck}
                  tone="success"
                  badge={`/${dashboard.occupiedRooms} phòng đang thuê`}
                />
                <StatCard
                  title="Phòng thiếu giấy tờ"
                  value={dashboard.roomsIncomplete}
                  icon={FileWarning}
                  tone="warning"
                />
                <StatCard
                  title="Hợp đồng sắp hết hạn"
                  value={dashboard.expiringContracts}
                  icon={ClipboardCheck}
                  tone="danger"
                />
                <StatCard
                  title="Chưa khai báo tạm trú"
                  value={dashboard.pendingTempResidence}
                  icon={Users}
                  tone="danger"
                />
              </div>
            </div>

            <LegalAlertsPanel alerts={alerts} onSelectAlert={handleAlertSelect} />
          </motion.div>
        )}

        {activeTab === 'tenants' && (
          <TenantLegalTab
            tenants={tenants}
            search={tenantSearch}
            onSearchChange={setTenantSearch}
            onSelectTenant={setSelectedTenantId}
          />
        )}

        {activeTab === 'rooms' && (
          <RoomLegalTab
            rooms={rooms}
            search={roomSearch}
            onSearchChange={setRoomSearch}
            statusFilter={roomStatusFilter}
            onStatusFilterChange={setRoomStatusFilter}
            onSelectRoom={setSelectedRoomId}
          />
        )}

        {activeTab === 'buildings' && (
          <BuildingDocumentsTab
            documents={documents}
            loading={loading}
            onCreate={(buildingId, payload) => saveDocument(buildingId, payload)}
            onUpdate={(id, payload) => saveDocument(null, payload, id)}
            onDelete={removeDocument}
            onUploadFile={uploadDocumentFile}
          />
        )}
      </div>

      {(selectedTenantId || selectedRoomId) && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/30">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            className="h-full w-full max-w-lg bg-white shadow-2xl"
          >
            {selectedTenantId && (
              <TenantLegalDetailPanel
                tenantId={selectedTenantId}
                onClose={() => setSelectedTenantId(null)}
                fetchDetail={fetchTenantDetail}
                onSaveProfile={saveTenantProfile}
                onUploadDoc={uploadTenantDoc}
              />
            )}
            {selectedRoomId && (
              <RoomLegalDetailPanel
                roomId={selectedRoomId}
                onClose={() => setSelectedRoomId(null)}
                fetchDetail={fetchRoomDetail}
                onSaveProfile={saveRoomProfile}
                onUploadHandover={uploadHandover}
              />
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LegalPage;
