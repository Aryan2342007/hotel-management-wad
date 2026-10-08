import React from 'react';
import {
  LayoutDashboard,
  BedDouble,
  Users,
  CalendarCheck,
  UserCheck,
  CreditCard,
  UserCog,
  Database,
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, moduleNum: 'Mod 8' },
  { id: 'rooms', label: 'Room Management', icon: BedDouble, moduleNum: 'Mod 2' },
  { id: 'guests', label: 'Guest Management', icon: Users, moduleNum: 'Mod 1' },
  { id: 'reservations', label: 'Reservations', icon: CalendarCheck, moduleNum: 'Mod 3' },
  { id: 'checkinout', label: 'Check-In / Out Desk', icon: UserCheck, moduleNum: 'Mod 4-5' },
  { id: 'payments', label: 'Payments & Billing', icon: CreditCard, moduleNum: 'Mod 6' },
  { id: 'staff', label: 'Staff Management', icon: UserCog, moduleNum: 'Mod 7' },
  { id: 'adbms-lab', label: 'ADBMS Query Lab', icon: Database, moduleNum: 'ADBMS' },
];

export default function Sidebar({ activeTab, onSelectTab }) {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-61px)]">
      <div className="p-4 border-b border-slate-800/80">
        <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold px-2 mb-1">
          Hotel Modules
        </p>
        <p className="text-xs text-slate-500 px-2">8 Integrated ADBMS Modules</p>
      </div>

      <nav className="p-3 space-y-1.5 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/10'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  isActive
                    ? 'bg-slate-900/20 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {item.moduleNum}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
          <p className="text-slate-200 font-semibold text-xs">ADBMS Course Project</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Stack: React • Express • Mongoose • MongoDB
          </p>
        </div>
      </div>
    </aside>
  );
}
