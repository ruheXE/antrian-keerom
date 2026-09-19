import { Ticket, CounterInfo, CallLogItem, SystemSettings } from '../types';
import { INITIAL_COUNTERS, DEFAULT_SETTINGS, SERVICES_DATA } from '../data/servicesData';

const TICKETS_KEY = 'dukcapil_keerom_tickets_v1';
const COUNTERS_KEY = 'dukcapil_keerom_counters_v1';
const SETTINGS_KEY = 'dukcapil_keerom_settings_v1';
const CALL_LOGS_KEY = 'dukcapil_keerom_call_logs_v1';

export function getInitialSeedTickets(): Ticket[] {
  const now = new Date();
  const formatTime = (minutesAgo: number) => {
    return new Date(now.getTime() - minutesAgo * 60000).toISOString();
  };

  return [
    {
      id: 't-a-001',
      ticketNumber: 'A-001',
      serviceCategory: 'KTP_IKD',
      serviceCode: 'A',
      serviceName: 'KTP-el & IKD',
      queueType: 'REGULER',
      citizenName: 'Dominggus Tabuni',
      citizenNik: '9111011504980001',
      citizenDistrict: 'Arso',
      counterAssigned: 1,
      status: 'SELESAI',
      createdAt: formatTime(65),
      calledAt: formatTime(55),
      servedAt: formatTime(54),
      finishedAt: formatTime(42),
      callCount: 1,
      officerNotes: 'Perekaman KTP-el baru berhasil.'
    },
    {
      id: 't-a-002',
      ticketNumber: 'A-002',
      serviceCategory: 'KTP_IKD',
      serviceCode: 'A',
      serviceName: 'KTP-el & IKD',
      queueType: 'PRIORITAS',
      citizenName: 'Mama Elisabeth Tuamis',
      citizenNik: '9111015609550002',
      citizenDistrict: 'Arso Barat',
      counterAssigned: 1,
      status: 'SELESAI',
      createdAt: formatTime(50),
      calledAt: formatTime(40),
      servedAt: formatTime(39),
      finishedAt: formatTime(25),
      callCount: 1,
      officerNotes: 'Cetak KTP rusak & aktivasi IKD lansia didampingi.'
    },
    {
      id: 't-a-003',
      ticketNumber: 'A-003',
      serviceCategory: 'KTP_IKD',
      serviceCode: 'A',
      serviceName: 'KTP-el & IKD',
      queueType: 'REGULER',
      citizenName: 'Yunus Wenda',
      citizenNik: '9111022003010003',
      citizenDistrict: 'Skanto',
      counterAssigned: 1,
      status: 'SEDANG_DILAYANI',
      createdAt: formatTime(35),
      calledAt: formatTime(22),
      servedAt: formatTime(21),
      finishedAt: null,
      callCount: 1,
      officerNotes: 'Sedang perekaman sidik jari & foto biometrik.'
    },
    {
      id: 't-a-004',
      ticketNumber: 'A-004',
      serviceCategory: 'KTP_IKD',
      serviceCode: 'A',
      serviceName: 'KTP-el & IKD',
      queueType: 'REGULER',
      citizenName: 'Regina Kogoya',
      citizenNik: '9111034407040001',
      citizenPhone: '081248112233',
      citizenDistrict: 'Waris',
      counterAssigned: null,
      status: 'MENUNGGU',
      createdAt: formatTime(20),
      calledAt: null,
      servedAt: null,
      finishedAt: null,
      callCount: 0
    },
    {
      id: 't-a-005',
      ticketNumber: 'A-005',
      serviceCategory: 'KTP_IKD',
      serviceCode: 'A',
      serviceName: 'KTP-el & IKD',
      queueType: 'PRIORITAS',
      citizenName: 'Otniel Sangkei',
      citizenNik: '9111011111600004',
      citizenPhone: '082199887766',
      citizenDistrict: 'Arso Timur',
      counterAssigned: null,
      status: 'MENUNGGU',
      createdAt: formatTime(15),
      calledAt: null,
      servedAt: null,
      finishedAt: null,
      callCount: 0
    },

    // B series - KK & Pindah
    {
      id: 't-b-001',
      ticketNumber: 'B-001',
      serviceCategory: 'KK_PINDAH',
      serviceCode: 'B',
      serviceName: 'Kartu Keluarga & Pindah',
      queueType: 'REGULER',
      citizenName: 'Andreas Tafor',
      citizenNik: '9111041010890002',
      citizenDistrict: 'Senggi',
      counterAssigned: 2,
      status: 'SEDANG_DILAYANI',
      createdAt: formatTime(45),
      calledAt: formatTime(18),
      servedAt: formatTime(17),
      finishedAt: null,
      callCount: 1,
      officerNotes: 'Permohonan SKPWNI ke Kota Jayapura.'
    },
    {
      id: 't-b-002',
      ticketNumber: 'B-002',
      serviceCategory: 'KK_PINDAH',
      serviceCode: 'B',
      serviceName: 'Kartu Keluarga & Pindah',
      queueType: 'REGULER',
      citizenName: 'Sarah Ireeuw',
      citizenNik: '9111014502930005',
      citizenDistrict: 'Arso',
      counterAssigned: null,
      status: 'MENUNGGU',
      createdAt: formatTime(12),
      calledAt: null,
      servedAt: null,
      finishedAt: null,
      callCount: 0
    },

    // C series - Akta Capil
    {
      id: 't-c-001',
      ticketNumber: 'C-001',
      serviceCategory: 'AKTA_CAPIL',
      serviceCode: 'C',
      serviceName: 'Akta Pencatatan Sipil',
      queueType: 'REGULER',
      citizenName: 'Martha Tuamis',
      citizenNik: '9111016801990001',
      citizenDistrict: 'Mannem',
      counterAssigned: 3,
      status: 'DIPANGGIL',
      createdAt: formatTime(30),
      calledAt: formatTime(2),
      servedAt: null,
      finishedAt: null,
      callCount: 2,
      officerNotes: ''
    },
    {
      id: 't-c-002',
      ticketNumber: 'C-002',
      serviceCategory: 'AKTA_CAPIL',
      serviceCode: 'C',
      serviceName: 'Akta Pencatatan Sipil',
      queueType: 'REGULER',
      citizenName: 'Stefanus May',
      citizenNik: '9111050505960002',
      citizenDistrict: 'Web',
      counterAssigned: null,
      status: 'MENUNGGU',
      createdAt: formatTime(8),
      calledAt: null,
      servedAt: null,
      finishedAt: null,
      callCount: 0
    },

    // D series - KIA
    {
      id: 't-d-001',
      ticketNumber: 'D-001',
      serviceCategory: 'KIA_NIK',
      serviceCode: 'D',
      serviceName: 'KIA & Konsolidasi NIK',
      queueType: 'REGULER',
      citizenName: 'Yakob Felle',
      citizenNik: '9111011212150001',
      citizenDistrict: 'Skanto',
      counterAssigned: null,
      status: 'MENUNGGU',
      createdAt: formatTime(18),
      calledAt: null,
      servedAt: null,
      finishedAt: null,
      callCount: 0
    },

    // E series - Layanan Khusus
    {
      id: 't-e-001',
      ticketNumber: 'E-001',
      serviceCategory: 'LEGALISIR_KHUSUS',
      serviceCode: 'E',
      serviceName: 'Layanan Khusus & Legalisir',
      queueType: 'PRIORITAS',
      citizenName: 'Paulina Kereway',
      citizenNik: '9111065011780003',
      citizenDistrict: 'Towe',
      counterAssigned: null,
      status: 'MENUNGGU',
      createdAt: formatTime(10),
      calledAt: null,
      servedAt: null,
      finishedAt: null,
      callCount: 0
    }
  ];
}

