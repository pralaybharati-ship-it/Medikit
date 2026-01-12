import React from 'react';
import { Hospital } from '../types';
import { LayoutDashboard, Building2, Users, PlusCircle } from 'lucide-react';

interface SidebarProps {
  hospitals: Hospital[];
  selectedHospitalId: string | 'all';
  onSelectHospital: (id: string | 'all') => void;
  onManageHospitals: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  hospitals,
  selectedHospitalId,
  onSelectHospital,
  onManageHospitals
}) => {
  return (
    <div className="w-64 bg-slate-900 text-slate-300 h-screen flex flex-col shadow-xl fixed left-0 top-0 z-20">
      <div className="p-6 border-b border-slate-700 flex items-center space-x-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <LayoutDashboard className="text-white w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">MediTrack</h1>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Main
        </div>
        
        <button
          onClick={() => onSelectHospital('all')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
            selectedHospitalId === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'hover:bg-slate-800 text-slate-300'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="font-medium">All Patients</span>
        </button>

        <div className="mt-8 px-3 mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
          <span>Hospitals</span>
          <button 
            onClick={onManageHospitals}
            className="text-blue-400 hover:text-blue-300 transition-colors"
            title="Manage Hospitals"
          >
            Manage
          </button>
        </div>

        {hospitals.map((hospital) => (
          <button
            key={hospital.id}
            onClick={() => onSelectHospital(hospital.id)}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group ${
              selectedHospitalId === hospital.id 
                ? 'bg-slate-800 text-white border-l-4 border-blue-500' 
                : 'hover:bg-slate-800 text-slate-300 border-l-4 border-transparent'
            }`}
          >
            <Building2 className={`w-5 h-5 ${selectedHospitalId === hospital.id ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
            <span className="truncate">{hospital.name}</span>
          </button>
        ))}

        <button
          onClick={onManageHospitals}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border-l-4 border-transparent mt-2 border-t border-slate-800 pt-4"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add Hospital</span>
        </button>
      </nav>

      <div className="p-4 border-t border-slate-700 text-xs text-slate-500 text-center">
        v1.0.0 • React App
      </div>
    </div>
  );
};