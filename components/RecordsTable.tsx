import React, { useState } from 'react';
import { PatientRecord, Hospital } from '../types';
import { Edit2, Trash2, Calendar, Phone, FileText, ChevronUp, ChevronDown, Check, X } from 'lucide-react';

interface RecordsTableProps {
  records: PatientRecord[];
  hospitals: Hospital[];
  onEditRecord: (record: PatientRecord) => void;
  onDeleteRecord: (id: string) => void;
  onQuickUpdate: (id: string, field: Partial<PatientRecord>) => void;
  sortField: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: any) => void;
}

export const RecordsTable: React.FC<RecordsTableProps> = ({
  records,
  hospitals,
  onEditRecord,
  onDeleteRecord,
  onQuickUpdate,
  sortField,
  sortOrder,
  onSort
}) => {
  const [editingCell, setEditingCell] = useState<{ id: string, field: string } | null>(null);
  const [tempValue, setTempValue] = useState('');

  const getHospitalName = (id: string) => hospitals.find(h => h.id === id)?.name || 'Unknown';

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <div className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-30 inline-block" />;
    return sortOrder === 'asc' 
      ? <ChevronUp className="w-4 h-4 ml-1 inline-block text-blue-600" /> 
      : <ChevronDown className="w-4 h-4 ml-1 inline-block text-blue-600" />;
  };

  const handleCellClick = (record: PatientRecord, field: 'nextVisitDate' | 'doctorComments') => {
    setEditingCell({ id: record.id, field });
    setTempValue(record[field] || '');
  };

  const saveCellEdit = () => {
    if (editingCell) {
      onQuickUpdate(editingCell.id, { [editingCell.field]: tempValue });
      setEditingCell(null);
    }
  };

  const cancelCellEdit = () => {
    setEditingCell(null);
    setTempValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveCellEdit();
    if (e.key === 'Escape') cancelCellEdit();
  };

  return (
    <div className="bg-white rounded-lg shadow border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-6 py-3 font-semibold group cursor-pointer hover:bg-slate-100" onClick={() => onSort('visitDate')}>
                Visit Date <SortIcon field="visitDate" />
              </th>
              <th scope="col" className="px-6 py-3 font-semibold group cursor-pointer hover:bg-slate-100" onClick={() => onSort('patientName')}>
                Patient Details <SortIcon field="patientName" />
              </th>
              <th scope="col" className="px-6 py-3 font-semibold">Diagnosis & Findings</th>
              <th scope="col" className="px-6 py-3 font-semibold group cursor-pointer hover:bg-slate-100 w-40" onClick={() => onSort('nextVisitDate')}>
                Next Visit <SortIcon field="nextVisitDate" />
              </th>
              <th scope="col" className="px-6 py-3 font-semibold w-1/4">Comments</th>
              <th scope="col" className="px-6 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {records.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="w-12 h-12 mb-3 text-slate-300" />
                    <p className="text-lg font-medium">No records found</p>
                    <p className="text-sm">Try adjusting your filters or add a new patient.</p>
                  </div>
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr key={record.id} className="bg-white hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-slate-900 font-medium">
                      <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                      {record.visitDate}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{getHospitalName(record.hospitalId)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 text-base">{record.patientName}</div>
                    <div className="flex items-center text-xs text-slate-500 mt-1">
                      <Phone className="w-3 h-3 mr-1" />
                      {record.phoneNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-blue-700 bg-blue-50 inline-block px-2 py-0.5 rounded text-xs mb-1">
                      {record.diagnosis}
                    </div>
                    <div className="text-xs text-slate-600 line-clamp-2" title={record.clinicalFindings}>
                      {record.clinicalFindings}
                    </div>
                  </td>
                  
                  {/* Editable Next Visit Date Cell */}
                  <td 
                    className={`px-6 py-4 cursor-pointer hover:bg-blue-50 transition-colors border-l border-r border-transparent hover:border-blue-200 ${editingCell?.id === record.id && editingCell.field === 'nextVisitDate' ? 'bg-blue-50 p-2' : ''}`}
                    onClick={() => !editingCell && handleCellClick(record, 'nextVisitDate')}
                  >
                    {editingCell?.id === record.id && editingCell.field === 'nextVisitDate' ? (
                      <div className="flex items-center space-x-1">
                        <input
                          type="date"
                          className="block w-full text-xs border-slate-300 rounded shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          autoFocus
                        />
                        <button onClick={(e) => { e.stopPropagation(); saveCellEdit(); }} className="p-1 text-green-600 hover:bg-green-100 rounded"><Check className="w-3 h-3"/></button>
                        <button onClick={(e) => { e.stopPropagation(); cancelCellEdit(); }} className="p-1 text-red-600 hover:bg-red-100 rounded"><X className="w-3 h-3"/></button>
                      </div>
                    ) : (
                       <span className={`${!record.nextVisitDate ? 'text-slate-400 italic' : 'text-slate-700'}`}>
                         {record.nextVisitDate || 'Set Date'}
                       </span>
                    )}
                  </td>

                  {/* Editable Comments Cell */}
                  <td 
                    className={`px-6 py-4 cursor-pointer hover:bg-blue-50 transition-colors border-l border-r border-transparent hover:border-blue-200 ${editingCell?.id === record.id && editingCell.field === 'doctorComments' ? 'bg-blue-50 p-2' : ''}`}
                    onClick={() => !editingCell && handleCellClick(record, 'doctorComments')}
                  >
                    {editingCell?.id === record.id && editingCell.field === 'doctorComments' ? (
                      <div className="relative">
                        <textarea
                          className="block w-full text-xs border-slate-300 rounded shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none"
                          rows={2}
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveCellEdit(); } if(e.key === 'Escape') cancelCellEdit(); }}
                          autoFocus
                        />
                        <div className="absolute right-1 bottom-1 flex space-x-1 bg-white/80 p-0.5 rounded">
                           <button onClick={(e) => { e.stopPropagation(); saveCellEdit(); }} className="p-1 text-green-600 hover:bg-green-100 rounded"><Check className="w-3 h-3"/></button>
                           <button onClick={(e) => { e.stopPropagation(); cancelCellEdit(); }} className="p-1 text-red-600 hover:bg-red-100 rounded"><X className="w-3 h-3"/></button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-600">
                        {record.doctorComments || <span className="text-slate-400 italic">Add notes...</span>}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => onEditRecord(record)}
                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors" 
                        title="Edit Full Record"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDeleteRecord(record.id)}
                        className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors" 
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};