import React, { useRef } from 'react';
import { Ticket, SystemSettings } from '../types';
import { QRCodeSvg } from './QRCodeSvg';
import { Printer, CheckCircle, Clock, X, AlertCircle, Sparkles } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Top Header */}
        <div className="bg-[#0a1736] text-white px-5 py-4 flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center space-x-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base tracking-wide text-white">Slip Antrian Pelayanan</h3>
          </div>
          <button
            id="close-ticket-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#07132c] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Ticket Receipt Card */}
        <div className="p-6 bg-[#071126] flex flex-col items-center">
          <div
            ref={printRef}
            id="printable-ticket"
            className="w-full max-w-xs bg-white p-5 rounded-xl border border-dashed border-slate-300 shadow-xl text-slate-800 font-mono text-center relative"
          >
            {/* Cutout notch effect */}
            <div className="absolute -left-3 top-1/2 w-6 h-6 bg-[#071126] rounded-full border-r border-slate-300 transform -translate-y-1/2" />
            <div className="absolute -right-3 top-1/2 w-6 h-6 bg-[#071126] rounded-full border-l border-slate-300 transform -translate-y-1/2" />

            {/* Receipt Header */}
            <div className="border-b border-dashed border-slate-300 pb-3">
              <div className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
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
              <div className="text-5xl font-extrabold tracking-tight text-[#0a1736] my-1 font-sans">
                {ticket.ticketNumber}
              </div>
              {ticket.queueType === 'PRIORITAS' ? (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 mt-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold font-sans border border-amber-300">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  JALUR PRIORITAS KHUSUS
                </div>
              ) : (
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-sans">
                  JALUR REGULER
                </span>
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
                  <span className="font-mono text-slate-800">{ticket.citizenNik}</span>
                </div>
              )}
              {ticket.citizenPhone && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">No. HP:</span>
                  <span className="font-mono text-slate-800 font-semibold flex items-center gap-1">
                    {ticket.citizenPhone}
                    <span className="text-[9px] bg-blue-100 text-blue-900 px-1 py-0.2 rounded font-sans font-bold">
                      SMS AKTIF
                    </span>
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
                <span className="font-medium text-slate-700">{formattedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tanggal:</span>
                <span className="text-slate-700">{formattedDate}</span>
              </div>
            </div>

            {/* Queue Info */}
            <div className="py-3 bg-amber-50 rounded-lg my-2 px-2 text-center font-sans border border-amber-200/60">
              <div className="text-xs text-slate-900 font-medium">
                Antrian di depan Anda:{' '}
                <span className="font-bold text-amber-700 text-sm">{queueAheadCount} orang</span>
              </div>
              <div className="text-[11px] text-slate-700 flex items-center justify-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-amber-600" />
                Est. Tunggu: ~{estimatedWaitMin} menit
              </div>
            </div>

            {/* QR Code */}
            <div className="pt-2 flex flex-col items-center">
              <QRCodeSvg value={`KEEROM-DUKCAPIL-${ticket.ticketNumber}-${ticket.createdAt}`} size={96} />
              <div className="text-[10px] text-slate-400 mt-1.5 font-mono">
                Scan verifikasi tiket di loket
              </div>
            </div>

            {/* Footer Notice */}
            <div className="mt-3 pt-2 border-t border-dashed border-slate-300 text-[10px] text-slate-500 font-sans leading-tight">
              *Harap perhatikan layar monitor dan panggilan suara.
              <br />
              Pelayanan Adminduk <span className="font-bold text-[#0a1736]">GRATIS</span> (Tanpa Pungutan).
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="p-4 bg-[#0a1736] border-t border-blue-900 flex items-center justify-end gap-3">
          <button
            id="print-cancel-btn"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-[#07132c] rounded-lg transition"
          >
            Selesai
          </button>
          <button
            id="print-action-btn"
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-black text-slate-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg shadow-md shadow-amber-400/20 transition"
          >
            <Printer className="w-4 h-4 text-slate-950" />
            Cetak Tiket Fisik
          </button>
        </div>
      </div>
    </div>
  );
};
