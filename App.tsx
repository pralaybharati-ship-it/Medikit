import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { RecordsTable } from './components/RecordsTable';
import { Modal } from './components/Modal';
import { DataService } from './services/dataService';
import { Hospital, PatientRecord, SortField, SortOrder, FilterState } from './types';
import { Plus, Search, Filter, Calendar as CalendarIcon } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | 'all'>('all');
  
  // UI State
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isHospitalModalOpen, setIsHospitalModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PatientRecord | null>(null);
  
  // Filters & Sorting
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    hospitalId: 'all',
    startDate: '',
    endDate: ''
  });
  const [sortField, setSortField] = useState<SortField>('visitDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Form States (Simplified for this file, ideally separate components)
  const [recordForm, setRecordForm] = useState<Partial<PatientRecord>>({});
  const [hospitalForm, setHospitalForm] = useState<Partial<Hospital>>({});

  // --- Effects ---
  useEffect(() => {
    setHospitals(DataService.getHospitals());
    setRecords(DataService.getRecords());
  }, []);

  useEffect(() => {
    DataService.saveHospitals(hospitals);
  }, [hospitals]);

  useEffect(() => {
    DataService.saveRecords(records);
  }, [records]);

  // --- Computed Data ---
  const filteredRecords = useMemo(() => {
    let filtered = records.filter(record => {
      // Hospital Filter
      if (selectedHospitalId !== 'all' && record.hospitalId !== selectedHospitalId) return false;
      
      // Text Search
      const searchLower = filters.searchQuery.toLowerCase();
      const matchesSearch = 
        record.patientName.toLowerCase().includes(searchLower) ||
        record.phoneNumber.includes(searchLower) ||
        record.diagnosis.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;

      // Date Range
      if (filters.startDate && record.visitDate < filters.startDate) return false;
      if (filters.endDate && record.visitDate > filters.endDate) return false;

      return true;
    });

    return filtered.sort((a, b) => {
      const valA = a[sortField] || '';
      const valB = b[sortField] || '';
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [records, selectedHospitalId, filters, sortField, sortOrder]);

  // --- Handlers ---

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // Default to newest first when switching fields
    }
  };

  const handleOpenAddRecord = () => {
    setEditingRecord(null);
    setRecordForm({
      visitDate: new Date().toISOString().split('T')[0],
      hospitalId: selectedHospitalId === 'all' ? hospitals[0]?.id : selectedHospitalId,
      status: 'active'
    });
    setIsRecordModalOpen(true);
  };

  const handleEditRecord = (record: PatientRecord) => {
    setEditingRecord(record);
    setRecordForm({ ...record });
    setIsRecordModalOpen(true);
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleQuickUpdate = (id: string, updates: Partial<PatientRecord>) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordForm.patientName || !recordForm.hospitalId || !recordForm.visitDate) {
      alert("Please fill in required fields");
      return;
    }

    if (editingRecord) {
      setRecords(prev => prev.map(r => r.id === editingRecord.id ? { ...recordForm as PatientRecord, id: editingRecord.id } : r));
    } else {
      const newRecord: PatientRecord = {
        ...recordForm as PatientRecord,
        id: crypto.randomUUID(),
      };
      setRecords(prev => [newRecord, ...prev]);
    }
    setIsRecordModalOpen(false);
  };

  const handleSaveHospital = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospitalForm.name) return;

    const newHospital: Hospital = {
      id: crypto.randomUUID(),
      name: hospitalForm.name || '',
      location: hospitalForm.location || '',
      color: 'bg-blue-500'
    };
    setHospitals(prev => [...prev, newHospital]);
    setHospitalForm({});
    setIsHospitalModalOpen(false);
  };

  const handleDeleteHospital = (id: string) => {
    if (window.confirm('Delete this hospital? Associated records will remain but may need reassignment.')) {
      setHospitals(prev => prev.filter(h => h.id !== id));
      if (selectedHospitalId === id) setSelectedHospitalId('all');
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar 
        hospitals={hospitals} 
        selectedHospitalId={selectedHospitalId} 
        onSelectHospital={setSelectedHospitalId}
        onManageHospitals={() => setIsHospitalModalOpen(true)}
      />

      {/* Main Content */}
      <div className="ml-64 flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {selectedHospitalId === 'all' 
                ? 'All Patients Dashboard' 
                : hospitals.find(h => h.id === selectedHospitalId)?.name || 'Hospital Dashboard'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {filteredRecords.length} patient records found
            </p>
          </div>

          <div className="flex items-center gap-3">
             <button 
              onClick={handleOpenAddRecord}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg shadow-sm transition-all font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Add Patient</span>
            </button>
          </div>
        </header>

        {/* Filters Toolbar */}
        <div className="px-8 py-4 bg-slate-50 border-b border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, phone, or diagnosis..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            />
          </div>
          
          <div className="md:col-span-7 flex gap-3 overflow-x-auto pb-1 md:pb-0">
             <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 py-2">
                <CalendarIcon className="w-4 h-4 text-slate-500" />
                <input 
                  type="date" 
                  className="text-sm bg-transparent border-none p-0 text-slate-600 focus:ring-0"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({...prev, startDate: e.target.value}))}
                  title="Start Date"
                />
                <span className="text-slate-400">-</span>
                <input 
                  type="date" 
                  className="text-sm bg-transparent border-none p-0 text-slate-600 focus:ring-0"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({...prev, endDate: e.target.value}))}
                  title="End Date"
                />
             </div>
             
             <button 
              onClick={() => setFilters({ searchQuery: '', hospitalId: 'all', startDate: '', endDate: '' })}
              className="px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              Clear Filters
             </button>
          </div>
        </div>

        {/* Table View */}
        <main className="flex-1 overflow-hidden p-8">
          <RecordsTable 
            records={filteredRecords}
            hospitals={hospitals}
            onEditRecord={handleEditRecord}
            onDeleteRecord={handleDeleteRecord}
            onQuickUpdate={handleQuickUpdate}
            sortField={sortField}
            sortOrder={sortOrder}
            onSort={handleSort}
          />
        </main>
      </div>

      {/* --- Modals --- */}

      {/* Patient Record Modal */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title={editingRecord ? 'Edit Patient Record' : 'New Patient Record'}
      >
        <form onSubmit={handleSaveRecord} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
               <label className="text-sm font-medium text-slate-700">Hospital</label>
               <select 
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={recordForm.hospitalId || ''}
                onChange={e => setRecordForm(prev => ({ ...prev, hospitalId: e.target.value }))}
                required
               >
                 <option value="" disabled>Select Hospital</option>
                 {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
               </select>
             </div>
             <div className="space-y-1">
               <label className="text-sm font-medium text-slate-700">Visit Date</label>
               <input 
                 type="date"
                 className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                 value={recordForm.visitDate || ''}
                 onChange={e => setRecordForm(prev => ({ ...prev, visitDate: e.target.value }))}
                 required
               />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Patient Name</label>
              <input 
                type="text"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="John Doe"
                value={recordForm.patientName || ''}
                onChange={e => setRecordForm(prev => ({ ...prev, patientName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Phone Number</label>
              <input 
                type="tel"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="555-0000"
                value={recordForm.phoneNumber || ''}
                onChange={e => setRecordForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-1">
             <label className="text-sm font-medium text-slate-700">Diagnosis</label>
             <input 
               type="text"
               className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
               placeholder="e.g., Acute Bronchitis"
               value={recordForm.diagnosis || ''}
               onChange={e => setRecordForm(prev => ({ ...prev, diagnosis: e.target.value }))}
             />
          </div>

          <div className="space-y-1">
             <label className="text-sm font-medium text-slate-700">Clinical Findings</label>
             <textarea 
               className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
               rows={3}
               placeholder="Symptoms, observations, lab results..."
               value={recordForm.clinicalFindings || ''}
               onChange={e => setRecordForm(prev => ({ ...prev, clinicalFindings: e.target.value }))}
             />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Next Visit Date</label>
              <input 
                type="date"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={recordForm.nextVisitDate || ''}
                onChange={e => setRecordForm(prev => ({ ...prev, nextVisitDate: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Status</label>
               <select 
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                value={recordForm.status || 'active'}
                onChange={e => setRecordForm(prev => ({ ...prev, status: e.target.value as any }))}
               >
                 <option value="active">Active</option>
                 <option value="follow-up">Follow Up Required</option>
                 <option value="completed">Completed</option>
               </select>
            </div>
          </div>
          
           <div className="space-y-1">
             <label className="text-sm font-medium text-slate-700">Doctor's Comments</label>
             <textarea 
               className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
               rows={3}
               placeholder="Prescriptions, advice, warnings..."
               value={recordForm.doctorComments || ''}
               onChange={e => setRecordForm(prev => ({ ...prev, doctorComments: e.target.value }))}
             />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => setIsRecordModalOpen(false)}
              className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              {editingRecord ? 'Update Record' : 'Save Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Hospital Management Modal */}
      <Modal
        isOpen={isHospitalModalOpen}
        onClose={() => setIsHospitalModalOpen(false)}
        title="Manage Hospitals"
      >
        <div className="space-y-6">
          <form onSubmit={handleSaveHospital} className="flex gap-2">
            <input 
              type="text" 
              className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter new hospital name"
              value={hospitalForm.name || ''}
              onChange={(e) => setHospitalForm(prev => ({ ...prev, name: e.target.value }))}
              required
            />
             <input 
              type="text" 
              className="w-1/3 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Location (Optional)"
              value={hospitalForm.location || ''}
              onChange={(e) => setHospitalForm(prev => ({ ...prev, location: e.target.value }))}
            />
            <button 
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Add
            </button>
          </form>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3">Hospital Name</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {hospitals.map(hospital => (
                  <tr key={hospital.id}>
                    <td className="px-6 py-3 font-medium text-slate-900">{hospital.name}</td>
                    <td className="px-6 py-3">{hospital.location}</td>
                    <td className="px-6 py-3 text-right">
                       <button 
                        onClick={() => handleDeleteHospital(hospital.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1.5 rounded transition-colors"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))}
                {hospitals.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-slate-400">No hospitals added yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

    </div>
  );
};

// Simple Trash Icon import fix for the Hospital Modal
import { Trash2 } from 'lucide-react';

export default App;