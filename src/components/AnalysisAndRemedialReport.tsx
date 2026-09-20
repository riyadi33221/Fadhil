import React, { useState } from 'react';
import { AssessmentItem, ClassId, RemedialProgramConfig, SchoolProfile, ScoreRecord, Student } from '../types';
import {
  CheckCircle2,
  XCircle,
  Award,
  BookOpen,
  Calendar,
  Sparkles,
  Edit,
  Save,
  Check,
  UserCheck,
  AlertCircle,
  FileText,
  Home,
  Printer,
} from 'lucide-react';

interface AnalysisAndRemedialReportProps {
  profile: SchoolProfile;
  selectedClass: ClassId;
  phItem: AssessmentItem;
  students: Student[];
  scores: ScoreRecord[];
  onUpdateScoreRecord: (updated: ScoreRecord) => void;
  onOpenAiModal: () => void;
  onOpenPrintModal?: (mode: 'matrix' | 'analysis' | 'lkpd' | 'remedial_final') => void;
  onGoToHome?: () => void;
}

export const AnalysisAndRemedialReport: React.FC<AnalysisAndRemedialReportProps> = ({
  profile,
  selectedClass,
  phItem,
  students,
  scores,
  onUpdateScoreRecord,
  onOpenAiModal,
  onOpenPrintModal,
  onGoToHome,
}) => {
  // Config state for execution methods & dates
  const [executionConfig, setExecutionConfig] = useState<RemedialProgramConfig>({
    perbaikanMethods: [
      `Penjelasan kembali materi dan indikator ${profile.subject || 'PJOK'} yang belum dikuasai`,
      'Pemberian Tugas Tambahan / Latihan Soal Mandiri',
      'Bimbingan perorangan dan penyelesaian soal/tugas remedial',
    ],
    pengayaanMethods: [
      'Membantu teman yang belum mencapai ketuntasan belajar minimal (Tutor Sebaya)',
      'Memperdalam materi tingkat lanjut dan pengayaan kompetensi',
    ],
    executionDate: profile.reportDate,
  });

  const [isEditingConfig, setIsEditingConfig] = useState(false);

  // Class students sorted alphabetically by name
  const classStudents = students
    .filter((s) => s.classId === selectedClass)
    .sort((a, b) => a.name.localeCompare(b.name, 'id', { sensitivity: 'base' }));
  const totalStudents = classStudents.length;

  // Map student scores
  const classScores: { student: Student; record?: ScoreRecord }[] = classStudents.map((student) => {
    const record = scores.find((s) => s.studentId === student.id && s.phId === phItem.id);
    return { student, record };
  });

  // Calculate statistics
  const passedStudents = classScores.filter((item) => item.record?.isPassed);
  const remedialStudents = classScores.filter((item) => !item.record?.isPassed);

  const passedCount = passedStudents.length;
  const remedialCount = remedialStudents.length;

  const passPercentage = totalStudents > 0 ? Math.round((passedCount / totalStudents) * 100) : 0;
  const isKlasikalPassed = passPercentage >= 80;

  // Handler for updating remedial score
  const handleRemedialScoreChange = (
    student: Student,
    currentRecord: ScoreRecord | undefined,
    val: number
  ) => {
    let newRemedialScore: number;
    let postRemedialPercentage: number;

    if (val > phItem.totalMaxScore) {
      postRemedialPercentage = Math.min(100, Math.max(0, val));
      newRemedialScore = Math.round((postRemedialPercentage / 100) * phItem.totalMaxScore);
    } else {
      newRemedialScore = Math.min(phItem.totalMaxScore, Math.max(0, val));
      postRemedialPercentage = Math.round((newRemedialScore / phItem.totalMaxScore) * 100);
    }

    const isPassedPostRemedial = postRemedialPercentage >= phItem.kkm;

    const baseRecord: ScoreRecord = currentRecord || {
      studentId: student.id,
      phId: phItem.id,
      classId: selectedClass,
      itemScores: new Array(phItem.itemMaxScores.length).fill(0),
      totalScore: 0,
      percentageScore: 0,
      isPassed: false,
    };

    const updated: ScoreRecord = {
      ...baseRecord,
      remedialScore: newRemedialScore,
      postRemedialPercentage,
      isPassedPostRemedial,
    };

    onUpdateScoreRecord(updated);
  };

  return (
    <div className="space-y-6">
      
      {/* Document Header Card (Matching PDF Page 2) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="pb-4 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3">
            {onGoToHome && (
              <button
                onClick={onGoToHome}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 font-bold text-xs rounded-xl border border-slate-300 transition-all"
                title="Kembali ke Halaman Depan (Matriks Penilaian Harian)"
              >
                <Home className="w-4 h-4 text-indigo-600" />
                <span>Kembali ke Halaman Depan</span>
              </button>
            )}

            {onOpenPrintModal && (
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => onOpenPrintModal('analysis')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                  title="Simpan / Cetak Laporan Analisis & Remedial (PDF Hal 2)"
                >
                  <Printer className="w-4 h-4 text-cyan-200" />
                  <span>PDF Hal 2</span>
                </button>

                <button
                  onClick={() => onOpenPrintModal('lkpd')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                  title="Simpan / Cetak LKPD (PDF Hal 3)"
                >
                  <FileText className="w-4 h-4 text-amber-200" />
                  <span>PDF Hal 3 (LKPD)</span>
                </button>

                <button
                  onClick={() => onOpenPrintModal('remedial_final')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                  title="Simpan / Cetak Daftar Nilai Akhir Hasil Perbaikan (PDF Hal 4)"
                >
                  <FileText className="w-4 h-4 text-amber-200" />
                  <span>PDF Hal 4 (Nilai Akhir)</span>
                </button>
              </div>
            )}
          </div>

          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              HASIL ANALISIS ULANGAN HARIAN
            </h2>
            <h3 className="text-base sm:text-lg font-bold text-emerald-700 mt-0.5">
              PROGRAM PERBAIKAN DAN PENGAYAAN
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Mata Pelajaran: <strong>{profile.subject}</strong> • Kelas: <strong>{selectedClass}</strong> • TP/Materi: <strong>{phItem.title}</strong>
            </p>
          </div>
        </div>

        {/* Section A: HASIL ANALISIS */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="bg-emerald-600 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-xs">A</span>
              HASIL ANALISIS
            </h4>

            <button
              onClick={onOpenAiModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold rounded-xl transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Rekomendasi AI Remedial</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
            {/* 1. Ketuntasan Belajar */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 text-xs uppercase tracking-wide">
                1. Ketuntasan Belajar
              </div>
              <div className="space-y-1 text-slate-700">
                <div className="flex justify-between">
                  <span>a. Jumlah siswa seluruhnya:</span>
                  <strong className="text-slate-900">{totalStudents} Orang</strong>
                </div>
                <div className="flex justify-between">
                  <span>b. Siswa tuntas (Nilai &ge; {phItem.kkm}):</span>
                  <strong className="text-emerald-700">{passedCount} Orang</strong>
                </div>
                <div className="flex justify-between">
                  <span>c. Persentase ketuntasan:</span>
                  <strong className="text-emerald-700 text-sm">{passPercentage}%</strong>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span>d. Ketuntasan Klasikal:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      isKlasikalPassed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isKlasikalPassed ? 'TUNTAS' : 'BELUM TUNTAS'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Kesimpulan */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 text-xs uppercase tracking-wide">
                2. Kesimpulan Program
              </div>
              <div className="space-y-2 text-slate-700">
                <div className="flex items-center justify-between bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                  <span className="font-medium text-rose-900">a. Perlu Perbaikan (Remedial):</span>
                  <strong className="text-rose-700 text-base">{remedialCount} Orang</strong>
                </div>
                <div className="flex items-center justify-between bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  <span className="font-medium text-emerald-900">b. Perlu Pengayaan:</span>
                  <strong className="text-emerald-700 text-base">{passedCount} Orang</strong>
                </div>
              </div>
            </div>

            {/* 3. Keterangan Daya Serap */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 border-b border-slate-200 pb-1 text-xs uppercase tracking-wide">
                3. Keterangan Standar Daya Serap
              </div>
              <div className="space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
                <p>
                  <strong>a. Daya Serap Perorangan:</strong> Seorang siswa disebut telah tuntas belajar apabila ia telah mencapai KKM ({phItem.kkm}%).
                </p>
                <p>
                  <strong>b. Daya Serap Klasikal:</strong> Satu kelas dikatakan tuntas klasikal apabila diperoleh &ge; 80% siswa telah mencapai KKM di kelas {selectedClass}.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section B: PROGRAM PERBAIKAN DAN PENGAYAAN */}
        <div className="mt-8 space-y-4 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="bg-emerald-600 text-white w-6 h-6 rounded-full inline-flex items-center justify-center text-xs">B</span>
              PROGRAM PERBAIKAN DAN PENGAYAAN
            </h4>

            <button
              onClick={() => setIsEditingConfig(!isEditingConfig)}
              className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>{isEditingConfig ? 'Tutup Edit' : 'Edit Metode'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-600 italic">
            Analisis hasil ulangan harian digunakan sebagai dasar program perbaikan dan pengayaan siswa {profile.subject || 'PJOK'}:
          </p>

          {isEditingConfig ? (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Pelaksanaan Perbaikan (Remedial):</label>
                <textarea
                  rows={3}
                  value={executionConfig.perbaikanMethods.join('\n')}
                  onChange={(e) =>
                    setExecutionConfig({
                      ...executionConfig,
                      perbaikanMethods: e.target.value.split('\n').filter((s) => s.trim() !== ''),
                    })
                  }
                  className="w-full p-2 border rounded-lg bg-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Pelaksanaan Pengayaan:</label>
                <textarea
                  rows={2}
                  value={executionConfig.pengayaanMethods.join('\n')}
                  onChange={(e) =>
                    setExecutionConfig({
                      ...executionConfig,
                      pengayaanMethods: e.target.value.split('\n').filter((s) => s.trim() !== ''),
                    })
                  }
                  className="w-full p-2 border rounded-lg bg-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Tanggal Pelaksanaan / Laporan:</label>
                <input
                  type="text"
                  value={executionConfig.executionDate}
                  onChange={(e) => setExecutionConfig({ ...executionConfig, executionDate: e.target.value })}
                  className="px-3 py-1.5 border rounded-lg bg-white"
                />
              </div>
            </div>
          ) : (
            <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-md">
              <h3 className="text-indigo-300 text-xs font-bold uppercase mb-4 tracking-wider">
                Rencana Tindak Lanjut ({phItem.code}: {phItem.title})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Perbaikan */}
                <div className="bg-indigo-800/60 rounded-xl p-4 border border-indigo-700 space-y-2">
                  <div className="font-bold text-amber-400 text-xs uppercase tracking-wide flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    A. REMEDIAL ({remedialCount} Siswa)
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-indigo-100 pl-1">
                    {executionConfig.perbaikanMethods.map((m, idx) => (
                      <li key={idx} className="leading-relaxed">{m}</li>
                    ))}
                  </ol>
                </div>

                {/* Pengayaan */}
                <div className="bg-indigo-800/60 rounded-xl p-4 border border-indigo-700 space-y-2">
                  <div className="font-bold text-emerald-400 text-xs uppercase tracking-wide flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-400" />
                    B. PENGAYAAN ({passedCount} Siswa)
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-indigo-100 pl-1">
                    {executionConfig.pengayaanMethods.map((m, idx) => (
                      <li key={idx} className="leading-relaxed">{m}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* C. Meta Data Banner */}
          <div className="bg-slate-100 p-3 rounded-lg text-xs grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700">
            <div>1. Tanggal: <strong>{executionConfig.executionDate}</strong></div>
            <div>2. Semester: <strong>{profile.semester}</strong></div>
            <div>3. Kelas: <strong>{selectedClass}</strong></div>
            <div>4. KKM: <strong>{phItem.kkm}</strong></div>
          </div>
        </div>
      </div>

      {/* Section C: DATA PERBAIKAN HASIL BELAJAR SISWA (Table PDF Page 2) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              DATA PERBAIKAN & HASIL REMEDIAL SISWA
            </h3>
            <p className="text-xs text-slate-300">
              Daftar siswa kelas {selectedClass} yang mengikuti program remedial untuk {phItem.code} ({phItem.title})
            </p>
          </div>
          <span className="bg-rose-500/20 text-rose-300 text-xs font-semibold px-3 py-1 rounded-full border border-rose-500/30">
            {remedialCount} Siswa Perlu Remedial
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 font-bold uppercase tracking-wider">
                <th className="p-3 text-center border-r border-slate-300 w-12">NO</th>
                <th className="p-3 border-r border-slate-300 min-w-[200px]">NAMA SISWA</th>
                <th colSpan={2} className="p-2 text-center border-r border-slate-300 bg-slate-200">
                  HASIL NILAI (0 - 100)
                </th>
                <th className="p-3 text-center border-r border-slate-300 min-w-[120px]">KETERANGAN</th>
                <th className="p-3 border-r border-slate-300">CATATAN / STRATEGI REMEDIAL</th>
              </tr>
              <tr className="bg-slate-50 border-b border-slate-300 text-slate-700 font-semibold text-[11px]">
                <th className="p-1 border-r border-slate-300"></th>
                <th className="p-1 border-r border-slate-300"></th>
                <th className="p-2 text-center border-r border-slate-300 bg-rose-50 text-rose-900 w-28">
                  UH (AWAL)
                </th>
                <th className="p-2 text-center border-r border-slate-300 bg-emerald-50 text-emerald-900 w-32">
                  PERBAIKAN (REMEDIAL)
                </th>
                <th className="p-1 border-r border-slate-300"></th>
                <th className="p-1"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {remedialStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-emerald-700 font-semibold bg-emerald-50/50">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
                    Luar biasa! Seluruh siswa kelas {selectedClass} telah tuntas pada {phItem.code}.
                  </td>
                </tr>
              ) : (
                remedialStudents.map(({ student, record }, index) => {
                  const initialPercentage = record?.percentageScore ?? 0;
                  const remedialScore = record?.remedialScore ?? '';
                  const postRemedialPercentage = record?.postRemedialPercentage;
                  const isPassedPostRemedial = record?.isPassedPostRemedial ?? false;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-center border-r border-slate-200 font-medium text-slate-600">
                        {index + 1}
                      </td>

                      <td className="p-3 border-r border-slate-200 font-semibold text-slate-900">
                        {student.name}
                        <div className="text-[10px] text-slate-400 font-normal">NIS: {student.nis}</div>
                      </td>

                      <td className="p-3 text-center border-r border-slate-200 bg-rose-50/50 font-bold text-rose-900 text-sm">
                        {initialPercentage}%
                      </td>

                      <td className="p-2 text-center border-r border-slate-200 bg-emerald-50/30">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max={phItem.totalMaxScore}
                            placeholder="Skor..."
                            value={remedialScore}
                            onChange={(e) =>
                              handleRemedialScoreChange(
                                student,
                                record,
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-16 text-center py-1 bg-white border border-slate-300 rounded font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                          />
                          <span className="text-[10px] font-bold text-emerald-800">
                            ({postRemedialPercentage ?? initialPercentage}%)
                          </span>
                        </div>
                      </td>

                      <td className="p-3 text-center border-r border-slate-200">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isPassedPostRemedial
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isPassedPostRemedial ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Tuntas
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-rose-600" /> Belum Tuntas
                            </>
                          )}
                        </span>
                      </td>

                      <td className="p-3 border-r border-slate-200 text-slate-700 italic">
                        {record?.remedialNotes || 'Bimbingan ulang dan latihan fisik mandiri'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Signature Box matching Page 2 PDF */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 text-xs text-slate-800">
          <div className="grid grid-cols-2 gap-8 text-center max-w-3xl mx-auto pt-4">
            <div>
              <p className="mb-12 font-medium">Mengetahui,<br />Kepala {profile.schoolName}</p>
              <p className="font-bold text-slate-900 underline text-sm">{profile.principalName}</p>
              <p className="text-slate-500">NIP. {profile.principalNip}</p>
            </div>

            <div>
              <p className="mb-12 font-medium">
                {profile.location}, {executionConfig.executionDate}<br />Guru Mata Pelajaran {profile.subject || 'PJOK'}
              </p>
              <p className="font-bold text-slate-900 underline text-sm">{profile.teacherName}</p>
              <p className="text-slate-500">NIP. {profile.teacherNip}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
