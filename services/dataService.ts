import { Hospital, PatientRecord } from '../types';

// Initial Mock Data
const MOCK_HOSPITALS: Hospital[] = [
  { id: 'h1', name: 'City General Hospital', location: 'Downtown', color: 'bg-blue-500' },
  { id: 'h2', name: 'St. Mary\'s Clinic', location: 'West End', color: 'bg-emerald-500' },
  { id: 'h3', name: 'Unity Medical Center', location: 'Northside', color: 'bg-purple-500' },
];

const MOCK_RECORDS: PatientRecord[] = [
  {
    id: 'r1',
    hospitalId: 'h1',
    visitDate: '2023-10-25',
    patientName: 'John Doe',
    phoneNumber: '555-0123',
    diagnosis: 'Hypertension',
    clinicalFindings: 'BP 150/95, complaints of headaches.',
    nextVisitDate: '2023-11-25',
    doctorComments: 'Monitor BP daily. Reduce salt intake.',
    status: 'follow-up'
  },
  {
    id: 'r2',
    hospitalId: 'h1',
    visitDate: '2023-10-26',
    patientName: 'Jane Smith',
    phoneNumber: '555-0456',
    diagnosis: 'Type 2 Diabetes',
    clinicalFindings: 'HBA1C 7.2%, fatigue.',
    nextVisitDate: '2023-11-10',
    doctorComments: 'Prescribed Metformin 500mg.',
    status: 'active'
  },
  {
    id: 'r3',
    hospitalId: 'h2',
    visitDate: '2023-10-27',
    patientName: 'Robert Brown',
    phoneNumber: '555-0789',
    diagnosis: 'Acute Bronchitis',
    clinicalFindings: 'Wheezing, persistent cough.',
    nextVisitDate: '',
    doctorComments: 'Course of antibiotics completed.',
    status: 'completed'
  },
  {
    id: 'r4',
    hospitalId: 'h3',
    visitDate: '2023-10-28',
    patientName: 'Emily Davis',
    phoneNumber: '555-1011',
    diagnosis: 'Migraine',
    clinicalFindings: 'Photophobia, nausea.',
    nextVisitDate: '2023-12-01',
    doctorComments: 'Keep a headache diary.',
    status: 'follow-up'
  }
];

const STORAGE_KEYS = {
  HOSPITALS: 'meditrack_hospitals',
  RECORDS: 'meditrack_records'
};

export const DataService = {
  getHospitals: (): Hospital[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.HOSPITALS);
    if (stored) return JSON.parse(stored);
    return MOCK_HOSPITALS;
  },

  saveHospitals: (hospitals: Hospital[]) => {
    localStorage.setItem(STORAGE_KEYS.HOSPITALS, JSON.stringify(hospitals));
  },

  getRecords: (): PatientRecord[] => {
    const stored = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (stored) return JSON.parse(stored);
    return MOCK_RECORDS;
  },

  saveRecords: (records: PatientRecord[]) => {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  }
};