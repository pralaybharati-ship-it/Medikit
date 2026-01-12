export interface Hospital {
  id: string;
  name: string;
  location: string;
  color: string; // For UI differentiation
}

export interface PatientRecord {
  id: string;
  hospitalId: string;
  visitDate: string; // YYYY-MM-DD
  patientName: string;
  phoneNumber: string;
  diagnosis: string;
  clinicalFindings: string;
  nextVisitDate: string; // YYYY-MM-DD
  doctorComments: string;
  status: 'active' | 'completed' | 'follow-up';
}

export type SortField = 'visitDate' | 'patientName' | 'nextVisitDate';
export type SortOrder = 'asc' | 'desc';

export interface FilterState {
  searchQuery: string;
  hospitalId: string | 'all';
  startDate: string;
  endDate: string;
}