import React, { useState } from 'react';
import { ServiceDefinition, QueueType, KEEROM_DISTRICTS, Ticket, SystemSettings } from '../types';
import { SERVICES_DATA } from '../data/servicesData';
import { 
  CreditCard, 
  Users, 
  FileCheck, 
  Baby, 
  ShieldAlert, 
  Printer, 
  HelpCircle,
  User,
  Phone,
  MessageSquare,
  ChevronDown,
  Check
} from 'lucide-react';
import { KeeromLogo } from './KeeromLogo';
import { GisaLogo } from './GisaLogo';

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
}) => {
  const [queueType, setQueueType] = useState<QueueType>('REGULER');
  const [citizenName, setCitizenName] = useState('');
  const [citizenNik, setCitizenNik] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [citizenDistrict, setCitizenDistrict] = useState('Arso');
  const [isExpandedForm, setIsExpandedForm] = useState(false);

  const handleQuickTake = (service: ServiceDefinition) => {
    onTakeTicket({
      serviceCategory: service.id,
      serviceCode: service.code,
      serviceName: service.name,
      queueType: queueType,
      citizenName: citizenName.trim() || undefined,
      citizenNik: citizenNik.trim() || undefined,
      citizenPhone: citizenPhone.trim() || undefined,
      citizenDistrict: citizenDistrict,
    });

    setCitizenName('');
    setCitizenNik('');
    setCitizenPhone('');
    setQueueType('REGULER');
    setIsExpandedForm(false);
  };

  const waitingCountForService = (serviceCode: string) => {
    return tickets.filter(t => t.serviceCode === serviceCode && t.status === 'MENUNGGU').length;
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#060d1e] py-8 px-4 sm:px-6 lg:px-8 text-slate-100 flex flex-col justify-between">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        
        {/* Kiosk Hero Header */}
        <div className="bg-[#0a1633]/70 rounded-3xl p-6 sm:p-8 border border-blue-900/50 text-center relative overflow-hidden backdrop-blur-sm">
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex items-center justify-center gap-4 mb-3">
              <KeeromLogo size="lg" />
              <div className="h-10 w-px bg-blue-900/60" />
              <GisaLogo size="sm" />
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
              <span>Anjungan Mandiri Warga</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Disdukcapil Kabupaten Keerom</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight [text-wrap:balance]">
              Silakan Pilih Layanan yang Anda Butuhkan
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1.5 leading-relaxed">
              Sentuh tombol jenis pelayanan di bawah untuk mengambil nomor antrian. Seluruh pelayanan administrasi kependudukan <strong className="text-amber-400 font-semibold">100% Bebas Biaya (Gratis)</strong>.
            </p>
          </div>

          {/* Interactive Filter Tabs: Queue Type Selector & Biodata Toggle */}
          <div className="mt-6 pt-5 border-t border-blue-900/40 flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center p-1 bg-[#060e20] rounded-xl border border-blue-900/60">
              <button
                id="kiosk-type-reguler"
                type="button"
                onClick={() => setQueueType('REGULER')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                  queueType === 'REGULER'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Antrian Reguler
              </button>

              <button
                id="kiosk-type-prioritas"
                type="button"
                onClick={() => setQueueType('PRIORITAS')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                  queueType === 'PRIORITAS'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-amber-300'
                }`}
              >
                Jalur Prioritas (Lansia / Hamil / Difabel)
              </button>
            </div>

            <button
              id="kiosk-toggle-biodata-btn"
              type="button"
              onClick={() => setIsExpandedForm(!isExpandedForm)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition flex items-center gap-2 border ${
                isExpandedForm
                  ? 'bg-amber-400/10 text-amber-300 border-amber-400/40'
                  : 'bg-[#060e20] hover:bg-[#0a1633] text-slate-300 border-blue-900/60'
              }`}
            >
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>{isExpandedForm ? 'Tutup Formulir Tambahan' : 'Data Pemohon & Notifikasi SMS (Opsional)'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpandedForm ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Optional Expanded Form */}
          {isExpandedForm && (
            <div className="mt-5 p-5 bg-[#060e20] rounded-2xl border border-blue-900/60 text-left max-w-3xl mx-auto space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Nama Pemohon
                  </label>
                  <input
                    id="kiosk-input-name"
                    type="text"
                    placeholder="Nama Lengkap"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-[#0a1633] rounded-xl border border-blue-900/80 text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    NIK 16 Digit
                  </label>
                  <input
                    id="kiosk-input-nik"
                    type="text"
                    maxLength={16}
                    placeholder="9111xxxxxxxxxxxx"
                    value={citizenNik}
                    onChange={(e) => setCitizenNik(e.target.value.replace(/\D/g, ''))}
                    className="w-full text-xs px-3.5 py-2.5 bg-[#0a1633] rounded-xl border border-blue-900/80 text-white focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>No. Ponsel (SMS)</span>
                  </label>
                  <input
                    id="kiosk-input-phone"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value.replace(/[^0-9+]/g, ''))}
                    className="w-full text-xs px-3.5 py-2.5 bg-[#0a1633] rounded-xl border border-blue-900/80 text-white focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Distrik Asal (Keerom)
                  </label>
                  <select
                    id="kiosk-select-district"
                    value={citizenDistrict}
                    onChange={(e) => setCitizenDistrict(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-[#0a1633] rounded-xl border border-blue-900/80 text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                  >
                    {KEEROM_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        Distrik {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>SMS otomatis akan dikirim ke ponsel Anda saat nomor antrian mulai dipanggil petugas loket.</span>
              </div>
            </div>
          )}
        </div>

        {/* Priority Lane Active Notice */}
        {queueType === 'PRIORITAS' && (
          <div className="bg-[#0a1633] border border-amber-400/50 p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm text-slate-200">
            <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            <div>
              <strong className="text-amber-400 font-bold">Jalur Prioritas Aktif:</strong> Nomor tiket Anda akan diprioritaskan bagi lansia (di atas 60 tahun), ibu hamil/menyusui, atau penyandang disabilitas.
            </div>
          </div>
        )}

        {/* 5 Service Option Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES_DATA.map((service) => {
            const waiting = waitingCountForService(service.code);

            return (
              <div
                key={service.id}
                className="bg-[#0a1633]/80 rounded-2xl p-6 border border-blue-900/50 hover:border-amber-400/60 shadow-sm transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-xs font-bold text-amber-400 tracking-wider">
                      LOKET {service.defaultCounter}
                    </span>
                    <span className="font-mono text-lg font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20">
                      {service.code}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                    {service.name}
                  </h3>
                  
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed line-clamp-2">
                    {service.subtitle}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-blue-900/40 flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-400">
                    <div>Antrian saat ini:</div>
                    <div className="font-mono font-bold text-amber-400 text-sm tabular-nums">
                      {waiting} warga
                    </div>
                  </div>

                  <button
                    id={`kiosk-take-btn-${service.code.toLowerCase()}`}
                    type="button"
                    onClick={() => handleQuickTake(service)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 text-xs font-bold rounded-xl transition shadow-sm"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Ambil Tiket {service.code}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Help Information */}
        <div className="bg-[#0a1633]/60 rounded-2xl p-4 sm:p-5 border border-blue-900/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/30 flex items-center justify-center shrink-0">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white">Butuh bantuan atau panduan berkas?</div>
              <div className="text-slate-400">Tanyakan kepada petugas di meja resepsionis atau ambil tiket Loket 5 (Layanan Khusus).</div>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-400 shrink-0">
            Jam Layanan: <span className="text-amber-400 font-semibold">08.00 - 15.00 WIT</span>
          </div>
        </div>

      </div>
    </div>
  );
};
