import React from 'react';
import { Hotel, Database, ShieldCheck, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, onSelectTab }) {
  return (
    <header className="bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20 text-white font-bold">
          <Hotel className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">Grand Stay Luxury Hotel</h1>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              ADBMS Edition
            </span>
          </div>
          <p className="text-xs text-slate-500">Advanced Database Management System • Aryan Patel</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* ADBMS Quick Lab Button */}
        <button
          onClick={() => onSelectTab('adbms-lab')}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'adbms-lab'
              ? 'bg-amber-500 text-white font-semibold shadow-xs'
              : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>ADBMS Query Explorer</span>
        </button>

        {/* Database Status indicator */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <Database className="w-3.5 h-3.5 text-emerald-600" />
          <span>MongoDB Connected</span>
        </div>

        <div className="hidden md:flex items-center space-x-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
          <span>Staff Portal</span>
        </div>
      </div>
    </header>
  );
}
