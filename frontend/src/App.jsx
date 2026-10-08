import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import RoomsView from './components/RoomsView';
import GuestsView from './components/GuestsView';
import ReservationsView from './components/ReservationsView';
import CheckInOutView from './components/CheckInOutView';
import PaymentsView from './components/PaymentsView';
import StaffView from './components/StaffView';
import AdbmsLabView from './components/AdbmsLabView';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} />;
      case 'rooms':
        return <RoomsView />;
      case 'guests':
        return <GuestsView />;
      case 'reservations':
        return <ReservationsView onNavigateToDesk={() => setActiveTab('checkinout')} />;
      case 'checkinout':
        return <CheckInOutView onNavigateToPayments={() => setActiveTab('payments')} />;
      case 'payments':
        return <PaymentsView />;
      case 'staff':
        return <StaffView />;
      case 'adbms-lab':
        return <AdbmsLabView />;
      default:
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Navigation Sidebar */}
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
