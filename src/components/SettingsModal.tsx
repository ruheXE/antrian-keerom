import React, { useState } from 'react';
import { SystemSettings } from '../types';
import { announceTicket, playChime } from '../services/audioService';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Settings, 
  Save, 
  RotateCcw, 
  Megaphone, 
  Building,
  Check,
  MessageSquare,
  Phone,
  KeyRound,
  Lock,
  ShieldCheck,
  Headphones,
  Tv,
  Ticket,
  Download
} from 'lucide-react';
import { DEFAULT_SETTINGS } from '../data/servicesData';

interface SettingsModalProps {
  settings: SystemSettings;
  onSave: (newSettings: SystemSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<SystemSettings>({ ...settings });
  const [testingVoice, setTestingVoice] = useState(false);
  const [savedAlert, setSavedAlert] = useState(false);

  const handleTestChimeAndVoice = async () => {
    if (testingVoice) return;
    setTestingVoice(true);
    await announceTicket(
      'A-001',
      1,
      'Loket 1',
      'Pelayanan KTP Elektronik',
      {
        soundEnabled: formData.soundEnabled,
        volume: formData.chimeVolume,
        speechRate: formData.speechRate,
        speechPitch: formData.speechPitch,
      }
    );
    setTestingVoice(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSavedAlert(true);
    setTimeout(() => {
      setSavedAlert(false);
      onClose();
    }, 600);
  };

  const handleRestoreDefaults = () => {
    setFormData({ ...DEFAULT_SETTINGS });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#0a1736] rounded-3xl p-6 sm:p-8 max-w-lg w-full border-2 border-blue-900 shadow-2xl space-y-6 my-6 text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-blue-900 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-950 text-amber-400 border border-amber-400/30">
              <Settings className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                Pengaturan Sistem Antrian
              </h3>
              <p className="text-xs text-slate-400">
                Konfigurasi suara pemanggilan, volume, dan teks berjalan
              </p>
            </div>
          </div>

          <button
            id="close-settings-modal-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-[#07132c] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs sm:text-sm">
          {/* Sound & Voice Group */}
          <div className="p-4 bg-[#07132c] rounded-2xl border border-blue-900 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white">Suara Bel & Pemanggil Otomatis</span>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.soundEnabled}
                  onChange={(e) => setFormData({ ...formData, soundEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400" />
              </label>
            </div>

            {/* Volume slider */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Volume Audio Bel:</span>
                <span className="font-mono font-bold text-amber-400">{formData.chimeVolume}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={formData.chimeVolume}
                onChange={(e) => setFormData({ ...formData, chimeVolume: Number(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Speech rate */}
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Kecepatan Suara Petugas (TTS):</span>
                <span className="font-mono font-bold text-amber-400">{formData.speechRate}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.2"
                step="0.05"
                value={formData.speechRate}
                onChange={(e) => setFormData({ ...formData, speechRate: Number(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Test Voice Button */}
            <div className="pt-1">
              <button
                type="button"
                id="settings-test-audio-btn"
                onClick={handleTestChimeAndVoice}
                disabled={testingVoice}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#0a1736] border border-blue-800 hover:bg-[#0e214d] rounded-xl text-xs font-bold text-amber-300 transition"
              >
                <Volume2 className={`w-4 h-4 ${testingVoice ? 'animate-bounce text-amber-400' : ''}`} />
                <span>{testingVoice ? 'Sedang Memutar Contoh Suara...' : 'Uji Suara Contoh Panggilan (Ding-Dong + TTS)'}</span>
              </button>
            </div>
          </div>

          {/* SMS Notification Gateway Settings */}
          <div className="p-4 bg-[#07132c] rounded-2xl border border-amber-400/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white">Sistem Notifikasi SMS Otomatis</span>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.smsEnabled}
                  onChange={(e) => setFormData({ ...formData, smsEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400" />
              </label>
            </div>

            <p className="text-[11px] text-slate-400">
              Otomatis kirim SMS notifikasi ke nomor HP warga saat nomor antrian dipanggil di loket.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                ID Pengirim (Sender ID) SMS Gateway:
              </label>
              <input
                type="text"
                value={formData.smsGatewaySender}
                onChange={(e) => setFormData({ ...formData, smsGatewaySender: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-[#040a17] text-white border border-blue-900 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Format Template Pesan SMS:
              </label>
              <textarea
                rows={3}
                value={formData.smsTemplate}
                onChange={(e) => setFormData({ ...formData, smsTemplate: e.target.value })}
                className="w-full text-xs p-2.5 bg-[#040a17] text-white border border-blue-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 font-sans leading-relaxed"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Variabel yang tersedia: {'{NAMA}'}, {'{NOMOR}'}, {'{LOKET}'}, {'{LAYANAN}'}
              </span>
            </div>
          </div>

          {/* Running Text */}
          <div>
            <label className="block text-xs font-bold text-amber-400 uppercase mb-1 flex items-center gap-1.5">
              <Megaphone className="w-3.5 h-3.5 text-amber-400" />
              Teks Berjalan Layar TV (Running Text):
            </label>
            <textarea
              rows={3}
              value={formData.runningText}
              onChange={(e) => setFormData({ ...formData, runningText: e.target.value })}
              className="w-full text-xs sm:text-sm p-3 bg-[#07132c] text-white border border-blue-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <span className="text-[11px] text-slate-400">
              Gunakan tanda • untuk pemisah antar kalimat.
            </span>
          </div>

          {/* Office Name Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Instansi
              </label>
              <input
                type="text"
                value={formData.officeName}
                onChange={(e) => setFormData({ ...formData, officeName: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-[#07132c] text-white border border-blue-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Kabupaten / Daerah
              </label>
              <input
                type="text"
                value={formData.officeRegency}
                onChange={(e) => setFormData({ ...formData, officeRegency: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-[#07132c] text-white border border-blue-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 font-semibold"
              />
            </div>
          </div>

          {/* Keamanan Password Akses Role (Kecuali Pendaftar) */}
          <div className="bg-[#07132c] border border-amber-400/40 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <KeyRound className="w-4 h-4" />
                <span>Keamanan Password Akses Layar Peran</span>
              </div>
              <span className="text-xs font-semibold text-emerald-400">
                · Kiosk Bebas Akses (Tanpa Password)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Atur password untuk layar operasional agar terisolasi dengan aman di masing-masing perangkat. 
              Layar Kiosk cetak tiket dan Informasi Warga/Pendaftar dapat langsung dibuka tanpa memerlukan password.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Password Admin */}
              <div className="bg-[#040a17] p-3 rounded-xl border border-blue-900/60">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Password Admin</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Bawaan: admin123</span>
                </div>
                <input
                  type="text"
                  value={formData.adminPassword || formData.adminPin || 'admin123'}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    adminPassword: e.target.value,
                    adminPin: e.target.value 
                  })}
                  className="w-full text-xs px-3 py-2 bg-[#07132c] text-white border border-blue-800 rounded-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                  placeholder="admin123"
                />
              </div>

              {/* Password Petugas Loket */}
              <div className="bg-[#040a17] p-3 rounded-xl border border-blue-900/60">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Password Petugas Loket</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Bawaan: petugas123</span>
                </div>
                <input
                  type="text"
                  value={formData.operatorPassword || 'petugas123'}
                  onChange={(e) => setFormData({ ...formData, operatorPassword: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-[#07132c] text-white border border-blue-800 rounded-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="petugas123"
                />
              </div>

              {/* Password Layar Display TV */}
              <div className="bg-[#040a17] p-3 rounded-xl border border-blue-900/60">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                    <Tv className="w-3.5 h-3.5 text-sky-400" />
                    <span>Password Layar Display TV</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Bawaan: tv123</span>
                </div>
                <input
                  type="text"
                  value={formData.displayPassword || 'tv123'}
                  onChange={(e) => setFormData({ ...formData, displayPassword: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-[#07132c] text-white border border-blue-800 rounded-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-sky-400"
                  placeholder="tv123"
                />
              </div>

              {/* Kiosk Tiket & Pendaftar Bebas Password */}
              <div className="bg-[#040a17] p-3 rounded-xl border border-emerald-900/50 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5 text-amber-400" />
                    <span>Layar Kiosk Tiket Warga</span>
                  </label>
                  <span className="text-xs font-semibold text-emerald-400">· Bebas Akses</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Layar Kiosk cetak tiket tidak memerlukan password agar masyarakat dapat langsung mengambil nomor antrian tanpa hambatan.
                </p>
              </div>
            </div>
          </div>

          {/* Ekspor ke Komputer Lokal */}
          <div className="bg-[#050d1e] p-3.5 rounded-xl border border-blue-900/80 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Ekspor Source Code ke Komputer Lokal</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Unduh file .ZIP lengkap untuk dijalankan offline di server / laptop kantor Disdukcapil Keerom.
              </div>
            </div>
            <a
              id="settings-download-zip-btn"
              href="/antrian-disdukcapil-keerom.zip"
              download="antrian-disdukcapil-keerom.zip"
              className="shrink-0 px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-slate-950" />
              <span>Unduh ZIP</span>
            </a>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-blue-900">
            <button
              type="button"
              onClick={handleRestoreDefaults}
              className="text-xs text-slate-400 hover:text-amber-400 underline"
            >
              Kembalikan Default
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-300 hover:bg-[#07132c] rounded-xl transition"
              >
                Batal
              </button>
              <button
                type="submit"
                id="save-settings-submit-btn"
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-black text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition shadow-md shadow-amber-400/20"
              >
                {savedAlert ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Tersimpan!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Simpan Pengaturan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
