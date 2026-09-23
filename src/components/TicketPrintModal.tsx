import React, { useRef } from 'react';
import { Ticket, SystemSettings } from '../types';
import { QRCodeSvg } from './QRCodeSvg';
import { Printer, Clock, X, Check } from 'lucide-react';
import { SERVICES_DATA } from '../data/servicesData';

interface TicketPrintModalProps {
  ticket: Ticket;
  settings: SystemSettings;
  queueAheadCount: number;
  onClose: () => void;
}

export const TicketPrintModal: React.FC<TicketPrintModalProps> = ({
  ticket,
  settings,
  queueAheadCount,
  onClose
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const service = SERVICES_DATA.find(s => s.id === ticket.serviceCategory);

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(ticket.createdAt).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedTime = new Date(ticket.createdAt).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  });

  const estimatedWaitMin = Math.max(2, queueAheadCount * (service?.estimatedMinutes || 10));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-sm bg-[#0a1633] rounded-2xl shadow-2xl border border-blue-900/60 overflow-hidden my-6">
        
        {/* Top Header */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-blue-900/50">
          <div className="flex items-center space-x-2">
            <Printer className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm tracking-wide text-white">Pratinjau Slip Antrian</h3>
          </div>
          <button
            id="close-ticket-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#060e20] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Ticket Receipt Card */}
        <div className="p-5 bg-[#060d1e] flex flex-col items-center">
          <div
            ref={printRef}
            id="printable-ticket"
            className="w-full bg-white p-6 rounded-xl border border-dashed border-slate-300 shadow-lg text-slate-800 font-mono text-center relative"
          >
            {/* Cutout notch effect */}
            <div className="absolute -left-2.5 top-1/2 w-5 h-5 bg-[#060d1e] rounded-full border-r border-slate-300 transform -translate-y-1/2" />
            <div className="absolute -right-2.5 top-1/2 w-5 h-5 bg-[#060d1e] rounded-full border-l border-slate-300 transform -translate-y-1/2" />

            {/* Receipt Header */}
            <div className="border-b border-dashed border-slate-300 pb-3">
              <img
                src="/Lambang_Kabupaten_Keerom2.png"
                alt="Lambang Kabupaten Keerom"
                className="w-10 h-auto mx-auto mb-1 object-contain"
              />
              <div className="text-[11px] font-bold tracking-wider text-slate-600 uppercase">
                {settings.officeRegency}
              </div>
              <div className="text-xs font-black tracking-tight text-slate-900 uppercase mt-0.5">
                {settings.officeName}
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-sans">
                {settings.officeAddress}
              </div>
            </div>

            {/* Ticket Badge & Number */}
            <div className="py-4 border-b border-dashed border-slate-300">
              <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-1">
                NOMOR ANTRIAN ANDA
              </div>
              <div className="text-5xl font-extrabold tracking-tight text-[#0a1633] my-1 font-mono tabular-nums">
                {ticket.ticketNumber}
              </div>
              {ticket.queueType === 'PRIORITAS' ? (
                <div className="text-xs font-bold text-amber-700 mt-1">
                  ● JALUR PRIORITAS KHUSUS
                </div>
              ) : (
                <div className="text-[11px] font-semibold text-slate-600 mt-1">
                  JALUR REGULER
                </div>
              )}
              <div className="text-xs font-bold text-slate-800 mt-2 font-sans">
                {ticket.serviceName}
              </div>
            </div>

            {/* Citizen Details */}
            <div className="py-3 text-left text-[11px] font-sans border-b border-dashed border-slate-300 space-y-1 text-slate-600">
              {ticket.citizenName && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Nama:</span>
                  <span className="font-semibold text-slate-800">{ticket.citizenName}</span>
                </div>
              )}
              {ticket.citizenNik && (
                <div className="flex justify-between">
                  <span className="text-slate-400">NIK:</span>
                  <span className="font-mono text-slate-800 tabular-nums">{ticket.citizenNik}</span>
                </div>
              )}
              {ticket.citizenPhone && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">No. Ponsel:</span>
                  <span className="font-mono text-slate-800 font-semibold tabular-nums">
                    {ticket.citizenPhone}
                  </span>
                </div>
              )}
              {ticket.citizenDistrict && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Distrik:</span>
                  <span className="font-medium text-slate-800">{ticket.citizenDistrict}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Waktu Ambil:</span>
                <span className="font-mono text-slate-700 tabular-nums">{formattedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tanggal:</span>
                <span className="text-slate-700">{formattedDate}</span>
              </div>
            </div>

            {/* Queue Info */}
            <div className="py-2.5 bg-slate-50 rounded-lg my-2.5 px-2 text-center font-sans border border-slate-200">
              <div className="text-xs text-slate-900 font-medium">
                Antrian di depan Anda:{' '}
                <span className="font-bold text-[#0a1633] font-mono tabular-nums">{queueAheadCount} orang</span>
              </div>
              <div className="text-[11px] text-slate-600 flex items-center justify-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>Est. Tunggu: ~{estimatedWaitMin} menit</span>
              </div>
            </div>

            {/* QR Code */}
            <div className="pt-2 flex flex-col items-center">
              <QRCodeSvg value={`KEEROM-DUKCAPIL-${ticket.ticketNumber}-${ticket.createdAt}`} size={96} />
              <div className="text-[10px] text-slate-400 mt-1 font-mono">
                Scan verifikasi tiket di loket
              </div>
            </div>

            {/* Footer Notice */}
            <div className="mt-3 pt-2 border-t border-dashed border-slate-300 text-[10px] text-slate-500 font-sans leading-tight">
              *Harap perhatikan layar monitor dan panggilan suara.
              <br />
              Pelayanan Adminduk <strong className="text-slate-900 font-bold">100% BEBAS BIAYA (GRATIS)</strong>.
              <div className="mt-2 pt-1 border-t border-dotted border-slate-200 text-[9px] text-slate-400">
                Sistem Antrian Terpadu Disdukcapil Keerom
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 bg-[#0a1633] border-t border-blue-900/50 flex items-center justify-end gap-2.5">
          <button
            id="print-cancel-btn"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition"
          >
            Tutup
          </button>
          <button
            id="print-action-btn"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] rounded-xl transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5 text-slate-950" />
            <span>Cetak Tiket Fisik</span>
          </button>
        </div>

      </div>
    </div>
  );
};
