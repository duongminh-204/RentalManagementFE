import { useState } from 'react';
import { Loader2, UserCog, KeyRound } from 'lucide-react';
import { useProfile } from '../hooks/useProfile';
import AvatarUpload from '../components/AvatarUpload';
import ProfileEditForm from '../components/ProfileEditForm';
import ChangePasswordForm from '../components/ChangePasswordForm';

const TABS = [
  { id: 'info', label: 'Thông tin', icon: UserCog },
  { id: 'password', label: 'Mật khẩu', icon: KeyRound },
];

export default function ProfilePage() {
  const { profile, loading, error, saveProfile, uploadAvatar, changePassword } = useProfile();
  const [activeTab, setActiveTab] = useState('info');

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted">
        <Loader2 className="mr-2 animate-spin" size={20} />
        Đang tải thông tin...
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="mx-auto mt-10 max-w-md rounded-md border border-accent-pink/40 bg-accent-pink/10 px-4 py-3 text-center text-sm text-ink-deep">
        {error}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="eyebrow mb-1 text-accent-violet-mid">Tài khoản</p>
        <h1 className="font-display text-2xl font-semibold text-ink-deep">Hồ sơ của tôi</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="card-light h-fit p-6">
          <AvatarUpload
            avatar={profile?.avatar}
            fullName={profile?.fullName}
            role={profile?.role}
            onUpload={uploadAvatar}
          />
        </aside>

        <section className="card-light p-6 md:p-8">
          <div className="mb-6 flex gap-2 border-b border-hairline-cloud">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-primary text-ink-deep'
                      : 'border-transparent text-muted hover:text-ink-deep'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === 'info' ? (
            <ProfileEditForm key={profile?.userId ?? 'profile'} profile={profile} onSave={saveProfile} />
          ) : (
            <ChangePasswordForm onChangePassword={changePassword} />
          )}
        </section>
      </div>
    </div>
  );
}
