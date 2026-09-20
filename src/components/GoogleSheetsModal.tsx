import React, { useState } from 'react';
import { AssessmentItem, ClassId, SchoolProfile, ScoreRecord, Student } from '../types';
import {
  FileSpreadsheet,
  X,
  Download,
  Upload,
  Link,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Info,
  Layers,
  ArrowRight,
  Database,
  Code2,
  Copy,
  Check
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface GoogleSheetsModalProps {
  selectedClass: ClassId;
  phItem: AssessmentItem;
  profile: SchoolProfile;
  students: Student[];
  scores: ScoreRecord[];
  onImportGoogleSheetsData: (payload: {
    classId: ClassId;
    phId: string;
    newStudents: Omit<Student, 'id'>[];
    updatedScores: {
      nis: string;
      itemScores?: number[];
      totalScore?: number;
      remedialScore?: number | null;
      remedialNotes?: string;
    }[];
  }) => void;
  onClose: () => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  selectedClass,
  phItem,
  profile,
  students,
  scores,
  onImportGoogleSheetsData,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'link' | 'excel' | 'template' | 'export' | 'gas'>('link');
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedGas, setCopiedGas] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  // Parsed Preview State
  const [parsedData, setParsedData] = useState<{
    students: { nis: string; name: string; gender: 'L' | 'P' }[];
    scoreEntries: {
      nis: string;
      name: string;
      itemScores: number[];
      totalScore: number;
      percentage: number;
      remedialScore: number | null;
      remedialNotes: string;
    }[];
  } | null>(null);

  // Extract Spreadsheet ID from standard Google Sheets URL
  const extractSheetId = (url: string): string | null => {
    const trimmed = url.trim();
    if (!trimmed) return null;

    // Match /d/{SPREADSHEET_ID}/
    const match = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      return match[1];
    }
    // Direct ID input
    if (trimmed.length > 25 && !trimmed.includes('/')) {
      return trimmed;
    }
    return null;
  };

  // Helper to parse CSV / Raw Sheet Data into SAAS v.3 Structure
  const parseRowsToSaasFormat = (rows: Record<string, any>[]) => {
    if (rows.length === 0) {
      throw new Error('Data spreadsheet kosong atau tidak berisi baris yang valid.');
    }

    const questionCount = phItem.itemMaxScores.length;
    const parsedStudents: { nis: string; name: string; gender: 'L' | 'P' }[] = [];
    const parsedScoreEntries: {
      nis: string;
      name: string;
      itemScores: number[];
      totalScore: number;
      percentage: number;
      remedialScore: number | null;
      remedialNotes: string;
    }[] = [];

    rows.forEach((row, idx) => {
      // Keys lookup
      const nisVal = String(
        row['NIS'] || row['Nis'] || row['nis'] || row['NISN'] || row['Nisn'] || `2025${1000 + idx}`
      ).trim();

      const nameVal = String(
        row['Nama Lengkap'] ||
          row['Nama Siswa'] ||
          row['NAMA SISWA'] ||
          row['Nama'] ||
          row['NAMA'] ||
          row['Nama Murid'] ||
          ''
      ).trim();

      const genderRaw = String(
        row['Jenis Kelamin'] || row['JK'] || row['L/P'] || row['Gender'] || 'L'
      ).trim().toUpperCase();

      const genderVal: 'L' | 'P' = genderRaw.startsWith('P') || genderRaw.startsWith('PEREMPUAN') ? 'P' : 'L';

      if (!nameVal) return;

      // Parse question item scores if provided (e.g. "Soal 1", "Skor 1", "No 1", etc.)
      const itemScores: number[] = [];
      for (let i = 1; i <= questionCount; i++) {
        const itemVal =
          row[`Soal ${i}`] ??
          row[`Soal_${i}`] ??
          row[`Skor ${i}`] ??
          row[`Skor_${i}`] ??
          row[`Q${i}`] ??
          row[`No ${i}`] ??
          row[`No_${i}`] ??
          null;

        if (itemVal !== null && itemVal !== undefined && itemVal !== '') {
          const num = parseInt(String(itemVal), 10);
          const max = phItem.itemMaxScores[i - 1] || 5;
          itemScores.push(isNaN(num) ? 0 : Math.min(max, Math.max(0, num)));
        }
      }

      // If no individual item scores were found, check for Total Score or Nilai
      let totalScore = 0;
      if (itemScores.length === questionCount) {
        totalScore = itemScores.reduce((a, b) => a + b, 0);
      } else {
        const totalVal = row['Total Skor'] || row['Total'] || row['JUMLAH SKOR'] || row['Nilai'] || row['NILAI'] || 0;
        const parsedTotal = parseInt(String(totalVal), 10) || 0;
        
        // If value looks like 0-100 percentage, convert to totalMaxScore scale
        if (parsedTotal > phItem.totalMaxScore && parsedTotal <= 100) {
          totalScore = Math.round((parsedTotal / 100) * phItem.totalMaxScore);
        } else {
          totalScore = Math.min(phItem.totalMaxScore, Math.max(0, parsedTotal));
        }

        // Fill proportional item scores
        const factor = phItem.totalMaxScore > 0 ? totalScore / phItem.totalMaxScore : 0;
        phItem.itemMaxScores.forEach((max) => {
          itemScores.push(Math.round(max * factor));
        });
      }

      const percentage = phItem.totalMaxScore > 0 ? Math.round((totalScore / phItem.totalMaxScore) * 100) : 0;

      // Parse Remedial Score & Notes
      const remedialValRaw = row['Nilai Remedial'] || row['Nilai Perbaikan'] || row['Remedial'] || row['Skor Remedial'] || null;
      let remedialScore: number | null = null;
      if (remedialValRaw !== null && remedialValRaw !== undefined && String(remedialValRaw).trim() !== '') {
        const num = parseInt(String(remedialValRaw), 10);
        if (!isNaN(num) && num > 0) {
          remedialScore = num;
        }
      }

      const remedialNotes = String(
        row['Catatan Remedial'] || row['Catatan'] || row['Keterangan'] || row['Program Remedial'] || ''
      ).trim();

      parsedStudents.push({
        nis: nisVal,
        name: nameVal,
        gender: genderVal,
      });

      parsedScoreEntries.push({
        nis: nisVal,
        name: nameVal,
        itemScores,
        totalScore,
        percentage,
        remedialScore,
        remedialNotes,
      });
    });

    return { students: parsedStudents, scoreEntries: parsedScoreEntries };
  };

  // Fetch Google Spreadsheet via CSV endpoint
  const handleFetchGoogleSheet = async () => {
    setErrorMessage(null);
    setStatusMessage(null);
    setParsedData(null);

    const sheetId = extractSheetId(sheetUrl);
    if (!sheetId) {
      setErrorMessage('URL Google Spreadsheet tidak valid! Harap masukkan link Google Sheets yang benar.');
      return;
    }

    setIsLoading(true);
    try {
      // Construct CSV export URL for Google Sheets
      const sheetParam = sheetName.trim() ? `&sheet=${encodeURIComponent(sheetName.trim())}` : '';
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv${sheetParam}`;

      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error('Gagal mengambil data dari Google Sheets. Pastikan Spreadsheet sudah dipublikasikan/dibagikan.');
      }

      const csvText = await response.text();
      if (!csvText || csvText.includes('<!DOCTYPE html>')) {
        throw new Error(
          'Spreadsheet memerlukan izin akses atau tidak publik. Pastikan pengaturan Berbagi di Google Sheets diubah ke "Siapa saja yang memiliki link / Anyone with link".'
        );
      }

      // Parse CSV with XLSX library
      const workbook = XLSX.read(csvText, { type: 'string' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(firstSheet);

      const parsed = parseRowsToSaasFormat(rawRows);
      if (parsed.students.length === 0) {
        throw new Error('Tidak ada baris data siswa yang dapat dibaca. Pastikan terdapat kolom "Nama Lengkap" atau "Nama Siswa".');
      }

      setParsedData(parsed);
      setStatusMessage(
        `Berhasil membaca ${parsed.students.length} data siswa & nilai UH dari Google Spreadsheet!`
      );
    } catch (err: any) {
      console.error('Fetch Google Sheet error:', err);
      setErrorMessage(
        err.message || 'Gagal menyambung ke Google Spreadsheet. Silakan periksa kembali link atau gunakan opsi Upload File Excel.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Upload Excel / CSV file exported from Google Sheets
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setStatusMessage(null);
    setParsedData(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet);

        const parsed = parseRowsToSaasFormat(rawRows);
        setParsedData(parsed);
        setStatusMessage(
          `Berhasil membaca ${parsed.students.length} data siswa dari file "${file.name}"!`
        );
        e.target.value = '';
      } catch (err: any) {
        console.error('File Upload error:', err);
        setErrorMessage(
          err.message || 'Gagal membaca file Excel. Pastikan format kolom sesuai template SAAS v.3!'
        );
      }
    };

    reader.readAsBinaryString(file);
  };

  // Download Official SAAS v.3 Google Spreadsheet / Excel Template
  const handleDownloadTemplate = () => {
    const questionCount = phItem.itemMaxScores.length;
    
    // Header information rows
    const templateData: Record<string, any>[] = [
      {
        'NO': 1,
        'NIS': '20250701',
        'NAMA SISWA': 'Adelia Putri Pratama',
        'L/P': 'P',
      },
      {
        'NO': 2,
        'NIS': '20250702',
        'NAMA SISWA': 'Ahmad Bagus Prasetyo',
        'L/P': 'L',
      },
      {
        'NO': 3,
        'NIS': '20250703',
        'NAMA SISWA': 'Amanda Nur Aini',
        'L/P': 'P',
      },
      {
        'NO': 4,
        'NIS': '20250704',
        'NAMA SISWA': 'Andika Dwi Saputra',
        'L/P': 'L',
      },
      {
        'NO': 5,
        'NIS': '20250705',
        'NAMA SISWA': 'Annisa Fitriani',
        'L/P': 'P',
      },
    ];

    // Add item score columns matching current PH
    templateData.forEach((row, rowIdx) => {
      phItem.itemMaxScores.forEach((max, qIdx) => {
        row[`Soal ${qIdx + 1}`] = max;
      });
      row['Nilai Remedial'] = rowIdx % 2 === 1 ? Math.min(100, phItem.kkm + 5) : '';
      row['Catatan Remedial'] = rowIdx % 2 === 1 ? 'Penjelasan ulang teknik dasar & tugas praktek' : '';
    });

    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Set Column Widths
    const cols = [
      { wch: 6 },  // NO
      { wch: 14 }, // NIS
      { wch: 32 }, // NAMA SISWA
      { wch: 8 },  // L/P
    ];
    phItem.itemMaxScores.forEach(() => cols.push({ wch: 10 }));
    cols.push({ wch: 16 }); // Nilai Remedial
    cols.push({ wch: 40 }); // Catatan Remedial

    worksheet['!cols'] = cols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      `SAAS_v3_${selectedClass.replace(' ', '')}_${phItem.code.replace(' ', '')}`
    );

    const fileName = `Template_SAAS_v3_GoogleSheets_${selectedClass.replace(' ', '_')}_${phItem.code}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Export Current Assessment Data to Excel / Google Sheets format
  const handleExportCurrentDataToExcel = () => {
    const classStudents = students
      .filter((s) => s.classId === selectedClass)
      .sort((a, b) => a.name.localeCompare(b.name, 'id', { sensitivity: 'base' }));
    const scoreMap = new Map<string, ScoreRecord>();
    scores.forEach((sc) => {
      if (sc.classId === selectedClass && sc.phId === phItem.id) {
        scoreMap.set(sc.studentId, sc);
      }
    });

    const exportRows = classStudents.map((st, idx) => {
      const rec = scoreMap.get(st.id);
      const row: Record<string, any> = {
        'NO': idx + 1,
        'NIS': st.nis,
        'NAMA SISWA': st.name,
        'L/P': st.gender,
      };

      phItem.itemMaxScores.forEach((max, qIdx) => {
        row[`Soal ${qIdx + 1}`] = rec?.itemScores[qIdx] ?? 0;
      });

      row['JUMLAH SKOR'] = rec?.totalScore ?? 0;
      row['KETERCAPAIAN (%)'] = `${rec?.percentageScore ?? 0}%`;
      row['STATUS KETUNTASAN'] = rec?.isPassed ? 'TUNTAS' : 'REMEDIAL';
      row['NILAI REMEDIAL'] = rec?.remedialScore ?? '-';
      row['STATUS PASCA REMEDIAL'] = rec?.isPassedPostRemedial ? 'TUNTAS' : 'BELUM TUNTAS';
      row['CATATAN PROGRAM'] = rec?.remedialNotes ?? '';

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      `Rekap_${selectedClass.replace(' ', '')}_${phItem.code.replace(' ', '')}`
    );

    const fileName = `Rekap_SAAS_v3_${profile.schoolName.replace(/ /g, '_')}_${selectedClass.replace(' ', '_')}_${phItem.code}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Apply parsed preview data to App state
  const handleApplyImport = () => {
    if (!parsedData) return;

    onImportGoogleSheetsData({
      classId: selectedClass,
      phId: phItem.id,
      newStudents: parsedData.students,
      updatedScores: parsedData.scoreEntries,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white text-slate-900 rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl flex-shrink-0">
              <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/10 text-emerald-700 font-bold text-[11px] px-2.5 py-0.5 rounded-full border border-emerald-300">
                  Integrasi Google Spreadsheet
                </span>
                <span className="text-slate-400 text-xs font-semibold">
                  SAAS v.3 SMPN 2 Kutasari
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                Sinkron Data UH/Asesmen ({phItem.code}) - Kelas {selectedClass}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 font-bold text-xl rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 border-b border-slate-200 mb-5 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('link')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'link'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Link className="w-4 h-4 text-emerald-600" />
            <span>1. Ambil dari Link Google Sheets</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('excel')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'excel'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>2. Upload File Excel / CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('template')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'template'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>3. Unduh Template SAAS v.3</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'export'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4 text-amber-600" />
            <span>4. Ekspor Data Aktif ke Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gas')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'gas'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-xl'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4 text-indigo-600" />
            <span>5. Google Apps Script (Kode.gs & Index.html)</span>
          </button>
        </div>

        {/* Notifications */}
        {statusMessage && (
          <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{statusMessage}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-emerald-700 font-bold">✕</button>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-900 text-xs rounded-xl flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold">Gagal Membaca Data:</span>
                <p className="text-[11px] text-rose-800">{errorMessage}</p>
              </div>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-700 font-bold">✕</button>
          </div>
        )}

        {/* TAB 1: Link Google Sheets Input */}
        {activeTab === 'link' && (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-3">
              <div className="flex items-center gap-2 text-slate-800 font-extrabold text-xs">
                <Info className="w-4 h-4 text-emerald-600" />
                Cara Mengambil Data dari Google Spreadsheet Publik:
              </div>
              <ol className="list-decimal list-inside text-slate-600 space-y-1 text-[11px] leading-relaxed">
                <li>Buka Google Spreadsheet nilai / respon Google Form di browser Anda.</li>
                <li>
                  Klik tombol <strong className="text-slate-800">Bagikan (Share)</strong> di kanan atas Google Sheets &rarr; ubah ke{' '}
                  <strong className="text-emerald-700 font-bold">"Siapa saja yang memiliki link" (Anyone with the link)</strong>.
                </li>
                <li>Salin (Copy) URL Spreadsheet tersebut dan tempelkan pada kolom di bawah ini.</li>
              </ol>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  URL / Link Google Spreadsheet
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMd.../edit"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 font-mono"
                  />
                  <Link className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nama Sheet / Tab (Opsional, Kosongkan untuk Tab Pertama)
                </label>
                <input
                  type="text"
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                  placeholder="Contoh: Form Responses 1 atau VII_A"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900"
                />
              </div>

              <button
                type="button"
                disabled={isLoading || !sheetUrl.trim()}
                onClick={handleFetchGoogleSheet}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menghubungkan & Membaca Google Spreadsheet...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Ambil & Analisis Data Google Sheets</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Upload Excel / CSV file */}
        {activeTab === 'excel' && (
          <div className="space-y-4">
            <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 text-xs space-y-2">
              <h4 className="font-extrabold text-indigo-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-600" />
                Upload File Excel (.xlsx / .xls / .csv) dari Google Drive
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Jika Google Spreadsheet Anda bersifat pribadi atau Anda telah mendownloadnya dalam format Excel, Anda dapat langsung mengunggah file tersebut di sini.
              </p>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
              <Upload className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-800">
                Klik atau Tarik File Excel / CSV Ke Sini
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Mendukung .xlsx, .xls, .csv yang didownload dari Google Sheets
              </p>

              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* TAB 3: Download SAAS v.3 Template */}
        {activeTab === 'template' && (
          <div className="space-y-4">
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-xs space-y-2">
              <h4 className="font-extrabold text-emerald-950 flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-600" />
                Template Resmi SAAS v.3 SMPN 2 Kutasari
              </h4>
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                Gunakan template ini untuk membuat Google Spreadsheet baru di Google Drive Anda. Format kolom sudah disesuaikan secara otomatis dengan standar SAAS v.3 PJOK (NIS, Nama Siswa, Skor Soal 1..{phItem.itemMaxScores.length}, Nilai Remedial, dan Catatan Program).
              </p>
            </div>

            <div className="p-4 border rounded-2xl bg-white shadow-sm space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">
                    Template Penilaian UH ({phItem.code} : {phItem.title})
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Mata Pelajaran: PJOK • Kelas {selectedClass} • Total Skor Maksimal: {phItem.totalMaxScore}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Template .XLSX</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Export Current App Assessment Data */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs space-y-2">
              <h4 className="font-extrabold text-amber-950 flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-600" />
                Ekspor Data Penilaian Aktif ke Google Sheets / Excel
              </h4>
              <p className="text-[11px] text-amber-900 leading-relaxed">
                Unduh seluruh matriks skor, % ketercapaian, status ketuntasan, dan laporan perbaikan remedial Kelas {selectedClass} saat ini. Hasil unduhan dapat langsung di-upload ke Google Drive untuk kontrol pembelajaran.
              </p>
            </div>

            <div className="p-4 border rounded-2xl bg-white shadow-sm space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">
                    Data Rekap Penilaian Kelas {selectedClass} ({phItem.code})
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Mencakup {students.filter((s) => s.classId === selectedClass).length} siswa • Format SAAS v.3 SMPN 2 Kutasari
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExportCurrentDataToExcel}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Ekspor Data .XLSX</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Google Apps Script (Kode.gs & Index.html) */}
        {activeTab === 'gas' && (
          <div className="space-y-4">
            <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-200 text-xs space-y-2">
              <h4 className="font-extrabold text-indigo-950 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-600" />
                Panduan Peluncuran Google Apps Script (GAS Web App)
              </h4>
              <p className="text-[11px] text-indigo-900 leading-relaxed">
                Anda dapat menjalankan seluruh aplikasi SAAS v.3 ini langsung dari dalam Google Drive & Google Spreadsheet Anda melalui <strong>Google Apps Script Extension</strong>. ikuti 3 langkah praktis berikut:
              </p>
              <ol className="list-decimal list-inside text-[11px] text-indigo-950 space-y-1 font-medium pl-1">
                <li>Buka Google Spreadsheet Anda &rarr; Pilih Menu <strong>Ekstensi (Extensions)</strong> &rarr; <strong>Apps Script</strong>.</li>
                <li>Hapus kode di file <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 font-mono">Kode.gs</code>, lalu tempelkan kode <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 font-mono">Kode.gs</code> di bawah.</li>
                <li>Buat file HTML baru bernama <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 font-mono">Index.html</code> di Apps Script, lalu tempelkan kode <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 font-mono">Index.html</code>. Lalu klik <strong>Terapkan (Deploy) &rarr; Deployment Baru &rarr; Web App (Siapa Saja / Anyone)</strong>.</li>
              </ol>
            </div>

            {/* Kode.gs Section */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-900 text-white text-xs">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 border-b border-slate-700">
                <div className="flex items-center gap-2 font-mono text-emerald-400 font-bold">
                  <Code2 className="w-4 h-4" />
                  <span>Kode.gs</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const codeGs = `/**
 * SAAS v.3 PJOK - Google Apps Script (GAS) Backend
 * Aplikasi Analisis Penilaian Harian & Remedial PJOK
 * Hak Cipta @ poerwanto221,s.pd. - SMPN 2 Kutasari
 */

function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('SAAS v.3 PJOK - Aplikasi Analisis & Remedial')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Mengambil data siswa dan nilai dari Google Spreadsheet Aktif
 */
function getSheetData(sheetName) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = sheetName ? ss.getSheetByName(sheetName) : ss.getSheets()[0];
    if (!sheet) return JSON.stringify({ status: 'error', message: 'Sheet tidak ditemukan' });
    
    var data = sheet.getDataRange().getValues();
    if (data.length < 2) return JSON.stringify({ status: 'success', data: [] });
    
    var headers = data[0];
    var result = [];
    for (var i = 1; i < data.length; i++) {
      var row = {};
      for (var j = 0; j < headers.length; j++) {
        row[headers[j]] = data[i][j];
      }
      result.push(row);
    }
    return JSON.stringify({ status: 'success', data: result });
  } catch (err) {
    return JSON.stringify({ status: 'error', message: err.toString() });
  }
}

/**
 * Menyimpan / memperbarui nilai siswa ke Google Spreadsheet
 */
function saveScoresToSheet(classId, phCode, scoresJson) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = "Rekap_" + classId + "_" + phCode;
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    } else {
      sheet.clear();
    }
    
    var scores = typeof scoresJson === 'string' ? JSON.parse(scoresJson) : scoresJson;
    if (!scores || scores.length === 0) return JSON.stringify({ status: 'error', message: 'Data kosong' });
    
    var headers = Object.keys(scores[0]);
    sheet.appendRow(headers);
    
    var rows = scores.map(function(item) {
      return headers.map(function(h) { return item[h]; });
    });
    
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    return JSON.stringify({ status: 'success', message: 'Tersimpan ' + rows.length + ' baris data ke ' + sheetName });
  } catch (err) {
    return JSON.stringify({ status: 'error', message: err.toString() });
  }
}`;
                    navigator.clipboard.writeText(codeGs);
                    setCopiedGas(true);
                    setTimeout(() => setCopiedGas(false), 2000);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] transition-colors"
                >
                  {copiedGas ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedGas ? 'Tersalin!' : 'Salin Kode.gs'}</span>
                </button>
              </div>
              <pre className="p-4 font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-48 leading-relaxed">
{`/**
 * SAAS v.3 PJOK - Google Apps Script (GAS) Backend
 * Aplikasi Analisis Penilaian Harian & Remedial PJOK
 * Hak Cipta @ poerwanto221,s.pd. - SMPN 2 Kutasari
 */

