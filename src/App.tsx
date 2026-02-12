import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { LoadingSpinner } from './components/LoadingSpinner';
import { SidebarProvider, useSidebar } from './contexts/SidebarContext';

const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Fleet = lazy(() => import('./pages/Fleet').then(m => ({ default: m.Fleet })));
const MapPage = lazy(() => import('./pages/Map').then(m => ({ default: m.Map })));

function AppContent() {
  const { collapsed } = useSidebar();
  
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar />
      <main className={`flex-1 min-h-screen transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><LoadingSpinner size="lg" text="Memuat halaman..." /></div>}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/fleet" element={<Fleet />} />
            <Route path="/map" element={<MapPage />} />
          </Routes>
        </Suspense>
        </main>
      </div>
  );
}

function App() {
  return (
    <Router>
      <SidebarProvider>
        <AppContent />
      </SidebarProvider>
    </Router>
  );
}

export default App;