export function loadTickets(): Ticket[] {
  try {
    const raw = localStorage.getItem(TICKETS_KEY);
    if (!raw) {
      const seed = getInitialSeedTickets();
      saveTickets(seed);
      return seed;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load tickets:', e);
    return getInitialSeedTickets();
  }
}

export function saveTickets(tickets: Ticket[]): void {
  try {
    localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
    window.dispatchEvent(new Event('dukcapil_storage_sync'));
  } catch (e) {
    console.error('Failed to save tickets:', e);
  }
}

export function loadCounters(): CounterInfo[] {
  try {
    const raw = localStorage.getItem(COUNTERS_KEY);
    if (!raw) {
      const counters = [...INITIAL_COUNTERS];
      // Sync initial active ticket to counters
      counters[0].currentTicketId = 't-a-003';
      counters[1].currentTicketId = 't-b-001';
      counters[2].currentTicketId = 't-c-001';
      saveCounters(counters);
      return counters;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load counters:', e);
    return INITIAL_COUNTERS;
  }
}

export function saveCounters(counters: CounterInfo[]): void {
  try {
    localStorage.setItem(COUNTERS_KEY, JSON.stringify(counters));
    window.dispatchEvent(new Event('dukcapil_storage_sync'));
  } catch (e) {
    console.error('Failed to save counters:', e);
  }
}

export function loadSettings(): SystemSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load settings:', e);
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: SystemSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event('dukcapil_storage_sync'));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}

