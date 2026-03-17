import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import Footer from '@/components/Footer';
import { APP_CONFIG } from '@/config/appConfig';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col relative pb-20 md:pb-0">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <BottomNav />
      <Footer />
    </div>
  );
}