import React, { useState } from 'react';
import { ServiceDefinition, QueueType, KEEROM_DISTRICTS, Ticket, SystemSettings } from '../types';
import { SERVICES_DATA } from '../data/servicesData';
import { 
  CreditCard, 
  Users, 
  FileCheck, 
  Baby, 
  ShieldAlert, 
  Sparkles, 
  Clock, 
  Printer, 
  HelpCircle,
  User,
  MapPin,
  FileText,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Phone,
  MessageSquare
} from 'lucide-react';
import { KeeromLogo } from './KeeromLogo';

interface KioskViewProps {
  tickets: Ticket[];
  onTakeTicket: (ticketData: {
    serviceCategory: ServiceDefinition['id'];
    serviceCode: ServiceDefinition['code'];
    serviceName: string;
    queueType: QueueType;
    citizenName?: string;
    citizenNik?: string;
    citizenPhone?: string;
    citizenDistrict?: string;
  }) => Ticket;
  settings: SystemSettings;
}

export const KioskView: React.FC<KioskViewProps> = ({
  tickets,
  onTakeTicket,
  settings,
}) => {
  const [selectedService, setSelectedService] = useState<ServiceDefinition | null>(null);
  const [queueType, setQueueType] = useState<QueueType>('REGULER');
  const [citizenName, setCitizenName] = useState('');
  const [citizenNik, setCitizenNik] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [citizenDistrict, setCitizenDistrict] = useState('Arso');
  const [isExpandedForm, setIsExpandedForm] = useState(false);
  const [lastGeneratedTicket, setLastGeneratedTicket] = useState<Ticket | null>(null);

  // Icon mapping
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'CreditCard':
        return <CreditCard className="w-8 h-8" />;
      case 'Users':
        return <Users className="w-8 h-8" />;
      case 'FileCheck':
        return <FileCheck className="w-8 h-8" />;
      case 'Baby':
        return <Baby className="w-8 h-8" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-8 h-8" />;
      default:
        return <FileText className="w-8 h-8" />;
    }
  };

  const handleQuickTake = (service: ServiceDefinition) => {
    const newTicket = onTakeTicket({
      serviceCategory: service.id,
      serviceCode: service.code,
      serviceName: service.name,
      queueType: queueType,
      citizenName: citizenName.trim() || undefined,
      citizenNik: citizenNik.trim() || undefined,
      citizenPhone: citizenPhone.trim() || undefined,
      citizenDistrict: citizenDistrict,
    });

    setLastGeneratedTicket(newTicket);
    // Reset form fields
    setCitizenName('');
    setCitizenNik('');
    setCitizenPhone('');
    setQueueType('REGULER');
    setSelectedService(null);
    setIsExpandedForm(false);
  };

  const waitingCountForService = (serviceCode: string) => {
    return tickets.filter(t => t.serviceCode === serviceCode && t.status === 'MENUNGGU').length;
  };

  return (
    <div className="w-full min-h-[calc(100vh-130px)] bg-[#071126] py-6 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header Card in Navy & Yellow */}
        <div className="bg-[#0a1736] rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-blue-900/80 text-center relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center">
            <KeeromLogo size="lg" className="mb-3" />
            <span className="text-xs uppercase font-black tracking-wider text-amber-400 bg-blue-950 px-3 py-1 rounded-full border border-amber-400/40 shadow-xs">
              MESIN ANJUNGAN MANDIRI • KIOS TIKET RESMI
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">
              Silakan Pilih Layanan yang Anda Butuhkan
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Sentuh atau klik tombol jenis pelayanan di bawah untuk mencetak nomor antrian Anda. Seluruh pelayanan Disdukcapil Keerom <strong className="text-amber-400 font-bold">100% BEBAS BIAYA (GRATIS)</strong>.
            </p>
          </div>

          {/* Priority Toggle & Optional Bio data bar */}
          <div className="mt-6 pt-5 border-t border-blue-900/60 flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center bg-[#07132c] p-1 rounded-2xl border border-blue-900">
              <button
                id="kiosk-type-reguler"
                type="button"
                onClick={() => setQueueType('REGULER')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                  queueType === 'REGULER'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>Antrian Reguler</span>
              </button>

              <button
                id="kiosk-type-prioritas"
                type="button"
                onClick={() => setQueueType('PRIORITAS')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
                  queueType === 'PRIORITAS'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'text-slate-300 hover:text-amber-400'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Jalur Prioritas (Lansia / Hamil / Disabilitas)</span>
              </button>
            </div>

            <button
              id="kiosk-toggle-biodata-btn"
              type="button"
              onClick={() => setIsExpandedForm(!isExpandedForm)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition flex items-center gap-1.5 ${
                isExpandedForm
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                  : 'bg-[#0e214d] hover:bg-[#12285a] text-slate-200 border-blue-900'
              }`}
            >
              <User className="w-4 h-4 text-amber-400" />
              <span>{isExpandedForm ? 'Tutup Formulir Biodata' : '+ Biodata & Notifikasi SMS (Opsional)'}</span>
            </button>
          </div>

          {/* Optional Biodata Form */}
          {isExpandedForm && (
            <div className="mt-5 p-4 bg-[#07132c] rounded-2xl border border-blue-900 text-left max-w-3xl mx-auto space-y-3 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Warga (Opsional)
                  </label>
                  <input
                    id="kiosk-input-name"
                    type="text"
                    placeholder="Contoh: Dominggus"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 bg-[#0a1736] rounded-xl border border-blue-900 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    NIK 16 Digit (Opsional)
                  </label>
                  <input
                    id="kiosk-input-nik"
                    type="text"
                    maxLength={16}
                    placeholder="911101xxxxxx0001"
                    value={citizenNik}
                    onChange={(e) => setCitizenNik(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-xs sm:text-sm px-3 py-2 bg-[#0a1736] rounded-xl border border-blue-900 text-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-400" />
                      No. HP/WA (SMS Notif)
                    </span>
                  </label>
                  <input
                    id="kiosk-input-phone"
                    type="tel"
                    placeholder="Contoh: 081234567890"
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value.replace(/[^0-9+]/g, ''))}
                    className="w-full text-xs sm:text-sm px-3 py-2 bg-[#0a1736] rounded-xl border border-blue-900 text-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Distrik Asal (Kab. Keerom)
                  </label>
                  <select
                    id="kiosk-select-district"
                    value={citizenDistrict}
                    onChange={(e) => setCitizenDistrict(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 bg-[#0a1736] rounded-xl border border-blue-900 text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {KEEROM_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        Distrik {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SMS Notification Banner */}
              <div className="flex items-center gap-2 p-2.5 bg-blue-950/80 border border-blue-800 rounded-xl text-amber-200 text-xs">
                <MessageSquare className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong className="text-white">Notifikasi SMS Otomatis:</strong> Masukkan nomor ponsel Anda untuk menerima SMS pemberitahuan instan saat nomor antrian Anda dipanggil di loket.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Priority Banner Info if selected */}
        {queueType === 'PRIORITAS' && (
          <div className="bg-amber-950/30 border border-amber-400/60 p-4 rounded-2xl flex items-center gap-3 text-amber-200 shadow-md">
            <Sparkles className="w-6 h-6 text-amber-400 shrink-0" />
            <div className="text-xs sm:text-sm">
              <strong className="font-bold text-amber-300">Mode Prioritas Aktif:</strong> Tiket Anda akan diberi tanda prioritas khusus untuk lansia (di atas 60 tahun), ibu hamil/menyusui, atau penyandang disabilitas.
            </div>
          </div>
        )}

        {/* Service Options Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES_DATA.map((service) => {
            const waiting = waitingCountForService(service.code);

            return (
              <div
                key={service.id}
                className="bg-[#0a1736] rounded-3xl p-6 border border-blue-900/80 shadow-lg hover:shadow-2xl hover:border-amber-400/70 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Top Code Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0c1a38] to-[#12285a] border-2 border-amber-400/50 text-amber-400 flex items-center justify-center font-black text-2xl shadow-md group-hover:scale-105 transition-transform">
                      {service.code}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                        LOKET {service.defaultCounter}
                      </span>
                      <h3 className="text-base font-extrabold text-white leading-snug group-hover:text-amber-300 transition-colors">
                        {service.name}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Subtitle / Description */}
                <p className="text-xs text-slate-300 mb-5 leading-relaxed line-clamp-2">
                  {service.subtitle}
                </p>

                {/* Wait info and action button */}
                <div className="pt-4 border-t border-blue-900/60 flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-slate-400 font-medium">Antrian menunggu:</span>
                    <span className="text-sm font-black text-amber-400 font-mono">
                      {waiting} orang
                    </span>
                  </div>

                  <button
                    id={`kiosk-take-btn-${service.code.toLowerCase()}`}
                    type="button"
                    onClick={() => handleQuickTake(service)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 text-xs sm:text-sm font-black rounded-xl shadow-md shadow-amber-400/20 hover:shadow-lg transition-all active:scale-95"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Ambil Tiket {service.code}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Help Notice */}
        <div className="bg-[#0c1a38] text-white p-5 rounded-3xl border border-blue-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                Butuh Bantuan Perekaman atau Bingung Dokumen Syarat?
              </h4>
              <p className="text-xs text-slate-300">
                Silakan tanyakan kepada Petugas Resepsionis / Meja Informasi di dekat pintu masuk atau ambil tiket Loket 5 (Layanan Khusus).
              </p>
            </div>
          </div>

          <div className="text-xs font-mono bg-[#07132c] px-3.5 py-2 rounded-xl text-amber-400 border border-blue-900 shrink-0 font-bold">
            Jam Layanan: 08.00 - 15.00 WIT
          </div>
        </div>
      </div>
    </div>
  );
};
