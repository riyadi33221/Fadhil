import React, { useState } from 'react';
import { ClassId, Student } from '../types';
import { INITIAL_STUDENTS } from '../data/initialData';
import { UserPlus, X, Trash2, FileSpreadsheet, Download, Upload, CheckCircle2, Edit2, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface StudentManagerModalProps {
  selectedClass: ClassId;
  students: Student[];
  onAddStudent: (newStudent: Omit<Student, 'id'>) => void;
  onImportStudents?: (newStudents: Omit<Student, 'id'>[]) => void;
  onUpdateStudent?: (updated: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onDeleteAllStudents?: (classId: ClassId) => void;
  onDeleteDemoStudents?: (classId?: ClassId) => void;
  onClose: () => void;
}

export const StudentManagerModal: React.FC<StudentManagerModalProps> = ({
  selectedClass,
  students,
  onAddStudent,
  onImportStudents,
  onUpdateStudent,
  onDeleteStudent,
  onDeleteAllStudents,
  onDeleteDemoStudents,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'excel'>('excel');
  const [name, setName] = useState('');
  const [nis, setNis] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState(false);

  const classStudents = students
    .filter((s) => s.classId === selectedClass)
    .sort((a, b) => a.name.localeCompare(b.name, 'id', { sensitivity: 'base' }));

  // Submit Manual Form
  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddStudent({
      name: name.trim(),
      nis: nis.trim() || `2025${Math.floor(1000 + Math.random() * 9000)}`,
      gender,
      classId: selectedClass,
    });

    setName('');
    setNis('');
    setImportStatus(`Siswa "${name.trim()}" berhasil ditambahkan!`);
    setTimeout(() => setImportStatus(null), 3000);
  };

  // Download Excel Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'No': 1,
        'NIS': '20250701',
        'Nama Lengkap': 'Adelia Putri Pratama',
        'Jenis Kelamin (L/P)': 'P',
      },
      {
        'No': 2,
        'NIS': '20250702',
        'Nama Lengkap': 'Ahmad Bagus Prasetyo',
        'Jenis Kelamin (L/P)': 'L',
      },
      {
        'No': 3,
        'NIS': '20250703',
        'Nama Lengkap': 'Amanda Nur Aini',
        'Jenis Kelamin (L/P)': 'P',
      },
      {
        'No': 4,
        'NIS': '20250704',
        'Nama Lengkap': 'Andika Dwi Saputra',
        'Jenis Kelamin (L/P)': 'L',
      },
      {
        'No': 5,
        'NIS': '20250705',
        'Nama Lengkap': 'Annisa Fitriani',
        'Jenis Kelamin (L/P)': 'P',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 6 },  // No
      { wch: 16 }, // NIS
      { wch: 32 }, // Nama Lengkap
      { wch: 22 }, // Jenis Kelamin
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Siswa_${selectedClass.replace(' ', '')}`);

    // Download file
    const fileName = `Template_Import_Siswa_PJOK_${selectedClass.replace(' ', '_')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Handle Upload Excel/CSV File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rawJson: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet);

        if (rawJson.length === 0) {
          setErrorMessage('File Excel kosong atau tidak terbaca data siswanya!');
          return;
        }

        const parsedStudents: Omit<Student, 'id'>[] = [];

        rawJson.forEach((row, index) => {
          // Flexible key lookup for NIS, Nama, Gender
          const nisVal = String(
            row['NIS'] || row['Nis'] || row['nis'] || row['NISN'] || row['Nisn'] || `2025${1000 + index}`
          ).trim();

          const nameVal = String(
            row['Nama Lengkap'] || row['Nama'] || row['NAMA'] || row['Nama Siswa'] || row['nama'] || ''
          ).trim();

          const genderValRaw = String(
            row['Jenis Kelamin (L/P)'] || row['Jenis Kelamin'] || row['JK'] || row['L/P'] || row['GENDER'] || 'L'
          ).trim().toUpperCase();

          const genderVal: 'L' | 'P' = genderValRaw.startsWith('P') || genderValRaw.startsWith('PEREMPUAN') ? 'P' : 'L';

          if (nameVal) {
            parsedStudents.push({
              name: nameVal,
              nis: nisVal,
              gender: genderVal,
              classId: selectedClass,
            });
          }
        });

        if (parsedStudents.length === 0) {
          setErrorMessage('Tidak ditemukan kolom "Nama Lengkap" atau "Nama" pada file Excel yang diunggah!');
          return;
        }

        if (onImportStudents) {
          onImportStudents(parsedStudents);
        } else {
          parsedStudents.forEach((st) => onAddStudent(st));
        }

        setErrorMessage(null);
        setImportStatus(`Berhasil mengimpor ${parsedStudents.length} siswa baru ke Kelas ${selectedClass}!`);
        e.target.value = ''; // reset file input
      } catch (err) {
        console.error('Import Error:', err);
        setErrorMessage('Terjadi kesalahan saat membaca file Excel. Pastikan format file sesuai template!');
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white text-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Kelola Daftar Siswa Kelas {selectedClass}
              </h3>
              <p className="text-xs text-slate-500">
                Total Siswa Terdaftar: <strong className="text-indigo-600">{classStudents.length} Siswa</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 font-bold text-xl rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection: Excel Import vs Manual */}
        <div className="flex border-b border-slate-200 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('excel')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'excel'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Import dari Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === 'manual'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Input Manual Satu per Satu</span>
          </button>
        </div>

        {/* Notification message */}
        {importStatus && (
          <div className="p-3 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{importStatus}</span>
            </div>
            <button onClick={() => setImportStatus(null)} className="text-emerald-700 font-bold">✕</button>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-700 font-bold">✕</button>
          </div>
        )}

        {/* TAB 1: Excel Import */}
        {activeTab === 'excel' && (
          <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 space-y-4 mb-5">
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold text-indigo-900 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                Langkah Import Data Siswa dari Excel:
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                1. Unduh template Excel yang sudah disiapkan di bawah ini.<br />
                2. Buka file di Excel/Google Sheets, isi NIS, Nama Lengkap, dan Jenis Kelamin (L/P).<br />
                3. Simpan dan unggah kembali file Excel tersebut ke dalam sistem.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Button Download Template */}
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 shadow-sm transition-all"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                <span>Unduh Template Excel</span>
              </button>

              {/* Button Upload Excel File */}
              <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Upload File Excel / CSV</span>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* TAB 2: Manual Form */}
        {activeTab === 'manual' && (
          <form onSubmit={handleSubmitManual} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 mb-4 text-xs">
            <div className="font-bold text-slate-900 text-xs">Tambah Siswa Baru ke {selectedClass}:</div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Nama Lengkap Siswa</label>
              <input
                type="text"
                placeholder="Contoh: Muhammad Bintang"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">NIS / NISN</label>
                <input
                  type="text"
                  placeholder="20250701"
                  value={nis}
                  onChange={(e) => setNis(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Jenis Kelamin</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'L' | 'P')}
                  className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="L">Laki-laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-sm"
            >
              + Simpan Siswa Baru
            </button>
          </form>
        )}

        {/* Existing Roster List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="font-bold text-xs text-slate-800">
              Daftar Siswa {selectedClass} ({classStudents.length} Siswa):
            </div>
            <div className="flex items-center gap-2">
              {onDeleteDemoStudents && classStudents.some((s) => s.id.startsWith('st-') || INITIAL_STUDENTS.some((init) => init.id === s.id)) && (
                <button
                  type="button"
                  onClick={() => onDeleteDemoStudents(selectedClass)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-[11px] font-bold transition-colors shadow-sm"
                  title="Hapus siswa demo bawaan aplikasi pada kelas ini"
                >
                  <Trash2 className="w-3 h-3 text-amber-600" />
                  <span>Hapus Siswa Demo Bawaan ({classStudents.filter((s) => s.id.startsWith('st-') || INITIAL_STUDENTS.some((init) => init.id === s.id)).length})</span>
                </button>
              )}
              {classStudents.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowConfirmDeleteAll(true)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200/80 rounded-lg text-[11px] font-bold transition-colors"
                  title="Hapus seluruh data siswa di kelas ini"
                >
                  <Trash2 className="w-3 h-3 text-rose-600" />
                  <span>Hapus Semua Siswa</span>
                </button>
              )}
              {classStudents.length === 0 && (
                <span className="text-[11px] text-amber-600 font-semibold">
                  Belum ada siswa di kelas ini
                </span>
              )}
            </div>
          </div>

          <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white">
            {classStudents.map((s, idx) => (
              <div key={s.id} className="p-2.5 text-xs flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-400 w-6 text-center">{idx + 1}.</span>
                  <div>
                    <span className="font-bold text-slate-900">{s.name}</span>
                    <span className="text-slate-400 text-[10px] ml-2">NIS: {s.nis} ({s.gender})</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingStudent(s)}
                    className="p-1.5 bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-700 rounded-lg transition-colors"
                    title="Edit Nama / NIS Siswa"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingStudent(s)}
                    className="p-1.5 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 rounded-lg transition-colors"
                    title="Hapus Siswa"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
          >
            Selesai
          </button>
        </div>

      </div>

      {/* SUB-MODAL 1: Confirm Delete Student */}
      {deletingStudent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Konfirmasi Hapus Siswa</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus siswa <strong>{deletingStudent.name}</strong> (NIS: {deletingStudent.nis}) dari Kelas <strong>{selectedClass}</strong>?
              <span className="block mt-1 text-rose-600 font-semibold">Tindakan ini tidak dapat dibatalkan.</span>
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingStudent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteStudent(deletingStudent.id);
                  setImportStatus(`Siswa "${deletingStudent.name}" berhasil dihapus.`);
                  setDeletingStudent(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Ya, Hapus Siswa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL 2: Edit Student Info */}
      {editingStudent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-indigo-600" />
                Edit Data Siswa
              </h3>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingStudent && onUpdateStudent) {
                  onUpdateStudent(editingStudent);
                  setImportStatus(`Data siswa "${editingStudent.name}" berhasil diperbarui.`);
                }
                setEditingStudent(null);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">NIS / NISN</label>
                  <input
                    type="text"
                    value={editingStudent.nis}
                    onChange={(e) => setEditingStudent({ ...editingStudent, nis: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Jenis Kelamin</label>
                  <select
                    value={editingStudent.gender}
                    onChange={(e) => setEditingStudent({ ...editingStudent, gender: e.target.value as 'L' | 'P' })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL 3: Confirm Delete All Students in Class */}
      {showConfirmDeleteAll && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Hapus Semua Siswa Kelas {selectedClass}
                </h3>
                <p className="text-xs text-rose-600 font-semibold">
                  Peringatan
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus <strong>SELURUH ({classStudents.length} SISWA)</strong> di Kelas <strong>{selectedClass}</strong>?
              <span className="block mt-2 font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                ⚠️ Semua data siswa, rekap nilai, dan analisis hasil penilaian untuk Kelas {selectedClass} akan dihapus.
              </span>
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfirmDeleteAll(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteAllStudents) {
                    onDeleteAllStudents(selectedClass);
                  } else {
                    classStudents.forEach((st) => onDeleteStudent(st.id));
                  }
                  setImportStatus(`Seluruh data siswa di Kelas ${selectedClass} telah berhasil dihapus.`);
                  setShowConfirmDeleteAll(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Semua Siswa ({classStudents.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