export function loadCallLogs(): CallLogItem[] {
  try {
    const raw = localStorage.getItem(CALL_LOGS_KEY);
    if (!raw) {
      const initialLogs: CallLogItem[] = [
        {
          id: 'log-1',
          ticketNumber: 'A-003',
          serviceName: 'KTP-el & IKD',
          counterId: 1,
          counterName: 'Loket 1',
          timestamp: new Date(Date.now() - 22 * 60000).toISOString(),
          citizenName: 'Yunus Wenda'
        },
        {
          id: 'log-2',
          ticketNumber: 'B-001',
          serviceName: 'Kartu Keluarga & Pindah',
          counterId: 2,
          counterName: 'Loket 2',
          timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
          citizenName: 'Andreas Tafor'
        },
        {
          id: 'log-3',
          ticketNumber: 'C-001',
          serviceName: 'Akta Pencatatan Sipil',
          counterId: 3,
          counterName: 'Loket 3',
          timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
          citizenName: 'Martha Tuamis'
        }
      ];
      saveCallLogs(initialLogs);
      return initialLogs;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load logs:', e);
    return [];
  }
}

export function saveCallLogs(logs: CallLogItem[]): void {
  try {
    localStorage.setItem(CALL_LOGS_KEY, JSON.stringify(logs.slice(0, 100))); // keep latest 100
    window.dispatchEvent(new Event('dukcapil_storage_sync'));
  } catch (e) {
    console.error('Failed to save call logs:', e);
  }
}

export function generateNextTicketNumber(serviceCode: 'A' | 'B' | 'C' | 'D' | 'E', currentTickets: Ticket[]): string {
  const serviceTickets = currentTickets.filter(t => t.serviceCode === serviceCode);
  const nextNum = serviceTickets.length + 1;
  const padded = nextNum.toString().padStart(3, '0');
  return `${serviceCode}-${padded}`;
}

export function updateTicketInStorage(updatedTicket: Ticket): void {
  const list = loadTickets();
  const index = list.findIndex(t => t.id === updatedTicket.id);
  if (index !== -1) {
    list[index] = updatedTicket;
  } else {
    list.push(updatedTicket);
  }
  saveTickets(list);
}

export function deleteTicketFromStorage(ticketId: string): void {
  const list = loadTickets();
  const updated = list.filter(t => t.id !== ticketId);
  saveTickets(updated);

  // Clear from counter if active
  const counters = loadCounters();
  let counterChanged = false;
  counters.forEach(c => {
    if (c.currentTicketId === ticketId) {
      c.currentTicketId = null;
      counterChanged = true;
    }
  });
  if (counterChanged) {
    saveCounters(counters);
  }
}

export function updateCounterInStorage(updatedCounter: CounterInfo): void {
  const counters = loadCounters();
  const index = counters.findIndex(c => c.id === updatedCounter.id);
  if (index !== -1) {
    counters[index] = updatedCounter;
    saveCounters(counters);
  }
}

export function resetQueueData(): void {
  localStorage.removeItem(TICKETS_KEY);
  localStorage.removeItem(COUNTERS_KEY);
  localStorage.removeItem(CALL_LOGS_KEY);
  const counters = INITIAL_COUNTERS.map(c => ({ ...c, currentTicketId: null }));
  saveCounters(counters);
  saveTickets([]);
  saveCallLogs([]);
  window.dispatchEvent(new Event('dukcapil_storage_sync'));
}

export function restoreSampleQueueData(): void {
  const sampleTickets = getInitialSeedTickets();
  saveTickets(sampleTickets);
  const counters = [...INITIAL_COUNTERS];
  counters[0].currentTicketId = 't-a-003';
  counters[1].currentTicketId = 't-b-001';
  counters[2].currentTicketId = 't-c-001';
  saveCounters(counters);
  window.dispatchEvent(new Event('dukcapil_storage_sync'));
}
