import React, { useState } from 'react';
import { SERVICES_DATA } from '../data/servicesData';
import { 
  FileText, 
  CheckSquare, 
  Square, 
  Printer, 
  AlertCircle, 
  Clock, 
  CreditCard, 
  Users, 
  FileCheck, 
  Baby, 
  ShieldAlert,
  Info
} from 'lucide-react';
import { ServiceCategory } from '../types';

export const RequirementsView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('KTP_IKD');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const activeService = SERVICES_DATA.find(s => s.id === selectedCategory) || SERVICES_DATA[0];

  const toggleCheck = (itemKey: string) => {
    setCheckedItems(prev => ({ ...prev, [itemKey]: !prev[itemKey] }));
  };

  const handlePrintChecklist = () => {
    window.print();
  };

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'CreditCard':
        return <CreditCard className="w-5 h-5" />;
      case 'Users':
        return <Users className="w-5 h-5" />;
      case 'FileCheck':
        return <FileCheck className="w-5 h-5" />;
      case 'Baby':
        return <Baby className="w-5 h-5" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-64px)] bg-[#060d1e] py-8 px-4 sm:px-6 lg:px-8 text-slate-100 flex flex-col justify-between">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        
        {/* Banner Notice Header */}
        <div className="bg-[#0a1633]/80 text-white rounded-2xl p-6 border border-blue-900/50 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/30 flex items-center justify-center shrink-0">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 mb-1">
                <span>Panduan Dokumen & Persyaratan</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>Disdukcapil Keerom</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Persyaratan Berkas Pelayanan Adminduk
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Pastikan seluruh kelengkapan dokumen asli dan fotokopi telah disiapkan sebelum nomor antrian Anda dipanggil.
              </p>
            </div>
          </div>

          <button
            onClick={handlePrintChecklist}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-slate-950 text-xs font-bold rounded-xl transition shadow-sm shrink-0"
          >
            <Printer className="w-4 h-4 text-slate-950" />
            <span>Cetak Lembar Persyaratan</span>
          </button>
        </div>

        {/* Categories Selection Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {SERVICES_DATA.map((service) => {
            const isSelected = selectedCategory === service.id;
            return (
              <button
                key={service.id}
                onClick={() => setSelectedCategory(service.id)}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-md'
                    : 'bg-[#0a1633]/80 text-slate-200 border-blue-900/50 hover:bg-[#0e214d]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-xl ${
                    isSelected ? 'bg-slate-950 text-amber-400' : 'bg-[#060e20] text-amber-400 border border-blue-900/60'
                  }`}>
                    {getServiceIcon(service.iconName)}
                  </div>
                  <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-lg ${
                    isSelected ? 'bg-slate-900/10 text-slate-950' : 'text-amber-400'
                  }`}>
                    LOKET {service.defaultCounter}
                  </span>
                </div>
                <div>
                  <div className={`text-[11px] font-mono font-bold ${
                    isSelected ? 'text-slate-900' : 'text-amber-400'
                  }`}>
                    [{service.code}]
                  </div>
                  <div className="text-xs sm:text-sm font-bold line-clamp-2 mt-0.5">
                    {service.name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Service Detail & Checklist Card */}
        <div className="bg-[#0a1633]/80 rounded-2xl p-6 sm:p-8 border border-blue-900/50 shadow-sm space-y-6">
          <div className="border-b border-blue-900/40 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <span className="text-amber-400 font-bold font-mono">
                  Loket {activeService.defaultCounter} · [{activeService.code}]
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Estimasi Layanan: ~{activeService.estimatedMinutes} Menit
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mt-2">
                {activeService.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                {activeService.description}
              </p>
            </div>
          </div>

          {/* Interactive Checklist */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-amber-400" />
              Checklist Berkas & Dokumen yang Diperlukan:
            </h3>

            <div className="space-y-2.5">
              {activeService.requirements.map((req, index) => {
                const key = `${activeService.id}-${index}`;
                const isChecked = !!checkedItems[key];

                return (
                  <div
                    key={index}
                    onClick={() => toggleCheck(key)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex items-start gap-3 ${
                      isChecked
                        ? 'bg-[#060e20] border-amber-400 text-white shadow-sm'
                        : 'bg-[#060e20] border-blue-900/60 text-slate-200 hover:border-blue-800'
                    }`}
                  >
                    <div className="mt-0.5 text-amber-400 shrink-0">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 fill-amber-400 text-slate-950" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                    <div className="text-xs sm:text-sm font-medium leading-snug">
                      {req}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Official Notice */}
          <div className="bg-[#060e20] rounded-xl p-5 border border-blue-900/60 space-y-2">
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Ketentuan Pelayanan Dinas Dukcapil Kabupaten Keerom:</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
              <li>
                <strong>Bebas Biaya:</strong> Seluruh pengurusan administrasi kependudukan di Kabupaten Keerom adalah <strong className="text-amber-400 font-semibold">100% Bebas Biaya (Gratis)</strong>.
              </li>
              <li>
                <strong>Dokumen Barcode:</strong> Dokumen ber-barcode (KK, Akta Kelahiran/Kematian) sudah ditandatangani secara elektronik dan sah tanpa perlu legalisir stempel basah.
              </li>
              <li>
                <strong>Pelayanan Khusus Wilayah Pedalaman:</strong> Warga dari Distrik Senggi, Waris, Web, Towe, Yafi, atau Kaisenar yang membutuhkan pendampingan berkas dapat langsung menuju Loket 5.
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};
