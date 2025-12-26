export interface Citation {
  act: string;
  section: string;
  title: string;
  url: string;
}

export interface Action {
  type: 'download_pdf' | 'refer_lawyer' | 'find_police_station' | 'call_emergency';
  label: string;
}

export interface Attachment {
  data: string;
  mimeType: string;
}

export interface GroundingChunk {
  maps?: {
    uri: string;
    title: string;
  };
  web?: {
    uri: string;
    title: string;
  };
}

export interface Metadata {
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  sources: Citation[];
  actions: string[];
  groundingChunks?: GroundingChunk[];
  attachment?: Attachment;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  metadata?: Metadata;
  timestamp: number;
  feedback?: 'positive' | 'negative' | 'reported';
}

export interface FirFormData {
  complainantName: string;
  incidentDate: string;
  incidentTime: string;
  place: string;
  details: string;
  policeStation: string;
  offenseType: string;
  documentType: 'FIR' | 'Affidavit' | 'Legal Notice';
}

export enum AppMode {
  CHAT = 'CHAT',
  FIR_GENERATOR = 'FIR_GENERATOR',
  IPC_EXPLAINER = 'IPC_EXPLAINER',
  BANK_FRAUD = 'BANK_FRAUD',
  CONSUMER_RIGHTS = 'CONSUMER_RIGHTS',
  AADHAAR_SUPPORT = 'AADHAAR_SUPPORT',
  STATION_FINDER = 'STATION_FINDER',
  FIR_TRACKER = 'FIR_TRACKER',
  GLOBAL_SEARCH = 'GLOBAL_SEARCH',
  ADR_GUIDE = 'ADR_GUIDE',
  LEGAL_DICTIONARY = 'LEGAL_DICTIONARY'
}

export type LanguageCode = 'en' | 'hi' | 'bn' | 'te' | 'mr' | 'ta' | 'gu' | 'kn' | 'ml' | 'pa';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  description: string;
}