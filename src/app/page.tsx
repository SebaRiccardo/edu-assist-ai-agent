import { LandingPage } from '@/components/landing-page';
import Navbar from '@/components/landing/navbar/navbar';

export default function HomePage() {
  return <LandingPage navBarComponent={<Navbar />} />;
}
