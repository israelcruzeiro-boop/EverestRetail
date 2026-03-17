import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Marketplace from '@/pages/Marketplace';
import ProductDetail from '@/pages/ProductDetail';
import Login from '@/pages/Login';
import Checkout from '@/pages/Checkout';
import Schedule from '@/pages/Schedule';
import RequestPublication from '@/pages/RequestPublication';
import ContentDetail from '@/pages/ContentDetail';
import UserPanel from '@/pages/UserPanel';
import BlogFeed from '@/pages/Blog/BlogFeed';
import CreatePost from '@/pages/Blog/CreatePost';
import HighlightsPage from '@/pages/HighlightsPage';
import ModulesPage from '@/pages/ModulesPage';
import VideocastsPage from '@/pages/Videocasts';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfUse from '@/pages/TermsOfUse';
import AIImmersion from '@/pages/AIImmersion';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import DailyBonusLoader from '@/components/DailyBonusLoader';
import MissionStreakLoader from '@/components/MissionStreakLoader';

// Admin
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/Dashboard';
import AdminProducts from '@/pages/admin/Products';
import AdminPartners from '@/pages/admin/Partners';
import AdminUsers from '@/pages/admin/Users';
import AdminSettings from '@/pages/admin/Settings';
import AdminContent from '@/pages/admin/Content';
import AdminSponsoredVideos from '@/pages/admin/SponsoredVideos';
import AdminBlog from '@/pages/admin/Blog';
import AdminStoreManagement from '@/pages/admin/StoreManagement';

// Guards
import RequireAuth from '@/components/guards/RequireAuth';
import RequireAdmin from '@/components/guards/RequireAdmin';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AnalyticsTracker />
        <DailyBonusLoader />
        <MissionStreakLoader />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="marketplace" element={<Marketplace />} />
            <Route path="highlights" element={<HighlightsPage />} />
            <Route path="destaques" element={<Navigate to="/highlights" replace />} />
            <Route path="modules" element={<ModulesPage />} />
            <Route path="modulos" element={<Navigate to="/modules" replace />} />
            <Route path="videocasts" element={<VideocastsPage />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="conteudo/:slug" element={<ContentDetail />} />
            <Route path="login" element={<Login />} />
            <Route path="privacidade" element={<PrivacyPolicy />} />
            <Route path="termos" element={<TermsOfUse />} />

            {/* Public Blog Routes */}
            <Route path="blog" element={<BlogFeed />} />
            <Route path="blog/:id" element={<BlogFeed />} />

            {/* Protected User Routes */}
            <Route path="painel" element={<RequireAuth><UserPanel /></RequireAuth>} />
            <Route path="checkout/:id" element={<RequireAuth><Checkout /></RequireAuth>} />
            <Route path="schedule/:id" element={<RequireAuth><Schedule /></RequireAuth>} />
            <Route path="request-publication" element={<RequireAuth><RequestPublication /></RequireAuth>} />
            <Route path="blog/novo" element={<RequireAuth><CreatePost /></RequireAuth>} />
          </Route>

          {/* Admin Routes - Highly Protected */}
          <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="store" element={<AdminStoreManagement />} />
            <Route path="partners" element={<AdminPartners />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="sponsored-videos" element={<AdminSponsoredVideos />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Standalone Landing Pages (outside Layout) */}
          <Route path="imersao-ia" element={<AIImmersion />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}