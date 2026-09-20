import React, { useState } from 'react';
import { SchoolProfile } from '../types';
import {
  Award,
  BookOpen,
  Calendar,
  Cloud,
  CreditCard,
  Download,
  FileSpreadsheet,
  FileText,
  Layers,
  Lock,
  Menu,
  MessageCircle,
  Printer,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
  Unlock,
  UserCheck,
} from 'lucide-react';

interface HeaderProps {
  profile: SchoolProfile;
  onUpdateProfile: (updated: SchoolProfile) => void;
  onResetData: () => void;
  onExportJson: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenPrintModal: (mode: 'matrix' | 'analysis' | 'lkpd' | 'remedial_final') => void;
  onOpenAiModal: () => void;
  onOpenGoogleSheetsModal?: () => void;
  isCloudConnected?: boolean;
  onPushLocalToCloud?: () => void;
  isSyncingCloud?: boolean;
  workspaceId?: string;
  onOpenWorkspaceModal?: () => void;
  isEditUnlocked?: boolean;
  onOpenPinModal?: () => void;
  activeTab: 'matrix' | 'analysis' | 'lkpd' | 'planner' | 'charts';
  setActiveTab: (tab: 'matrix' | 'analysis' | 'lkpd' | 'planner' | 'charts') => void;
  onToggleSidebarMobile: () => void;
  onToggleSidebarCollapse: () => void;
  isSidebarCollapsed: boolean;
  showSettingsModal: boolean;
  setShowSettingsModal: (show: boolean) => void;
  showPasswordPrompt: boolean;
  setShowPasswordPrompt: (show: boolean) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onUpdateProfile,
  onResetData,
  onExportJson,
  onImportJson,
  onOpenPrintModal,
  onOpenAiModal,
  onOpenGoogleSheetsModal,
  isCloudConnected,
  onPushLocalToCloud,
  isSyncingCloud,
  workspaceId,
  onOpenWorkspaceModal,
  isEditUnlocked,
  onOpenPinModal,
  activeTab,
  setActiveTab,
  onToggleSidebarMobile,
  onToggleSidebarCollapse,
  isSidebarCollapsed,
  showSettingsModal,
  setShowSettingsModal,
  showPasswordPrompt,
  setShowPasswordPrompt,
  isAuthenticated,
  setIsAuthenticated,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [editForm, setEditForm] = useState<SchoolProfile>(profile);

