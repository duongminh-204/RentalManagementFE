import FeatureLockedNotice from './FeatureLockedNotice';
import { resolveFeatureRouteNotice } from '../../utils/apiError';

const FeatureRouteLock = ({ path, children }) => {
  const notice = resolveFeatureRouteNotice(path);

  if (notice) {
    return (
      <div className="min-h-screen w-full flex-1 bg-surface-light">
        <div className="page-content page-content--wide py-8">
          <FeatureLockedNotice {...notice} fullPage />
        </div>
      </div>
    );
  }

  return children;
};

export default FeatureRouteLock;
