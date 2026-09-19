export type ServiceCategory = 'KTP_IKD' | 'KK_PINDAH' | 'AKTA_CAPIL' | 'KIA_NIK' | 'LEGALISIR_KHUSUS';

export type QueueType = 'REGULER' | 'PRIORITAS';

export type QueueStatus = 'MENUNGGU' | 'DIPANGGIL' | 'SEDANG_DILAYANI' | 'SELESAI' | 'TERLEWAT' | 'DIBATALKAN';

export type UserRole = 'portal' | 'admin' | 'operator' | 'kiosk' | 'display' | 'public';

export type DisplayScreenMode = 'all' | 1 | 2 | 3 | 4 | 5;

export interface ServiceDefinition {
  id: ServiceCategory;
  code: 'A' | 'B' | 'C' | 'D' | 'E';
  name: string;
  subtitle: string;
  defaultCounter: number;
  color: string;
  badgeBg: string;
  badgeText: string;
  iconName: string;
  estimatedMinutes: number;
  description: string;
  requirements: string[];
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  serviceCategory: ServiceCategory;
  serviceCode: 'A' | 'B' | 'C' | 'D' | 'E';
  serviceName: string;
  queueType: QueueType;
  citizenName?: string;
  citizenNik?: string;
  citizenPhone?: string;
  citizenDistrict?: string;
  counterAssigned: number | null;
  status: QueueStatus;
  createdAt: string; // ISO string
  calledAt: string | null;
  servedAt: string | null;
  finishedAt: string | null;
  callCount: number;
  officerNotes?: string;
  smsSent?: boolean;
  smsSentAt?: string | null;
  smsDeliveryStatus?: 'SENT' | 'FAILED' | 'PENDING';
}

export interface SmsNotificationLog {
  id: string;
  ticketNumber: string;
  phoneNumber: string;
  citizenName?: string;
  counterName: string;
  message: string;
  timestamp: string; // ISO string
  status: 'SENT' | 'FAILED';
}

export interface CounterInfo {
  id: number;
  name: string;
  serviceCategory: ServiceCategory;
  serviceCode: 'A' | 'B' | 'C' | 'D' | 'E';
  officerName: string;
  isOpen: boolean;
  currentTicketId: string | null;
}

export interface CallLogItem {
  id: string;
  ticketNumber: string;
  serviceName: string;
  counterId: number;
  counterName: string;
  timestamp: string;
  citizenName?: string;
}

export interface SystemSettings {
  soundEnabled: boolean;
  chimeVolume: number; // 0 - 100
  speechRate: number; // 0.8 - 1.2
  speechPitch: number; // 0.8 - 1.2
  voiceLanguage: string; // 'id-ID'
  autoRecallInterval: number; // seconds
  officeName: string;
  officeAddress: string;
  officeRegency: string;
  runningText: string;
  smsEnabled: boolean;
  smsGatewaySender: string;
  smsTemplate: string;
  adminPin: string;
}

export const KEEROM_DISTRICTS = [
  'Arso',
  'Arso Barat',
  'Arso Timur',
  'Skanto',
  'Waris',
  'Senggi',
  'Web',
  'Yafi',
  'Kaisenar',
  'Towe',
  'Mannem',
];
