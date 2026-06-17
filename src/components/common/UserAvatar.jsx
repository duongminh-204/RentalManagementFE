import { getDefaultAvatar, resolveMediaUrl } from '../../features/profile/utils/profileHelpers';

const SIZE_CLASS = {
  sm: 'h-8 w-8',
  md: 'h-9 w-9',
  lg: 'h-10 w-10',
};

const UserAvatar = ({ user, size = 'md', className = '' }) => {
  const fullName = user?.fullName || user?.FullName || '';
  const avatarSrc =
    resolveMediaUrl(user?.avatar ?? user?.Avatar) || getDefaultAvatar(fullName);

  return (
    <img
      src={avatarSrc}
      alt={fullName || 'Avatar'}
      className={`shrink-0 rounded-full object-cover ring-2 ring-hairline-cloud ${SIZE_CLASS[size] || SIZE_CLASS.md} ${className}`}
      onError={(e) => {
        e.currentTarget.src = getDefaultAvatar(fullName);
      }}
    />
  );
};

export default UserAvatar;
