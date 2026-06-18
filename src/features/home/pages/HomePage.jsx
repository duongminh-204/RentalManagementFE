import { Navigate } from 'react-router-dom';
import { useAuth, getRoleHomePath } from '../../../hooks/useAuth';
import HomeNavbar from '../components/HomeNavbar';
import HomeHero from '../components/HomeHero';
import HomeStats from '../components/HomeStats';
import HomeWhyUs from '../components/HomeWhyUs';
import HomeFeatures from '../components/HomeFeatures';
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

  if (isAuthenticated) {
    return <Navigate to={getRoleHomePath(role)} replace />;
  }

  return (
    <div className="home-page min-h-screen bg-surface-night">
      <HomeNavbar />
      <main>
        <HomeHero />
        <HomeStats />
        <HomeWhyUs />
        <HomeFeatures />
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