  const handleOpenSettings = () => {
    if (isAuthenticated) {
      setEditForm(profile);
      setShowSettingsModal(true);
    } else {
      setPasswordInput('');
      setPasswordError('');
      setShowPasswordPrompt(true);
    }
  };

  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'admin22168') {
      setIsAuthenticated(true);
      setShowPasswordPrompt(false);
      setPasswordError('');
      setEditForm(profile);
      setShowSettingsModal(true);
    } else {
      setPasswordError('Password salah! Silakan coba lagi.');
    }
  };

  const handleCloseSettings = () => {
    setShowSettingsModal(false);
    setIsAuthenticated(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(editForm);
    setShowSettingsModal(false);
    setIsAuthenticated(false);
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'matrix':
        return 'Matriks Penilaian Harian (Hal 1)';
      case 'analysis':
        return 'Analisis Ketuntasan & Remedial (Hal 2)';
      case 'lkpd':
        return 'Lembar Kerja Peserta Didik LKPD (Hal 3)';
      case 'planner':
        return 'Perencanaan 10 PH Semester';
      case 'charts':
        return 'Grafik & Statistik Analisis';
      default:
        return `Sistem Analisis Penilaian ${profile.subject || 'PJOK'}`;
    }
  };

  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-30">
      {/* Top Banner */}
      <div className="px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-3">
          
          {/* Left: Sidebar Toggle & App Title / Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Sidebar Mobile Toggle Button */}
            <button
              id="header-sidebar-mobile-toggle"
              onClick={onToggleSidebarMobile}
              className="lg:hidden p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 transition-colors shadow-sm"
              title="Buka Menu Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Sidebar Desktop Toggle Button */}
            <button
              id="header-sidebar-desktop-toggle"
              onClick={onToggleSidebarCollapse}
              className="hidden lg:flex p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 transition-colors shadow-sm"
              title={isSidebarCollapsed ? 'Perluas Sidebar Menu' : 'Perkecil Sidebar Menu'}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* School Logo */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-950/70 border border-indigo-700/50 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-xs">
              <img
                src={
                  profile.logoUrl ||
                  'https://lh3.googleusercontent.com/d/1q-uihP_9bDg8jusw9As1Qkw_G6CdCKwA'
                }
                alt="Logo Sekolah"
                className="w-full h-full object-contain"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            {/* School Details & Active Section Breadcrumb */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                  {profile.schoolName}
                </h1>
                <span className="text-slate-400 text-xs hidden sm:inline">•</span>
                <span className="text-indigo-400 text-xs font-semibold hidden sm:inline">
                  {getTabTitle()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                <span>Guru: <strong className="text-slate-200">{profile.teacherName}</strong></span>
                <span className="text-slate-400">•</span>
                <span className="text-indigo-300 font-semibold bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-700/50">
                  {profile.subject || 'PJOK'}
                </span>
                <span className="text-slate-400">•</span>
                <span>TP {profile.academicYear} (Sem {profile.semester})</span>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* PIN Pengunci Mode Edit */}
            {onOpenPinModal && (
              <button
                id="header-pin-btn"
                onClick={onOpenPinModal}
                className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl shadow-xs transition-all border ${
                  isEditUnlocked
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/60 ring-1 ring-emerald-500/30'
                    : 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400/60'
                }`}
                title={
                  isEditUnlocked
                    ? 'Mode Edit Guru Aktif. Klik untuk mengunci kembali.'
                    : 'Mode Baca Saja (Terkunci). Klik untuk memasukkan PIN Pengunci Guru.'
                }
              >
                {isEditUnlocked ? (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-emerald-200" />
                    <span className="hidden sm:inline">Mode Edit</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
                    <span className="hidden sm:inline">Terkunci</span>
                  </>
                )}
              </button>
            )}

            {/* Workspace Indicator */}
            {onOpenWorkspaceModal && (
              <button
                id="header-workspace-btn"
                onClick={onOpenWorkspaceModal}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold rounded-xl border border-indigo-500/40 shadow-xs transition-all"
                title="Pilih Ruang Kerja"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span className="uppercase text-[11px] truncate max-w-[100px]">{workspaceId || 'smpn2kutasari'}</span>
              </button>
            )}

            {/* Cloud Status */}
            {isCloudConnected ? (
              <button
                id="header-cloud-btn"
                onClick={onPushLocalToCloud}
                disabled={isSyncingCloud}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-xs font-bold rounded-xl border border-emerald-500/50 shadow-xs transition-all"
                title="Cloud Firestore Aktif. Klik untuk upload sinkronisasi data manual."
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Cloud className="w-3.5 h-3.5 text-emerald-300" />
                <span className="hidden md:inline">{isSyncingCloud ? 'Syncing...' : 'Cloud'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 text-amber-300 text-xs font-semibold rounded-xl border border-amber-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                <span className="hidden sm:inline">Cloud...</span>
              </div>
            )}

            {/* AI Recommendation Quick Button */}
            <button
              id="header-ai-btn"
              onClick={onOpenAiModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all border border-indigo-400/30"
              title="Bantuan AI Rekomendasi Remedial PJOK"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">AI Remedial</span>
            </button>

            {/* Quick Print Halaman 1 */}
            <button
              id="header-print-btn"
              onClick={() => onOpenPrintModal('matrix')}
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 text-xs font-semibold rounded-xl border border-indigo-700/50 transition-colors shadow-xs"
              title="Cetak Matriks Nilai (PDF Hal 1)"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span>PDF</span>
            </button>

            {/* Settings Button */}
            <button
              id="header-settings-btn"
              onClick={handleOpenSettings}
              className="p-1.5 sm:p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors relative"
              title="Pengaturan Identitas Sekolah & Guru"
            >
              <Settings className="w-4 h-4" />
              {!isAuthenticated && (
                <Lock className="w-2.5 h-2.5 text-amber-400 absolute -top-1 -right-1" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Password Prompt Modal */}
      {showPasswordPrompt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold flex items-center gap-2 text-slate-800">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                Verifikasi Keamanan Akses
              </h3>
              <button
                onClick={() => setShowPasswordPrompt(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl px-2"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3 leading-relaxed">
              Akses ke <strong>Pengaturan Identitas Sekolah & Guru</strong> dilindungi. Harap masukkan password administrator.
            </p>

            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 mb-4 text-xs text-amber-900 space-y-2">
              <div className="flex items-start gap-2">
                <CreditCard className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Dukungan / Infaq Seikhlasnya:</span>
                  <div className="font-mono font-bold text-amber-950 mt-0.5">
                    Rek. BPD Jateng: 3-125-02798-8
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-amber-200/60">
                <MessageCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold text-slate-700">Konfirmasi / Informasi WA:</span>
                <a
                  href="https://wa.me/6287767397817"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:text-emerald-800 font-bold underline font-mono flex items-center gap-1"
                >
                  0877-6739-7817
                </a>
              </div>
            </div>

            <form onSubmit={handleVerifyPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password Admin
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setPasswordError('');
                    }}
                    placeholder="Masukkan password..."
                    autoFocus
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                {passwordError && (
                  <p className="text-xs font-semibold text-rose-600 mt-1.5 flex items-center gap-1">
                    ⚠️ {passwordError}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordPrompt(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  Verifikasi & Masuk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile / School Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                <Settings className="w-5 h-5 text-emerald-600" />
                Pengaturan Identitas Sekolah & Guru
              </h3>
              <button
                onClick={handleCloseSettings}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl px-2"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Sekolah</label>
                <input
                  type="text"
                  value={editForm.schoolName}
                  onChange={(e) => setEditForm({ ...editForm, schoolName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
                <p className="text-[10px] text-slate-500 font-mono mt-1 font-semibold">
                  copyright@poerwanto221,s.pd. (Permanen)
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">URL Logo Sekolah</label>
                <input
                  type="text"
                  value={editForm.logoUrl || ''}
                  onChange={(e) => setEditForm({ ...editForm, logoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Sekolah</label>
                <input
                  type="text"
                  value={editForm.schoolAddress}
                  onChange={(e) => setEditForm({ ...editForm, schoolAddress: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Mata Pelajaran & Tanggal Laporan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                <div>
                  <label className="block text-xs font-bold text-indigo-950 mb-1 flex items-center justify-between">
                    <span>Nama Mata Pelajaran</span>
                    <span className="text-[10px] text-indigo-600 font-normal">Wajib</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.subject || ''}
                    onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                    placeholder="Contoh: PJOK, Matematika, IPA, dll."
                    className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-semibold text-slate-900 bg-white"
                    required
                  />
                  <p className="text-[10px] text-indigo-700/80 mt-1 leading-tight">
                    Otomatis tampil pada seluruh dokumen cetak (Hal 1, 2, 3, dan 4).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-indigo-950 mb-1">
                    Tanggal Laporan / Cetak
                  </label>
                  <input
                    type="text"
                    value={editForm.reportDate || ''}
                    onChange={(e) => setEditForm({ ...editForm, reportDate: e.target.value })}
                    placeholder="Contoh: 12 Oktober 2026"
                    className="w-full px-3 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 bg-white"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                    Tanggal tanda tangan di bawah laporan.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Guru Mata Pelajaran
                  </label>
                  <input
                    type="text"
                    value={editForm.teacherName}
                    onChange={(e) => setEditForm({ ...editForm, teacherName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIP Guru Mata Pelajaran
                  </label>
                  <input
                    type="text"
                    value={editForm.teacherNip}
                    onChange={(e) => setEditForm({ ...editForm, teacherNip: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Kepala Sekolah</label>
                  <input
                    type="text"
                    value={editForm.principalName}
                    onChange={(e) => setEditForm({ ...editForm, principalName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">NIP Kepala Sekolah</label>
                  <input
                    type="text"
                    value={editForm.principalNip}
                    onChange={(e) => setEditForm({ ...editForm, principalNip: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tahun Ajaran</label>
                  <input
                    type="text"
                    value={editForm.academicYear}
                    onChange={(e) => setEditForm({ ...editForm, academicYear: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                  <select
                    value={editForm.semester}
                    onChange={(e) => setEditForm({ ...editForm, semester: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  >
                    <option value="1 (Ganjil)">1 (Ganjil)</option>
                    <option value="2 (Genap)">2 (Genap)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kota Laporan</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseSettings}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

