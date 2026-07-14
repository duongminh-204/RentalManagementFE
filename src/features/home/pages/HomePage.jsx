import { Navigate } from 'react-router-dom';
import { useAuth, getRoleHomePath, getStoredUser, isOwnerRole, isOwnerSubscriptionReady } from '../../../hooks/useAuth';
import HomeNavbar from '../components/HomeNavbar';
import HomeHero from '../components/HomeHero';
import HomeStats from '../components/HomeStats';
import HomeWhyUs from '../components/HomeWhyUs';
import HomeFeatures from '../components/HomeFeatures';
import HomePricing from '../components/HomePricing';
import HomeModules from '../components/HomeModules';
import HomeHowItWorks from '../components/HomeHowItWorks';
import HomeUseCases from '../components/HomeUseCases';
import HomeTestimonials from '../components/HomeTestimonials';
import HomeAboutUs from '../components/HomeAboutUs';
import HomeFaq from '../components/HomeFaq';
import HomeCta from '../components/HomeCta';
import HomeFooter from '../components/HomeFooter';

export default function HomePage() {
  const { isAuthenticated, role } = useAuth();
  const user = getStoredUser();

  if (isAuthenticated) {
    const canBrowseHomeWithoutPlan = isOwnerRole(role) && !isOwnerSubscriptionReady(user);
    const redirectPath = getRoleHomePath(role, user);
    if (!canBrowseHomeWithoutPlan) {
      if (redirectPath) {
        return <Navigate to={redirectPath} replace />;
      }
    }
  }

  return (
    <div className="home-page min-h-screen min-w-0 overflow-x-clip bg-surface-night">
      <HomeNavbar />
      <main>
        <HomeHero />
        <HomeStats />
        <HomeWhyUs />
        <HomeFeatures />
        <HomePricing />
        <HomeModules />
        <HomeHowItWorks />
        <HomeUseCases />
        <HomeTestimonials />
        <HomeAboutUs />
        <HomeFaq />
        <HomeCta />
      </main>
      <HomeFooter />
    </div>
  );
}
