import React, { useState } from 'react';
import { SERVICES_DATA } from '../data/servicesData';
import { 
  FileText, 
  CheckSquare, 
  Square, 
  Printer, 
  HelpCircle, 
  AlertCircle, 
  Clock, 
  CreditCard, 
  Users, 
  FileCheck, 
  Baby, 
  ShieldAlert,
  Download,
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
    <div className="w-full min-h-[calc(100vh-130px)] bg-[#071126] py-6 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Banner Notice */}
        <div className="bg-gradient-to-r from-[#0a1736] via-[#0f2352] to-[#0a1736] text-white rounded-3xl p-6 shadow-xl border-2 border-amber-400/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-950 rounded-2xl text-amber-400 border border-amber-400/40">
              <Info className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">
                Panduan Persyaratan Dokumen Kependudukan
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Pastikan berkas dokumen Anda lengkap sebelum dipanggil ke loket untuk mempercepat proses pelayanan.
              </p>
            </div>
          </div>

          <button
            onClick={handlePrintChecklist}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 text-xs font-black rounded-xl transition shadow-md shadow-amber-400/20 shrink-0"
          >
            <Printer className="w-4 h-4 text-slate-950" />
            <span>Cetak Lembar Checklist</span>
          </button>
        </div>

        {/* Categories Selection Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {SERVICES_DATA.map((service) => {
            const isSelected = selectedCategory === service.id;
            return (
              <button
                key={service.id}
                onClick={() => setSelectedCategory(service.id)}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-lg shadow-amber-400/20'
                    : 'bg-[#0a1736] text-slate-200 border-blue-900 hover:bg-[#0e214d]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-xl ${
                    isSelected ? 'bg-slate-950 text-amber-400' : 'bg-blue-950 text-amber-400 border border-blue-800'
                  }`}>
                    {getServiceIcon(service.iconName)}
                  </div>
                  <span className={`font-mono text-xs font-black px-2 py-0.5 rounded ${
                    isSelected ? 'bg-slate-900 text-amber-300' : 'bg-[#07132c] text-amber-400 border border-blue-800'
                  }`}>
                    LOKET {service.defaultCounter}
                  </span>
                </div>
                <div>
                  <div className={`text-[11px] uppercase font-bold ${
                    isSelected ? 'text-slate-900' : 'text-amber-400'
                  }`}>
                    Kode {service.code}
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold line-clamp-2">
                    {service.name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Service Detail & Checklist Card */}
        <div className="bg-[#0a1736] rounded-3xl p-6 sm:p-8 border-2 border-blue-900 shadow-xl space-y-6">
          <div className="border-b border-blue-900/80 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-950 text-amber-400 border border-amber-400/40">
                  Loket {activeService.defaultCounter} • Kode [{activeService.code}]
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Estimasi Layanan: ~{activeService.estimatedMinutes} Menit
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-2">
                {activeService.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                {activeService.description}
              </p>
            </div>
          </div>

          {/* Interactive Checklist */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-amber-400" />
              Checklist Berkas & Persyaratan yang Harus Dibawa:
            </h4>

            <div className="space-y-2.5">
              {activeService.requirements.map((req, index) => {
                const key = `${activeService.id}-${index}`;
                const isChecked = !!checkedItems[key];

                return (
                  <div
                    key={index}
                    onClick={() => toggleCheck(key)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                      isChecked
                        ? 'bg-[#0f2a58] border-amber-400 text-white shadow-sm'
                        : 'bg-[#07132c] border-blue-900 text-slate-200 hover:bg-[#0e214d]'
                    }`}
                  >
                    <div className="mt-0.5 text-amber-400">
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 fill-amber-400 text-slate-950" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-500" />
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

          {/* Important Rules & Tips for Keerom Citizens */}
          <div className="bg-[#07132c] rounded-2xl p-5 border border-amber-400/30 space-y-2">
            <h5 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Catatan Penting Pelayanan Dukcapil Keerom:
            </h5>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
              <li>
                <strong>Bebas Biaya:</strong> Seluruh pelayanan administrasi kependudukan di Kabupaten Keerom adalah <strong className="text-amber-400">100% GRATIS</strong>.
              </li>
              <li>
                <strong>TTE / Barcode:</strong> Dokumen yang telah bertanda tangan elektronik (KK dan Akta dengan QR Code) sah berlaku dan tidak memerlukan legalisir.
              </li>
              <li>
                <strong>Layanan Distrik Pedalaman:</strong> Untuk warga dari Distrik Senggi, Waris, Web, Towe, Yafi, atau Kaisenar yang mengalami kendala berkas, silakan melapor ke Loket 5 (Layanan Khusus).
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
