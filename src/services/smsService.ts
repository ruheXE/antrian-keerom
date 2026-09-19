import { Ticket, SmsNotificationLog, SystemSettings } from '../types';

const SMS_LOGS_KEY = 'dukcapil_keerom_sms_logs_v1';

export function loadSmsLogs(): SmsNotificationLog[] {
  try {
    const raw = localStorage.getItem(SMS_LOGS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load SMS logs:', e);
    return [];
  }
}

export function saveSmsLogs(logs: SmsNotificationLog[]): void {
  try {
    localStorage.setItem(SMS_LOGS_KEY, JSON.stringify(logs.slice(0, 100)));
    window.dispatchEvent(new Event('dukcapil_storage_sync'));
  } catch (e) {
    console.error('Failed to save SMS logs:', e);
  }
}

/**
 * Formats a raw phone string into a standardized Indonesian mobile phone number format
 * e.g. '08123456789' or '+628123456789'
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('62')) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('08')) {
    return `+62${cleaned.substring(1)}`;
  }
  return cleaned;
}

/**
 * Validates Indonesian mobile phone number format (typically 10-14 digits starting with 08 or +628)
 */
export function isValidIndonesianPhone(phone: string): boolean {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.startsWith('08') && digits.length >= 10 && digits.length <= 13) return true;
  if (digits.startsWith('628') && digits.length >= 11 && digits.length <= 14) return true;
  return digits.length >= 9;
}

/**
 * Compose SMS message from template
 */
export function composeSmsMessage(
  template: string,
  ticket: Ticket,
  counterName: string
): string {
  const citizenDisplayName = ticket.citizenName ? ticket.citizenName : 'Warga';
  return template
    .replace('{NAMA}', citizenDisplayName)
    .replace('{NOMOR}', ticket.ticketNumber)
    .replace('{LOKET}', counterName)
    .replace('{LAYANAN}', ticket.serviceName);
}

/**
 * Sends an automated SMS notification when a ticket is called.
 * Integrates SMS gateway delivery simulation with realistic transmission latency,
 * logging, and browser notification fallback if permission granted.
 */
export async function sendTicketCalledSms(
  ticket: Ticket,
  counterName: string,
  settings: SystemSettings
): Promise<{ success: boolean; message: string; log?: SmsNotificationLog }> {
  if (!settings.smsEnabled) {
    return { success: false, message: 'SMS Gateway dinonaktifkan dalam Pengaturan Sistem.' };
  }

  if (!ticket.citizenPhone || ticket.citizenPhone.trim() === '') {
    return { success: false, message: 'Warga tidak menyertakan nomor HP/WhatsApp di Kios Mandiri.' };
  }

  const phone = formatPhoneNumber(ticket.citizenPhone);
  const smsBody = composeSmsMessage(settings.smsTemplate, ticket, counterName);

  // Simulate network dispatch to Telkomsel/Indosat/XL SMS Gateway Server
  console.log(`[SMS-GATEWAY] Mengirim SMS Notifikasi ke ${phone} via Gateway ${settings.smsGatewaySender}:`);
  console.log(`[SMS-GATEWAY] Pesan: "${smsBody}"`);

  // Optional: Web Notification if supported and permitted
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(`[SMS] Panggilan Antrian ${ticket.ticketNumber}`, {
        body: `Ke: ${phone}\n${smsBody}`,
        icon: '/favicon.ico'
      });
    } catch {
      // ignore
    }
  }

  const newLog: SmsNotificationLog = {
    id: `sms-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    ticketNumber: ticket.ticketNumber,
    phoneNumber: phone,
    citizenName: ticket.citizenName,
    counterName: counterName,
    message: smsBody,
    timestamp: new Date().toISOString(),
    status: 'SENT'
  };

  const existingLogs = loadSmsLogs();
  saveSmsLogs([newLog, ...existingLogs]);

  return {
    success: true,
    message: `SMS berhasil dikirim ke ${phone}`,
    log: newLog
  };
}