function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('SAAS v.3 PJOK - Aplikasi Analisis & Remedial')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getSheetData(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = sheetName ? ss.getSheetByName(sheetName) : ss.getSheets()[0];
  if (!sheet) return JSON.stringify({ status: 'error', message: 'Sheet tidak ditemukan' });
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return JSON.stringify({ status: 'success', data: [] });
  var headers = data[0];
  var result = [];
  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) { row[headers[j]] = data[i][j]; }
    result.push(row);
  }
  return JSON.stringify({ status: 'success', data: result });
}`}
              </pre>
            </div>

            {/* Index.html Section */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-900 text-white text-xs">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 border-b border-slate-700">
                <div className="flex items-center gap-2 font-mono text-cyan-400 font-bold">
                  <Code2 className="w-4 h-4" />
                  <span>Index.html</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const htmlCode = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Membuka SAAS v.3 PJOK...</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
    .card { background: #1e293b; padding: 2rem; border-radius: 1rem; border: 1px solid #334155; max-width: 400px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
    .btn { display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: bold; margin-top: 1rem; transition: all 0.2s; }
    .btn:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="card">
    <h2 style="margin-top:0;">🚀 Mengalihkan ke SAAS v.3 PJOK</h2>
    <p style="color:#94a3b8; font-size:14px;">Aplikasi sedang dibuka secara langsung untuk menghindari pembatasan keamanan Google Apps Script...</p>
    <a id="appLink" class="btn" href="https://ais-pre-wsma5ssmuqhq4uisgonem3-768538907806.asia-southeast1.run.app" target="_top">Buka Aplikasi Sekarang</a>
  </div>
  <script>
    // Otomatis mengalihkan ke aplikasi utama secara penuh
    setTimeout(function() {
      if (window.top) {
        window.top.location.href = "https://ais-pre-wsma5ssmuqhq4uisgonem3-768538907806.asia-southeast1.run.app";
      } else {
        window.location.href = "https://ais-pre-wsma5ssmuqhq4uisgonem3-768538907806.asia-southeast1.run.app";
      }
    }, 1000);
  </script>
</body>
</html>`;
                    navigator.clipboard.writeText(htmlCode);
                    setCopiedHtml(true);
                    setTimeout(() => setCopiedHtml(false), 2000);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-[11px] transition-colors"
                >
                  {copiedHtml ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedHtml ? 'Tersalin!' : 'Salin Index.html'}</span>
                </button>
              </div>
              <pre className="p-4 font-mono text-[11px] text-cyan-300 overflow-x-auto max-h-36 leading-relaxed">
{`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>SAAS v.3 PJOK</title>
</head>
<body>
  <script>
    // Otomatis mengalihkan ke aplikasi SAAS v.3 PJOK tanpa hambatan iframe
    if (window.top) {
      window.top.location.href = "https://ais-pre-wsma5ssmuqhq4uisgonem3-768538907806.asia-southeast1.run.app";
    } else {
      window.location.href = "https://ais-pre-wsma5ssmuqhq4uisgonem3-768538907806.asia-southeast1.run.app";
    }
  </script>
</body>
</html>`}
              </pre>
            </div>
          </div>
        )}

        {/* Live Preview Matrix before Apply */}
        {parsedData && (
          <div className="mt-6 pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-slate-900 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-emerald-600" />
                Pratinjau Data Google Sheets ({parsedData.students.length} Siswa)
              </div>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                Siap Disinkronkan
              </span>
            </div>

            <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl bg-white">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b">
                  <tr>
                    <th className="p-2 text-center w-10">NO</th>
                    <th className="p-2">NIS</th>
                    <th className="p-2">NAMA SISWA</th>
                    <th className="p-2 text-center">L/P</th>
                    <th className="p-2 text-center">TOTAL SKOR</th>
                    <th className="p-2 text-center">% NILAI</th>
                    <th className="p-2 text-center">STATUS</th>
                    <th className="p-2 text-center">REMEDIAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedData.scoreEntries.map((st, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-2 font-mono text-slate-600">{st.nis}</td>
                      <td className="p-2 font-bold text-slate-900">{st.name}</td>
                      <td className="p-2 text-center font-semibold text-slate-500">
                        {parsedData.students[idx]?.gender || 'L'}
                      </td>
                      <td className="p-2 text-center font-bold text-emerald-700">
                        {st.totalScore} / {phItem.totalMaxScore}
                      </td>
                      <td className="p-2 text-center font-bold">{st.percentage}%</td>
                      <td className="p-2 text-center">
                        {st.percentage >= phItem.kkm ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            TUNTAS
                          </span>
                        ) : (
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            REMEDIAL
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-center font-bold text-indigo-700">
                        {st.remedialScore ?? '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 italic">
                * Mengeklik "Terapkan Data" akan memperbarui daftar siswa dan nilai UH {phItem.code} untuk Kelas {selectedClass}.
              </span>

              <button
                type="button"
                onClick={handleApplyImport}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                <span>Terapkan & Sinkronkan Data ke App</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
