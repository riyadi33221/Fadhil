import React from 'react';
import { AssessmentItem, ClassId, SchoolProfile } from '../types';
import { FileText, Printer, Home, BookOpen, CheckCircle2, HelpCircle, User, Award, PenTool } from 'lucide-react';

interface LkpdSheetViewProps {
  profile: SchoolProfile;
  selectedClass: ClassId;
  phItem: AssessmentItem;
  onOpenPrintModal?: (mode: 'matrix' | 'analysis' | 'lkpd' | 'remedial_final') => void;
  onGoToHome?: () => void;
}

export const LkpdSheetView: React.FC<LkpdSheetViewProps> = ({
  profile,
  selectedClass,
  phItem,
  onOpenPrintModal,
  onGoToHome,
}) => {
  const questionCount = phItem.itemMaxScores.length;

  // Custom question prompt generator based on PJOK TP and Question Number
  const getQuestionPrompt = (index: number, maxScore: number) => {
    const topicTitle = phItem.title;
    const tpText = phItem.learningObjective;

    const prompts = [
      {
        title: `Aspek 1: Pemahaman Konsep & Teknik Dasar (${topicTitle})`,
        instruction: `Jelaskan secara ringkas konsep dasar dan aturan keselamatan dalam melakukan aktivitas/gerakan ${topicTitle} sesuai Tujuan Pembelajaran!`,
      },
      {
        title: `Aspek 2: Analisis Variasi & Kombinasi Gerakan`,
        instruction: `Sebutkan dan uraikan urutan gerakan yang benar dari tahap persiapan, pelaksanaan, hingga sikap akhir pada materi ${topicTitle}!`,
      },
      {
        title: `Aspek 3: Identifikasi Kesalahan & Solusi Perbaikan (Troubleshooting)`,
        instruction: `Tuliskan 2 (dua) kesalahan umum yang sering terjadi saat melakukan gerakan ${topicTitle} serta bagaimana cara memperbaikinya!`,
      },
      {
        title: `Aspek 4: Penerapan Nilai Sportivitas & Kerjasama Tim`,
        instruction: `Bagaimana penerapan nilai sportivitas, tanggung jawab, dan kerjasama yang kamu lakukan selama proses pembelajaran dan praktikum ${topicTitle}?`,
      },
      {
        title: `Aspek 5: Refleksi Diri & Praktik Lapangan`,
        instruction: `Tuliskan hasil refleksi tingkat penguasaan gerakanmu pada materi ${topicTitle} serta target perbaikan fisik/teknik yang ingin dicapai!`,
      },
      {
        title: `Aspek 6: Evaluasi Praktik & Bimbingan Mandiri`,
        instruction: `Uraikan bentuk latihan mandiri atau tugas perbaikan yang perlu kamu lakukan untuk meningkatkan keterampilan pada aspek ini!`,
      },
    ];

    if (index < prompts.length) {
      return prompts[index];
    }

    return {
      title: `Aspek ${index + 1}: Analisis Keterampilan Soal ${index + 1}`,
      instruction: `Lakukan analisis dan selesaikan tugas praktik/teori materi ${topicTitle} sesuai petunjuk instruksi dari Guru ${profile.subject || 'PJOK'}!`,
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl flex-shrink-0">
              <FileText className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-500/10 text-amber-800 font-bold text-[11px] px-2.5 py-0.5 rounded-full border border-amber-300">
                  Dokumen PDF Halaman 3
                </span>
                <span className="text-slate-400 text-xs font-semibold">SAAS v.3 {profile.subject || 'PJOK'}</span>
              </div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                Lembar Kerja Peserta Didik (LKPD) - {phItem.code}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onGoToHome && (
              <button
                onClick={onGoToHome}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-all"
              >
                <Home className="w-4 h-4 text-indigo-600" />
                <span>Kembali ke Depan</span>
              </button>
            )}

            {onOpenPrintModal && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => onOpenPrintModal('lkpd')}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  title="Cetak atau Simpan LKPD sebagai PDF Halaman 3"
                >
                  <Printer className="w-4 h-4 text-amber-200" />
                  <span>Simpan PDF Hal 3 (LKPD)</span>
                </button>

                <button
                  onClick={() => onOpenPrintModal('remedial_final')}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                  title="Cetak atau Simpan Daftar Nilai Akhir Hasil Perbaikan sebagai PDF Halaman 4"
                >
                  <Printer className="w-4 h-4 text-amber-200" />
                  <span>Simpan PDF Hal 4 (Nilai Akhir)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* LKPD Overview Meta */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[11px] font-semibold block">Asemen/UH:</span>
            <strong className="text-slate-900 text-sm block">{phItem.code}: {phItem.title}</strong>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[11px] font-semibold block">Kelas & Mata Pelajaran:</span>
            <strong className="text-slate-900 text-sm block">Kelas {selectedClass} • {profile.subject}</strong>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 text-[11px] font-semibold block">Total Skor Maksimal & KKM:</span>
            <strong className="text-emerald-700 text-sm block">
              {phItem.totalMaxScore} Poin • KKM: {phItem.kkm}
            </strong>
          </div>
        </div>
      </div>

      {/* Visual Paper Box Preview */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-300 text-slate-900 font-sans space-y-6">
        {/* Official Header Kop */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3 text-center">
          <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
            <img
              src={profile.logoUrl || 'https://lh3.googleusercontent.com/d/1q-uihP_9bDg8jusw9As1Qkw_G6CdCKwA'}
              alt="Logo Sekolah"
              className="max-w-full max-h-full object-contain"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-1 px-2">
            <h1 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              PEMERINTAH KABUPATEN PURBALINGGA
            </h1>
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-900">
              DINAS PENDIDIKAN DAN KEBUDAYAAN
            </h2>
            <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900">
              {profile.schoolName}
            </h3>
            <p className="text-[10px] text-slate-600 italic">
              {profile.schoolAddress}
            </p>
          </div>
          <div className="w-16 h-16 flex-shrink-0 hidden sm:block" />
        </div>

        {/* LKPD Title */}
        <div className="text-center space-y-1">
          <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-slate-900 border-b-2 border-slate-900 inline-block px-4 pb-0.5">
            LEMBAR KERJA PESERTA DIDIK (LKPD)
          </h2>
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            ASESMEN LINGKUP MATERI ({phItem.code}: {phItem.title})
          </p>
        </div>

        {/* Student Identity Form Box */}
        <div className="border border-slate-900 p-3 rounded-lg text-xs space-y-2 bg-slate-50/50">
          <div className="font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 flex items-center gap-1.5">
            <User className="w-4 h-4 text-indigo-600" />
            IDENTITAS PESERTA DIDIK
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
            <div className="flex items-center gap-2">
              <span className="w-28 font-semibold text-slate-700">Nama Siswa</span>
              <span>: ............................................................................</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-28 font-semibold text-slate-700">Kelas / No. Absen</span>
              <span>: <strong className="text-slate-900">{selectedClass}</strong> / ..........</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-28 font-semibold text-slate-700">Mata Pelajaran</span>
              <span>: {profile.subject}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-28 font-semibold text-slate-700">Hari / Tanggal</span>
              <span>: ............................................................................</span>
            </div>
          </div>
        </div>

        {/* TP & Learning Objectives Box */}
        <div className="border border-slate-900 p-3 rounded-lg text-xs space-y-1.5 bg-indigo-50/30">
          <div className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-indigo-200 pb-1">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            CAPAIAN & TUJUAN PEMBELAJARAN (TP)
          </div>
          <div className="text-slate-800 leading-relaxed font-medium">
            <strong>Tujuan Pembelajaran:</strong> {phItem.learningObjective}
          </div>
          <div className="text-[11px] text-slate-600 pt-0.5 flex flex-wrap gap-4 font-semibold">
            <span>• Lingkup Materi: {phItem.topic}</span>
            <span>• Kriteria Ketuntasan Minimal (KKM): {phItem.kkm}</span>
            <span>• Total Skor Maksimal: {phItem.totalMaxScore}</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs space-y-1 bg-amber-50/60 p-3 rounded-lg border border-amber-200 text-amber-950">
          <div className="font-bold flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
            <HelpCircle className="w-4 h-4 text-amber-700" />
            PETUNJUK PENGERJAAN LKPD:
          </div>
          <ol className="list-decimal list-inside space-y-0.5 text-[11px] leading-relaxed text-amber-900">
            <li>Berdoalah sebelum memulai pengerjaan LKPD ini.</li>
            <li>Bacalah setiap instruksi soal / aspek penilaian dengan teliti.</li>
            <li>Kerjakan tugas praktik dan jawablah pertanyaan teori pada ruang jawaban yang telah disediakan.</li>
            <li>Mintalah bimbingan Guru PJOK apabila menemui kendala dalam melakukan praktik gerak.</li>
          </ol>
        </div>

        {/* Questions / Tasks Section matching itemMaxScores */}
        <div className="space-y-4 pt-2">
          <div className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b-2 border-slate-900 pb-1 flex items-center justify-between">
            <span>SOAL & LEMBAR AKTIVITAS PESERTA DIDIK</span>
            <span className="text-[11px] font-normal text-slate-600">({questionCount} Aspek Penilaian)</span>
          </div>

          <div className="space-y-4">
            {phItem.itemMaxScores.map((maxScore, idx) => {
              const qInfo = getQuestionPrompt(idx, maxScore);
              return (
                <div key={idx} className="border border-slate-300 rounded-xl p-3.5 bg-white space-y-2">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-1.5">
                    <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white inline-flex items-center justify-center text-[11px] font-bold">
                        {idx + 1}
                      </span>
                      <span>{qInfo.title}</span>
                    </div>
                    <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-300">
                      Skor Maks: {maxScore}
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 font-medium leading-relaxed pl-1">
                    {qInfo.instruction}
                  </p>

                  {/* Answer Lines / Writing Box */}
                  <div className="mt-2 border border-slate-300 rounded-lg p-2.5 bg-slate-50/30 min-h-[70px] space-y-2">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Lembar Jawaban / Catatan Aktivitas Siswa:
                    </div>
                    <div className="border-b border-dotted border-slate-300 h-4"></div>
                    <div className="border-b border-dotted border-slate-300 h-4"></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Teacher Scoring Rubric Summary Table */}
        <div className="border border-slate-900 rounded-xl p-3 bg-slate-50 space-y-2 text-xs">
          <div className="font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between border-b border-slate-300 pb-1">
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              REKAPITULASI PENILAIAN GURU (HALAMAN 3)
            </span>
            <span className="text-[11px] text-slate-600 font-normal">Diisi oleh Guru {profile.subject || 'PJOK'}</span>
          </div>

          <table className="w-full text-center border-collapse border border-slate-900 text-[11px]">
            <thead>
              <tr className="bg-slate-200 font-bold border-b border-slate-900">
                {phItem.itemMaxScores.map((_, i) => (
                  <th key={i} className="border border-slate-900 p-1">Soal {i + 1}</th>
                ))}
                <th className="border border-slate-900 p-1">Total Skor</th>
                <th className="border border-slate-900 p-1">Nilai Akhir (%)</th>
                <th className="border border-slate-900 p-1">Status Ketuntasan</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {phItem.itemMaxScores.map((_, i) => (
                  <td key={i} className="border border-slate-900 p-2 text-slate-300">......</td>
                ))}
                <td className="border border-slate-900 p-2 text-slate-300 font-bold">... / {phItem.totalMaxScore}</td>
                <td className="border border-slate-900 p-2 text-slate-300 font-bold">...... %</td>
                <td className="border border-slate-900 p-2 text-slate-400 italic">TUNTAS / REMEDIAL</td>
              </tr>
            </tbody>
          </table>

          <div className="pt-1 text-[11px]">
            <span className="font-bold text-slate-800">Catatan & Umpan Balik Guru:</span>
            <div className="border-b border-slate-300 h-5 mt-1"></div>
          </div>
        </div>

        {/* Signature Block */}
        <div className="grid grid-cols-2 text-center text-xs pt-4 border-t border-slate-300">
          <div>
            <p className="mb-12">Mengetahui,<br />Kepala {profile.schoolName}</p>
            <p className="font-bold underline text-slate-900 uppercase">{profile.principalName}</p>
            <p className="text-slate-600 text-[11px]">NIP. {profile.principalNip}</p>
          </div>

          <div>
            <p className="mb-12">
              {profile.location}, {profile.reportDate}<br />Guru Mata Pelajaran {profile.subject || 'PJOK'}
            </p>
            <p className="font-bold underline text-slate-900 uppercase">{profile.teacherName}</p>
            <p className="text-slate-600 text-[11px]">NIP. {profile.teacherNip}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
