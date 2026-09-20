import React from 'react';
import { SchoolProfile } from '../types';
import {
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Download,
  FileSpreadsheet,
  FileText,
  Layers,
  Lock,
  Printer,
  RefreshCw,
  Settings,
  Sparkles,
  Table,
  Unlock,
  Upload,
  UserCheck,
  X,
} from 'lucide-react';

interface SidebarProps {
  profile: SchoolProfile;
  activeTab: 'matrix' | 'analysis' | 'lkpd' | 'planner' | 'charts';
  setActiveTab: (tab: 'matrix' | 'analysis' | 'lkpd' | 'planner' | 'charts') => void;
  isOpen: boolean; // For mobile drawer
  onCloseMobile: () => void;
  isCollapsed: boolean; // For desktop collapsed state
  onToggleCollapse: () => void;
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
  onOpenSettings: () => void;
  isAuthenticated: boolean;
  onExportJson: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetData: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  profile,
  activeTab,
  setActiveTab,
  isOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
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
  onOpenSettings,
  isAuthenticated,
  onExportJson,
  onImportJson,
  onResetData,
}) => {
  const navMenuItems = [
    {
      id: 'matrix' as const,
      label: 'Matriks Nilai PH',
      sublabel: 'PDF Halaman 1',
      icon: BookOpen,
      badge: 'Hal 1',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'analysis' as const,
      label: 'Analisis & Remedial',
      sublabel: 'PDF Halaman 2',
      icon: UserCheck,
      badge: 'Hal 2',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'lkpd' as const,
      label: 'LKPD Siswa',
      sublabel: 'PDF Halaman 3',
      icon: FileText,
      badge: 'Hal 3',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'planner' as const,
      label: 'Rencana 10 PH',
      sublabel: 'Perencanaan TP/KKM',
      icon: Calendar,
      badge: '10 PH',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    {
      id: 'charts' as const,
      label: 'Grafik & Statistik',
      sublabel: 'Analisis Klasikal',
      icon: BarChart3,
      badge: 'Stats',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          id="sidebar-mobile-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        id="app-main-sidebar"
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col bg-slate-900 text-slate-200 border-r border-slate-800 shadow-2xl transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-72'} w-72`}
      >
        {/* Sidebar Header / Branding */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-950/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 p-1 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-inner">
              <img
                src={
                  profile.logoUrl ||
                  'https://lh3.googleusercontent.com/d/1q-uihP_9bDg8jusw9As1Qkw_G6CdCKwA'
                }
                alt="Logo"
                className="w-full h-full object-contain"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
                    SAAS PJOK v.5
                  </span>
                </div>
                <h2 className="text-sm font-bold text-white truncate mt-0.5" title={profile.schoolName}>
                  {profile.schoolName}
                </h2>
                <p className="text-[10px] text-slate-400 truncate">
                  {profile.teacherName}
                </p>
              </div>
            )}
          </div>

          {/* Close button on Mobile / Toggle button on Desktop */}
          <div className="flex items-center">
            {/* Mobile close button */}
            <button
              id="sidebar-close-mobile-btn"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Desktop collapse toggle button */}
            <button
              id="sidebar-toggle-collapse-btn"
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title={isCollapsed ? 'Perluas Sidebar' : 'Perkecil Sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          
          {/* SECTION 1: MENU UTAMA */}
          <div>
            {!isCollapsed && (
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
                Menu Utama
              </p>
            )}
            <nav className="space-y-1">
              {navMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-nav-${item.id}`}
                    onClick={() => {
                      setActiveTab(item.id);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400/40 font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`}
                    title={`${item.label} (${item.sublabel})`}
                  >
                    <Icon
                      className={`w-5 h-5 flex-shrink-0 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                      }`}
                    />
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0 flex items-center justify-between">
                        <div className="truncate">
                          <div className="text-xs font-bold truncate leading-tight">{item.label}</div>
                          <div className={`text-[10px] truncate ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {item.sublabel}
                          </div>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ml-1.5 flex-shrink-0 ${
                            isActive
                              ? 'bg-white/20 text-white border-white/30'
                              : item.badgeColor
                          }`}
                        >
                          {item.badge}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* SECTION 2: CETAK / UNDUH LAPORAN PDF */}
          <div>
            {!isCollapsed && (
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2 flex items-center justify-between">
                <span>Cetak & Dokumen PDF</span>
                <Printer className="w-3 h-3 text-slate-400" />
              </p>
            )}
            <div className="space-y-1">
              <button
                id="sidebar-print-hal1"
                onClick={() => {
                  onOpenPrintModal('matrix');
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-indigo-950/60 border border-transparent hover:border-indigo-800/50 transition-all ${
                  isCollapsed ? 'justify-center px-2' : ''
                }`}
                title="Cetak Matriks Penilaian Harian (PDF Halaman 1)"
              >
                <Download className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">Cetak Hal 1: Matriks Nilai</span>}
              </button>

              <button
                id="sidebar-print-hal2"
                onClick={() => {
                  onOpenPrintModal('analysis');
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all ${
                  isCollapsed ? 'justify-center px-2' : ''
                }`}
                title="Cetak Analisis & Program Remedial (PDF Halaman 2)"
              >
                <Printer className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">Cetak Hal 2: Analisis & Remedial</span>}
              </button>

              <button
                id="sidebar-print-hal3"
                onClick={() => {
                  onOpenPrintModal('lkpd');
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-amber-950/60 border border-transparent hover:border-amber-800/50 transition-all ${
                  isCollapsed ? 'justify-center px-2' : ''
                }`}
                title="Cetak Lembar Kerja Peserta Didik LKPD (PDF Halaman 3)"
              >
                <FileText className="w-4 h-4 text-amber-400 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">Cetak Hal 3: LKPD Siswa</span>}
              </button>

              <button
                id="sidebar-print-hal4"
                onClick={() => {
                  onOpenPrintModal('remedial_final');
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-emerald-950/60 border border-transparent hover:border-emerald-800/50 transition-all ${
                  isCollapsed ? 'justify-center px-2' : ''
                }`}
                title="Cetak Daftar Nilai Akhir Hasil Perbaikan (PDF Halaman 4)"
              >
                <Download className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">Cetak Hal 4: Nilai Akhir</span>}
              </button>
            </div>
          </div>

          {/* SECTION 3: FITUR & INTEGRASI GURU */}
          <div>
            {!isCollapsed && (
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
                Alat & Integrasi
              </p>
            )}
            <div className="space-y-1">
              {/* AI Remedial Assistant */}
              <button
                id="sidebar-ai-assistant-btn"
                onClick={() => {
                  onOpenAiModal();
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-900/40 hover:bg-indigo-800/60 text-indigo-200 border border-indigo-600/30 transition-all shadow-xs ${
                  isCollapsed ? 'justify-center px-2' : ''
                }`}
                title="Bantuan AI Rekomendasi Remedial PJOK"
              >
                <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
                {!isCollapsed && <span>Rekomendasi AI</span>}
              </button>

              {/* Google Sheets Sync */}
              {onOpenGoogleSheetsModal && (
                <button
                  id="sidebar-sheets-btn"
                  onClick={() => {
                    onOpenGoogleSheetsModal();
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-200 border border-emerald-600/30 transition-all ${
                    isCollapsed ? 'justify-center px-2' : ''
                  }`}
                  title="Sinkronisasi Google Spreadsheet SAAS v.3"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  {!isCollapsed && <span>Google Sheets Sync</span>}
                </button>
              )}

              {/* PIN Mode Edit Lock/Unlock */}
              {onOpenPinModal && (
                <button
                  id="sidebar-pin-lock-btn"
                  onClick={() => {
                    onOpenPinModal();
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                    isEditUnlocked
                      ? 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-200 border-emerald-500/40'
                      : 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 border-amber-500/40'
                  } ${isCollapsed ? 'justify-center px-2' : ''}`}
                  title={
                    isEditUnlocked
                      ? 'Mode Edit Terbuka. Klik untuk mengunci kembali.'
                      : 'Mode Baca Saja (Terkunci). Masukkan PIN Pengunci.'
                  }
                >
                  {isEditUnlocked ? (
                    <>
                      <Unlock className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                      {!isCollapsed && <span>Mode Edit: Terbuka</span>}
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-amber-400 animate-pulse flex-shrink-0" />
                      {!isCollapsed && <span>Mode Edit: Terkunci</span>}
                    </>
                  )}
                </button>
              )}

              {/* Workspace Switcher */}
              {onOpenWorkspaceModal && (
                <button
                  id="sidebar-workspace-btn"
                  onClick={() => {
                    onOpenWorkspaceModal();
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-all ${
                    isCollapsed ? 'justify-center px-2' : ''
                  }`}
                  title="Pilih atau Buat Ruang Kerja Terpisah"
                >
                  <Layers className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  {!isCollapsed && (
                    <div className="flex items-center justify-between flex-1 truncate">
                      <span className="truncate">Ruang Kerja</span>
                      <span className="text-[10px] font-mono font-bold uppercase bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 border border-slate-700">
                        {workspaceId || 'smpn2kutasari'}
                      </span>
                    </div>
                  )}
                </button>
              )}

              {/* Cloud Push Sync */}
              {isCloudConnected && (
                <button
                  id="sidebar-cloud-sync-btn"
                  onClick={() => {
                    if (onPushLocalToCloud) onPushLocalToCloud();
                    onCloseMobile();
                  }}
                  disabled={isSyncingCloud}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-950/30 hover:bg-emerald-900/50 border border-emerald-600/30 transition-all ${
                    isCollapsed ? 'justify-center px-2' : ''
                  }`}
                  title="Sinkronisasi Data Lokal ke Firestore Cloud"
                >
                  <Cloud className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  {!isCollapsed && (
                    <span>{isSyncingCloud ? 'Menyinkronkan...' : 'Cloud Sync Data'}</span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* SECTION 4: PENGATURAN & BACKUP */}
          <div>
            {!isCollapsed && (
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
                Pengaturan & Cadangan
              </p>
            )}
            <div className="space-y-1">
              <button
                id="sidebar-settings-btn"
                onClick={() => {
                  onOpenSettings();
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition-all relative ${
                  isCollapsed ? 'justify-center px-2' : ''
                }`}
                title="Pengaturan Identitas Sekolah & Guru"
              >
                <Settings className="w-4 h-4 text-slate-400 flex-shrink-0" />
                {!isCollapsed && (
                  <div className="flex items-center justify-between flex-1">
                    <span>Identitas Sekolah & Guru</span>
                    {!isAuthenticated && <Lock className="w-3 h-3 text-amber-400" />}
                  </div>
                )}
              </button>

              <button
                id="sidebar-export-btn"
                onClick={onExportJson}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition-all ${
                  isCollapsed ? 'justify-center px-2' : ''
                }`}
                title="Ekspor Seluruh Data ke File JSON Backup"
              >
                <Download className="w-4 h-4 text-slate-400 flex-shrink-0" />
                {!isCollapsed && <span>Ekspor Cadangan JSON</span>}
              </button>

              <label
                id="sidebar-import-label"
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 transition-all cursor-pointer ${
                  isCollapsed ? 'justify-center px-2' : ''
                }`}
                title="Impor Data dari File JSON Backup"
              >
                <Upload className="w-4 h-4 text-slate-400 flex-shrink-0" />
                {!isCollapsed && <span>Impor Cadangan JSON</span>}
                <input type="file" accept=".json" onChange={onImportJson} className="hidden" />
              </label>

              <button
                id="sidebar-reset-btn"
                onClick={onResetData}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/30 transition-all ${
                  isCollapsed ? 'justify-center px-2' : ''
                }`}
                title="Reset Data ke Pengaturan Default"
              >
                <RefreshCw className="w-4 h-4 text-rose-400 flex-shrink-0" />
                {!isCollapsed && <span>Reset Data Default</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          {!isCollapsed ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isCloudConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <span>{isCloudConnected ? 'Firestore Connected' : 'Local Offline'}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">v5.0</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight text-center">
                pengembang app #poerwanto,s.pd.or
              </p>
            </div>
          ) : (
            <div className="flex justify-center">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isCloudConnected ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
                title={isCloudConnected ? 'Cloud Active' : 'Offline'}
              />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
