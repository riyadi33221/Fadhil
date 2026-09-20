import React, { useState } from 'react';
import { AssessmentItem, ClassId, SchoolProfile, ScoreRecord, Student } from '../types';
import { Download, Loader2, Printer, X, FileCheck, Home, ArrowLeft } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface PrintableReportModalProps {
  mode: 'matrix' | 'analysis' | 'lkpd' | 'remedial_final';
  profile: SchoolProfile;
  selectedClass: ClassId;
  phItem: AssessmentItem;
  students: Student[];
  scores: ScoreRecord[];
  onClose: () => void;
}

// Helper to convert OKLCH color strings to RGB format to prevent html2canvas crashing on oklch()
const parseAndConvertOklch = (oklchMatch: string): string => {
  const subMatch = oklchMatch.match(/oklch\(\s*([\d.%-]+)\s+([\d.%-]+)\s+([\d.%-]+)(?:\s*\/\s*([\d.%-]+))?\s*\)/i);
  if (!subMatch) return 'rgb(0, 0, 0)';

  let [, p1, p2, p3, p4] = subMatch;
  let L = parseFloat(p1);
  if (p1.endsWith('%')) L /= 100;

  let C = parseFloat(p2);
  if (p2.endsWith('%')) C /= 100;

  let H = parseFloat(p3);

  let alpha = 1;
  if (p4 !== undefined) {
    alpha = parseFloat(p4);
    if (p4.endsWith('%')) alpha /= 100;
  }

  if (isNaN(L) || isNaN(C) || isNaN(H)) return 'rgb(0, 0, 0)';

  const hRad = (H * Math.PI) / 180;
  const oklabA = C * Math.cos(hRad);
  const oklabB = C * Math.sin(hRad);

  const l_ = L + 0.3963377774 * oklabA + 0.2158037573 * oklabB;
  const m_ = L - 0.1055613458 * oklabA - 0.0638541728 * oklabB;
  const s_ = L - 0.0894841775 * oklabA - 1.2914855480 * oklabB;

  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  const rLin = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  const transfer = (c: number) =>
    c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(Math.max(0, c), 1 / 2.4) - 0.055;

  const r = Math.round(Math.max(0, Math.min(255, transfer(rLin) * 255)));
  const g = Math.round(Math.max(0, Math.min(255, transfer(gLin) * 255)));
  const bVal = Math.round(Math.max(0, Math.min(255, transfer(bLin) * 255)));

  if (alpha < 1) {
    return `rgba(${r}, ${g}, ${bVal}, ${alpha.toFixed(3)})`;
  }
  return `rgb(${r}, ${g}, ${bVal})`;
};

// Helper to convert OKLAB color strings to RGB format to prevent html2canvas crashing on oklab()
const parseAndConvertOklab = (oklabMatch: string): string => {
  const subMatch = oklabMatch.match(/oklab\(\s*([\d.%-]+)\s+([\d.%-]+)\s+([\d.%-]+)(?:\s*\/\s*([\d.%-]+))?\s*\)/i);
  if (!subMatch) return 'rgb(0, 0, 0)';

  let [, p1, p2, p3, p4] = subMatch;
  let L = parseFloat(p1);
  if (p1.endsWith('%')) L /= 100;

  let a = parseFloat(p2);
  if (p2.endsWith('%')) a /= 100;

  let b = parseFloat(p3);
  if (p3.endsWith('%')) b /= 100;

  let alpha = 1;
  if (p4 !== undefined) {
    alpha = parseFloat(p4);
    if (p4.endsWith('%')) alpha /= 100;
  }

  if (isNaN(L) || isNaN(a) || isNaN(b)) return 'rgb(0, 0, 0)';

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  const rLin = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  const transfer = (c: number) =>
    c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(Math.max(0, c), 1 / 2.4) - 0.055;

  const r = Math.round(Math.max(0, Math.min(255, transfer(rLin) * 255)));
  const g = Math.round(Math.max(0, Math.min(255, transfer(gLin) * 255)));
  const bVal = Math.round(Math.max(0, Math.min(255, transfer(bLin) * 255)));

  if (alpha < 1) {
    return `rgba(${r}, ${g}, ${bVal}, ${alpha.toFixed(3)})`;
  }
  return `rgb(${r}, ${g}, ${bVal})`;
};

const tempCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
const tempCtx = tempCanvas ? tempCanvas.getContext('2d') : null;

const normalizeColorToRgb = (colorStr: string): string => {
  if (!colorStr) return colorStr;
  if (!colorStr.includes('oklch') && !colorStr.includes('oklab') && !colorStr.includes('color-mix')) {
    return colorStr;
  }

  if (tempCtx) {
    try {
      tempCtx.fillStyle = '#000000';
      tempCtx.fillStyle = colorStr;
      const comp = tempCtx.fillStyle;
      if (comp && comp !== '#000000' && !comp.includes('oklch') && !comp.includes('oklab') && !comp.includes('color-mix')) {
        return comp;
      }
      tempCtx.fillStyle = '#ffffff';
      tempCtx.fillStyle = colorStr;
      const compW = tempCtx.fillStyle;
      if (compW && !compW.includes('oklch') && !compW.includes('oklab') && !compW.includes('color-mix')) {
        return compW;
      }
    } catch (e) {
      // ignore
    }
  }

  if (colorStr.toLowerCase().startsWith('oklch')) {
    return parseAndConvertOklch(colorStr);
  } else if (colorStr.toLowerCase().startsWith('oklab')) {
    return parseAndConvertOklab(colorStr);
  }
  return 'rgba(0, 0, 0, 0.05)';
};

const sanitizeModernColorsFromCssText = (text: string): string => {
  if (!text || (!text.includes('oklch') && !text.includes('oklab') && !text.includes('color-mix'))) {
    return text;
  }

  let result = '';
  let i = 0;
  const len = text.length;

  while (i < len) {
    const sub = text.slice(i);
    const match = sub.match(/^(oklch|oklab|color-mix)\(/i);
    if (match) {
      const funcName = match[1].toLowerCase();
      const startIdx = i;
      let depth = 0;
      let endIdx = -1;

      for (let j = startIdx + match[0].length - 1; j < len; j++) {
        if (text[j] === '(') depth++;
        else if (text[j] === ')') {
          depth--;
          if (depth === 0) {
            endIdx = j;
            break;
          }
        }
      }

      if (endIdx !== -1) {
        const fullFunc = text.slice(startIdx, endIdx + 1);
        let converted = normalizeColorToRgb(fullFunc);
        if (converted.includes('oklch') || converted.includes('oklab') || converted.includes('color-mix')) {
          if (funcName === 'oklch') {
            converted = parseAndConvertOklch(fullFunc);
          } else if (funcName === 'oklab') {
            converted = parseAndConvertOklab(fullFunc);
          } else {
            converted = 'rgba(0, 0, 0, 0.05)';
          }
        }
        result += converted;
        i = endIdx + 1;
        continue;
      }
    }

    result += text[i];
    i++;
  }

  return result;
};

export const PrintableReportModal: React.FC<PrintableReportModalProps> = ({
  mode,
  profile,
  selectedClass,
  phItem,
  students,
  scores,
  onClose,
}) => {
  const [activeMode, setActiveMode] = useState<'matrix' | 'analysis' | 'lkpd' | 'remedial_final'>(
    mode || 'matrix'
  );
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const element = document.getElementById('print-area');
    if (!element) return;

    setIsDownloading(true);

    const titlePrefix =
      activeMode === 'matrix'
        ? 'ANALISIS_ASESMEN_HALAMAN_1'
        : activeMode === 'analysis'
        ? 'LAPORAN_REMEDIAL_HALAMAN_2'
        : activeMode === 'lkpd'
        ? 'LKPD_LEMBAR_KERJA_HALAMAN_3'
        : 'DAFTAR_NILAI_AKHIR_HASIL_PERBAIKAN_HALAMAN_4';

    const cleanSubject = (profile.subject || 'PJOK').replace(/[^a-zA-Z0-9]/g, '_');
    const cleanClass = selectedClass.replace(/\s+/g, '_');
    const cleanPh = phItem.code.replace(/\s+/g, '_');
    const fileName = `${titlePrefix}_${cleanSubject}_${cleanClass}_${cleanPh}.pdf`;

    const opt = {
      margin: [6, 8, 8, 8] as [number, number, number, number],
      filename: fileName,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (clonedDoc: Document) => {
          // 1. Sanitize all <style> tag contents in clonedDoc
          const styleEls = clonedDoc.querySelectorAll('style');
          styleEls.forEach((style) => {
            if (
              style.textContent &&
              (style.textContent.includes('oklch') ||
                style.textContent.includes('oklab') ||
                style.textContent.includes('color-mix'))
            ) {
              style.textContent = sanitizeModernColorsFromCssText(style.textContent);
            }
          });

          // 2. Process all stylesheets in clonedDoc
          try {
            Array.from(clonedDoc.styleSheets).forEach((sheet) => {
              try {
                const rules = sheet.cssRules;
                if (rules) {
                  for (let i = 0; i < rules.length; i++) {
                    const rule = rules[i] as CSSStyleRule;
                    if (
                      rule.cssText &&
                      (rule.cssText.includes('oklch') ||
                        rule.cssText.includes('oklab') ||
                        rule.cssText.includes('color-mix'))
                    ) {
                      if (rule.style) {
                        for (let k = 0; k < rule.style.length; k++) {
                          const propName = rule.style[k];
                          const propVal = rule.style.getPropertyValue(propName);
                          if (
                            propVal &&
                            (propVal.includes('oklch') ||
                              propVal.includes('oklab') ||
                              propVal.includes('color-mix'))
                          ) {
                            rule.style.setProperty(propName, sanitizeModernColorsFromCssText(propVal));
                          }
                        }
                      }
                    }
                  }
                }
              } catch (e) {
                // Cross-origin stylesheet error, ignore
              }
            });
          } catch (e) {
            // ignore
          }

          // 3. Sanitize all inline styles in clonedDoc
          const allEls = clonedDoc.querySelectorAll<HTMLElement>('*');
          allEls.forEach((el) => {
            if (
              el.style &&
              el.style.cssText &&
              (el.style.cssText.includes('oklch') ||
                el.style.cssText.includes('oklab') ||
                el.style.cssText.includes('color-mix'))
            ) {
              el.style.cssText = sanitizeModernColorsFromCssText(el.style.cssText);
            }
          });

          // 4. Compute and convert computed styles for print-area elements
          const printEl = clonedDoc.getElementById('print-area');
          if (printEl) {
            const printEls = [printEl, ...Array.from(printEl.querySelectorAll<HTMLElement>('*'))];
            const propsToSanitize = [
              'color',
              'backgroundColor',
              'borderColor',
              'borderTopColor',
              'borderBottomColor',
              'borderLeftColor',
              'borderRightColor',
              'outlineColor',
              'fill',
              'stroke',
              'boxShadow',
            ];
            printEls.forEach((el) => {
              try {
                const computed = window.getComputedStyle(el);
                propsToSanitize.forEach((prop) => {
                  const val = (computed as any)[prop];
                  if (
                    val &&
                    typeof val === 'string' &&
                    (val.includes('oklch') || val.includes('oklab') || val.includes('color-mix'))
                  ) {
                    (el.style as any)[prop] = sanitizeModernColorsFromCssText(val);
                  }
                });
              } catch (e) {
                // ignore
              }
            });
          }
        },
      },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
    };

    try {
      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
          setIsDownloading(false);
        })
        .catch((err: any) => {
          console.error('PDF error:', err);
          setIsDownloading(false);
          window.print();
        });
    } catch (err) {
      console.error(err);
      setIsDownloading(false);
      window.print();
    }
  };

  const classStudents = students
    .filter((s) => s.classId === selectedClass)
    .sort((a, b) => a.name.localeCompare(b.name, 'id', { sensitivity: 'base' }));
  const scoreMap = new Map<string, ScoreRecord>();
  scores.forEach((s) => {
    if (s.phId === phItem.id && s.classId === selectedClass) {
      scoreMap.set(s.studentId, s);
    }
  });

  // Calculate totals for matrix mode
  const questionCount = phItem.itemMaxScores.length;
  const questionSums = new Array(questionCount).fill(0);
  const questionMaxes = phItem.itemMaxScores.map((m) => m * classStudents.length);
  let grandTotalScore = 0;
  let grandTotalMax = phItem.totalMaxScore * classStudents.length;

  classStudents.forEach((student) => {
    const record = scoreMap.get(student.id);
    if (record) {
      record.itemScores.forEach((s, idx) => {
        if (idx < questionCount) {
          questionSums[idx] += s;
        }
      });
      grandTotalScore += record.totalScore;
    }
  });

  const questionPercentages = questionSums.map((sum, idx) => {
    const maxPoss = questionMaxes[idx];
    return maxPoss > 0 ? Math.round((sum / maxPoss) * 100) : 0;
  });

  // Calculate stats for analysis mode & remedial final
  const passedStudents = classStudents.filter((s) => scoreMap.get(s.id)?.isPassed);
  const remedialStudents = classStudents.filter((s) => !scoreMap.get(s.id)?.isPassed);
  const passPercentage =
    classStudents.length > 0
      ? Math.round((passedStudents.length / classStudents.length) * 100)
      : 0;

  // Final scores calculations for Page 4
  let totalInitialScoresSum = 0;
  let totalFinalScoresSum = 0;
  let finalPassedCount = 0;

  const finalScoreRows = classStudents.map((student) => {
    const rec = scoreMap.get(student.id);
    const initialScore = rec?.percentageScore ?? 0;
    const isInitiallyPassed = rec?.isPassed ?? false;

    const remedialScoreVal =
      rec?.postRemedialPercentage !== undefined && rec?.postRemedialPercentage !== null
        ? rec.postRemedialPercentage
        : rec?.remedialScore !== undefined && rec?.remedialScore !== null
        ? rec.remedialScore
        : null;

    let finalScore = initialScore;
    if (isInitiallyPassed) {
      finalScore = initialScore;
    } else if (typeof remedialScoreVal === 'number') {
      finalScore = Math.max(initialScore, remedialScoreVal);
    }

    const isPassedFinal = finalScore >= phItem.kkm;
    if (isPassedFinal) {
      finalPassedCount++;
    }

    totalInitialScoresSum += initialScore;
    totalFinalScoresSum += finalScore;

    return {
      student,
      initialScore,
      isInitiallyPassed,
      remedialScoreVal,
      finalScore,
      isPassedFinal,
      notes: rec?.remedialNotes || (isInitiallyPassed ? 'Tuntas pada tes utama' : (isPassedFinal ? 'Tuntas setelah perbaikan' : 'Perlu bimbingan ulang')),
    };
  });

  const avgInitialScore = classStudents.length > 0 ? Math.round(totalInitialScoresSum / classStudents.length) : 0;
  const avgFinalScore = classStudents.length > 0 ? Math.round(totalFinalScoresSum / classStudents.length) : 0;
  const finalPassPct = classStudents.length > 0 ? Math.round((finalPassedCount / classStudents.length) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto print:static print:bg-transparent print:p-0 print:m-0 print:overflow-visible print:inset-auto">
      
      {/* Container */}
      <div className="bg-white text-slate-900 rounded-2xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl my-8 relative print:m-0 print:p-0 print:shadow-none print:max-w-none print:w-full print:rounded-none print:bg-white print:static">
        
        {/* Floating Top Bar (Hidden on Print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-200 gap-3 print:hidden">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-600" />
              <span>
                {activeMode === 'matrix' && 'Pratinjau Dokumen: Halaman 1 (Analisis Asesmen)'}
                {activeMode === 'analysis' && 'Pratinjau Dokumen: Halaman 2 (Laporan Analisis & Remedial)'}
                {activeMode === 'lkpd' && 'Pratinjau Dokumen: Halaman 3 (Lembar Kerja Peserta Didik / LKPD)'}
                {activeMode === 'remedial_final' && 'Pratinjau Dokumen: Halaman 4 (Daftar Nilai Akhir Hasil Perbaikan)'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Dokumen resmi siap cetak / simpan ke format PDF — {profile.schoolName}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Kembali ke Halaman Depan Button */}
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl border border-slate-300 transition-all shadow-sm"
              title="Kembali ke Halaman Depan Utama"
            >
              <Home className="w-4 h-4 text-indigo-600" />
              <span>Kembali ke Depan</span>
            </button>

            {/* Direct Download PDF Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all disabled:opacity-70"
              title="Unduh file .pdf langsung ke perangkat"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-amber-300" />
                  <span>
                    Unduh PDF ({activeMode === 'matrix' ? 'Hal 1' : activeMode === 'analysis' ? 'Hal 2' : activeMode === 'lkpd' ? 'Hal 3 (LKPD)' : 'Hal 4 (Nilai Akhir)'})
                  </span>
                </>
              )}
            </button>

            {/* Print / Save as PDF via Browser Dialog */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition-all"
              title="Buka dialog cetak browser (Bisa pilih 'Simpan sebagai PDF')"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 font-bold text-xl rounded-lg"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Page Switcher Tabs (Hidden on Print) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-bold print:hidden overflow-x-auto">
          <button
            onClick={() => setActiveMode('matrix')}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-lg transition-all text-center ${
              activeMode === 'matrix'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Halaman 1 (Matriks)
          </button>

          <button
            onClick={() => setActiveMode('analysis')}
            className={`flex-1 min-w-[130px] py-2 px-3 rounded-lg transition-all text-center ${
              activeMode === 'analysis'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Halaman 2 (Remedial)
          </button>

          <button
            onClick={() => setActiveMode('lkpd')}
            className={`flex-1 min-w-[130px] py-2 px-3 rounded-lg transition-all text-center ${
              activeMode === 'lkpd'
                ? 'bg-white text-amber-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Halaman 3 (LKPD)
          </button>

          <button
            onClick={() => setActiveMode('remedial_final')}
            className={`flex-1 min-w-[140px] py-2 px-3 rounded-lg transition-all text-center ${
              activeMode === 'remedial_final'
                ? 'bg-white text-emerald-800 shadow-sm border border-slate-200 ring-1 ring-emerald-500/30'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Halaman 4 (Nilai Akhir)
          </button>
        </div>

        {/* Tip Box for saving PDF (Hidden on Print) */}
        <div className="mb-5 p-3 bg-indigo-50/80 border border-indigo-200/80 rounded-xl text-xs text-indigo-900 flex items-start gap-2.5 print:hidden">
          <span className="text-base flex-shrink-0">💡</span>
          <div className="leading-relaxed">
            <strong>Petunjuk Simpan PDF:</strong> Klik tombol <strong className="text-indigo-700">"Unduh PDF"</strong> untuk mengunduh dokumen secara langsung, atau klik <strong className="text-slate-800">"Cetak / Simpan PDF"</strong> lalu pilih tujuan <em className="font-semibold">"Simpan sebagai PDF" (Save as PDF)</em> pada menu printer browser.
          </div>
        </div>

        {/* PRINT CONTENT AREA */}
        <div id="print-area" className="bg-white text-slate-900 text-xs leading-normal p-2 print:p-0 print:m-0">
          
          {/* Official Document Kop / Header */}
          <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-3 print:pt-0 print:mt-0 gap-2">
            <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
              <img
                src={profile.logoUrl || 'https://lh3.googleusercontent.com/d/1q-uihP_9bDg8jusw9As1Qkw_G6CdCKwA'}
                alt="Logo Sekolah"
                className="max-w-full max-h-full object-contain"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="text-center flex-1 px-1">
              <h1 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                PEMERINTAH KABUPATEN PURBALINGGA
              </h1>
              <h2 className="text-sm font-black uppercase tracking-wide text-slate-900">
                DINAS PENDIDIKAN DAN KEBUDAYAAN
              </h2>
              <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-slate-900">
                {profile.schoolName}
              </h3>
              <p className="text-[9.5px] text-slate-600 font-mono font-semibold tracking-wide -mt-0.5">
                copyright@poerwanto221,s.pd.
              </p>
              <p className="text-[10px] text-slate-600 italic">
                {profile.schoolAddress}
              </p>
            </div>
            <div className="w-16 h-16 flex-shrink-0 hidden sm:block" />
          </div>

          {/* MODE 1: MATRIKS PENILAIAN HARIAN (PDF HALAMAN 1) */}
          {activeMode === 'matrix' && (
            <div>
              <div className="text-center font-extrabold text-base mb-4 uppercase tracking-wide text-slate-900">
                ANALISIS ASESMEN LINGKUP MATERI (HALAMAN 1)
              </div>

              {/* Metadata Block */}
              <table className="w-full text-xs mb-4 border-none border-collapse">
                <tbody>
                  <tr>
                    <td className="py-0.5 font-semibold w-32">Mata Pelajaran</td>
                    <td className="py-0.5">: {profile.subject || 'PJOK'}</td>
                    <td className="py-0.5 font-semibold w-24">Kelas</td>
                    <td className="py-0.5">: {selectedClass}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 font-semibold">Tahun Ajaran</td>
                    <td className="py-0.5">: {profile.academicYear}</td>
                    <td className="py-0.5 font-semibold">Semester</td>
                    <td className="py-0.5">: {profile.semester}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 font-semibold">UH/Asesmen ke</td>
                    <td className="py-0.5">: {phItem.code}</td>
                    <td className="py-0.5 font-semibold">KKM</td>
                    <td className="py-0.5">: {phItem.kkm}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 font-semibold">Materi</td>
                    <td className="py-0.5" colSpan={3}>: {phItem.title}</td>
                  </tr>
                  <tr>
                    <td className="pt-1 font-bold" colSpan={4}>Tujuan Pembelajaran (TP) :</td>
                  </tr>
                  <tr>
                    <td className="pb-2 text-slate-800 leading-relaxed font-normal" colSpan={4}>
                      {phItem.learningObjective}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Main Matrix Table */}
              <table className="w-full text-[9.5px] sm:text-[10px] border-collapse border border-slate-900 text-center mb-4">
                <thead>
                  <tr className="bg-slate-100 font-bold border-b border-slate-900">
                    <th rowSpan={2} className="border border-slate-900 px-1 py-0.5 w-7">NO</th>
                    <th rowSpan={2} className="border border-slate-900 px-1 py-0.5 text-left min-w-[130px]">NAMA SISWA</th>
                    <th colSpan={questionCount} className="border border-slate-900 px-1 py-0.5 uppercase">
                      NOMOR SOAL/ASPEK ASESMEN/SKOR MAKS
                    </th>
                    <th rowSpan={2} className="border border-slate-900 px-1 py-0.5 w-11">Jumlah Skor</th>
                    <th rowSpan={2} className="border border-slate-900 px-1 py-0.5 w-12">Ketercapaian (%)</th>
                    <th colSpan={2} className="border border-slate-900 px-1 py-0.5">Ketuntasan Belajar</th>
                  </tr>
                  <tr className="bg-slate-50 font-bold border-b border-slate-900">
                    {phItem.itemMaxScores.map((maxS, idx) => (
                      <th key={idx} className="border border-slate-900 px-1 py-0.5 min-w-[22px]">
                        {idx + 1}<br />
                        <span className="font-normal text-[8.5px]">({maxS})</span>
                      </th>
                    ))}
                    <th className="border border-slate-900 px-1 py-0.5 w-7">Ya</th>
                    <th className="border border-slate-900 px-1 py-0.5 w-7">Tidak</th>
                  </tr>
                </thead>

                <tbody>
                  {classStudents.map((student, idx) => {
                    const rec = scoreMap.get(student.id);
                    const itemScores = rec?.itemScores || new Array(questionCount).fill(0);
                    const totalScore = rec?.totalScore ?? 0;
                    const percentageScore = rec?.percentageScore ?? 0;
                    const isPassed = rec?.isPassed ?? false;

                    return (
                      <tr key={student.id} className="border-b border-slate-900">
                        <td className="border border-slate-900 px-1 py-0.5">{idx + 1}</td>
                        <td className="border border-slate-900 px-1 py-0.5 text-left font-medium">{student.name}</td>
                        {itemScores.map((sc, qIdx) => (
                          <td key={qIdx} className="border border-slate-900 px-1 py-0.5 font-semibold">{sc}</td>
                        ))}
                        <td className="border border-slate-900 px-1 py-0.5 font-bold">{totalScore}</td>
                        <td className="border border-slate-900 px-1 py-0.5 font-bold">{percentageScore}%</td>
                        <td className="border border-slate-900 px-1 py-0.5">{isPassed ? '✓' : ''}</td>
                        <td className="border border-slate-900 px-1 py-0.5">{!isPassed ? '✓' : ''}</td>
                      </tr>
                    );
                  })}
                </tbody>

                <tfoot className="font-bold bg-slate-100">
                  <tr>
                    <td colSpan={2} className="border border-slate-900 px-1 py-0.5 text-right">Jumlah Skor</td>
                    {questionSums.map((sum, idx) => (
                      <td key={idx} className="border border-slate-900 px-1 py-0.5">{sum}</td>
                    ))}
                    <td className="border border-slate-900 px-1 py-0.5">{grandTotalScore}</td>
                    <td colSpan={3} className="border border-slate-900 px-1 py-0.5"></td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="border border-slate-900 px-1 py-0.5 text-right">Jumlah Maks</td>
                    {questionMaxes.map((maxP, idx) => (
                      <td key={idx} className="border border-slate-900 px-1 py-0.5">{maxP}</td>
                    ))}
                    <td className="border border-slate-900 px-1 py-0.5">{grandTotalMax}</td>
                    <td colSpan={3} className="border border-slate-900 px-1 py-0.5"></td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="border border-slate-900 px-1 py-0.5 text-right">% Ketercapaian</td>
                    {questionPercentages.map((pct, idx) => (
                      <td key={idx} className="border border-slate-900 px-1 py-0.5">{pct}%</td>
                    ))}
                    <td className="border border-slate-900 px-1 py-0.5">
                      {grandTotalMax > 0 ? Math.round((grandTotalScore / grandTotalMax) * 100) : 0}%
                    </td>
                    <td colSpan={3} className="border border-slate-900 px-1 py-0.5"></td>
                  </tr>
                </tfoot>
              </table>

              {/* Signature Block Page 1 */}
              <div className="grid grid-cols-2 text-center text-xs mt-6 pt-2">
                <div>
                  <p className="mb-10">Mengetahui,<br />Kepala {profile.schoolName}</p>
                  <p className="font-bold underline uppercase">{profile.principalName}</p>
                  <p>NIP. {profile.principalNip}</p>
                </div>

                <div>
                  <p className="mb-10">
                    {profile.location}, {profile.reportDate}<br />Guru Mata Pelajaran {profile.subject || 'PJOK'}
                  </p>
                  <p className="font-bold underline uppercase">{profile.teacherName}</p>
                  <p>NIP. {profile.teacherNip}</p>
                </div>
              </div>
            </div>
          )}

          {/* MODE 2: ANALISIS & REMEDIAL REPORT (PDF HALAMAN 2) */}
          {activeMode === 'analysis' && (
            <div>
              <div className="text-center font-bold text-sm mb-1 uppercase tracking-wide">
                HASIL ANALISIS ULANGAN HARIAN (HALAMAN 2)
              </div>
              <div className="text-center font-extrabold text-sm mb-4 uppercase tracking-wide">
                PROGRAM PERBAIKAN DAN PENGAYAAN
              </div>

              {/* Section A: Hasil Analisis */}
              <div className="mb-4">
                <div className="font-bold text-xs uppercase mb-1">A. HASIL ANALISIS</div>
                <div className="pl-3 space-y-1 text-xs">
                  <div>1. Ketuntasan Belajar:</div>
                  <div className="pl-4 space-y-0.5">
                    <div>a. Perorangan:</div>
                    <div className="pl-4 space-y-0.5">
                      <div>- Jumlah siswa seluruhnya: {classStudents.length} Orang</div>
                      <div>- Jumlah siswa yang telah tuntas belajar: {passedStudents.length} Orang</div>
                      <div>- Persentase siswa yang telah tuntas belajar: {passPercentage}%</div>
                    </div>
                    <div>b. Klasikal: {passPercentage >= 80 ? 'Tuntas' : 'Belum Tuntas'}</div>
                  </div>

                  <div className="pt-1">2. Kesimpulan:</div>
                  <div className="pl-4 space-y-0.5">
                    <div>a. Perlu perbaikan (Remedial): {remedialStudents.length} Orang</div>
                    <div>b. Perlu pengayaan: {passedStudents.length} Orang</div>
                  </div>

                  <div className="pt-1">3. Keterangan:</div>
                  <div className="pl-4 space-y-0.5 text-[11px] text-slate-700">
                    <div>a. Daya serap perorangan: Seorang siswa disebut telah tuntas belajar apabila ia telah mencapai KKM ({phItem.kkm}%).</div>
                    <div>b. Daya serap klasikal: Satu kelas dikatakan tuntas belajar apabila diperoleh 80% siswa yang telah mencapai KKM.</div>
                  </div>
                </div>
              </div>

              {/* Section B: Program Perbaikan dan Pengayaan */}
              <div className="mb-4">
                <div className="font-bold text-xs uppercase mb-1">B. PROGRAM PERBAIKAN DAN PENGAYAAN</div>
                <div className="pl-3 text-xs space-y-1">
                  <div>Analisis hasil ulangan harian digunakan sebagai dasar program perbaikan dan pengayaan:</div>
                  
                  <div className="pt-1 font-semibold">A. Perbaikan (Pelaksanaan Perbaikan):</div>
                  <div className="pl-4 space-y-0.5">
                    <div>1. Penjelasan kembali materi yang sudah diajarkan & pembimbingan perorangan</div>
                    <div>2. Pemberian Tugas Tambahan / Latihan Soal {profile.subject || 'PJOK'}</div>
                  </div>

                  <div className="pt-1 font-semibold">B. Pengayaan (Pelaksanaan Pengayaan):</div>
                  <div className="pl-4 space-y-0.5">
                    <div>1. Membantu teman yang belum mencapai ketuntasan belajar minimal (Tutor Sebaya)</div>
                    <div>2. Memperdalam materi yang pernah dipelajari</div>
                  </div>

                  <div className="pt-1 font-semibold">C. Data Perbaikan:</div>
                  <div className="pl-4 grid grid-cols-2 gap-x-4">
                    <div>1. Tanggal: {profile.reportDate}</div>
                    <div>2. Semester: {profile.semester}</div>
                    <div>3. Kelas: {selectedClass}</div>
                    <div>4. KKM: {phItem.kkm}</div>
                  </div>
                </div>
              </div>

              {/* Data Perbaikan Table (TANPA KOLOM NILAI PERBAIKAN) */}
              <div className="mb-6">
                <div className="font-bold text-xs uppercase mb-2 text-center">
                  DATA SISWA PERLU PERBAIKAN HASIL BELAJAR
                </div>

                <table className="w-full text-[10px] border-collapse border border-slate-900 text-center">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-slate-900">
                      <th className="border border-slate-900 p-1.5 w-10">NO</th>
                      <th className="border border-slate-900 p-1.5 text-left min-w-[200px]">NAMA SISWA</th>
                      <th className="border border-slate-900 p-1.5 w-28">NILAI UH (AWAL)</th>
                      <th className="border border-slate-900 p-1.5 w-48">STATUS KETUNTASAN</th>
                    </tr>
                  </thead>

                  <tbody>
                    {remedialStudents.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="border border-slate-900 p-3 italic">
                          Seluruh siswa telah tuntas belajar.
                        </td>
                      </tr>
                    ) : (
                      remedialStudents.map((student, idx) => {
                        const rec = scoreMap.get(student.id);
                        const initialPct = rec?.percentageScore ?? 0;

                        return (
                          <tr key={student.id} className="border-b border-slate-900">
                            <td className="border border-slate-900 p-1.5">{idx + 1}</td>
                            <td className="border border-slate-900 p-1.5 text-left font-medium">{student.name}</td>
                            <td className="border border-slate-900 p-1.5 font-bold">{initialPct}%</td>
                            <td className="border border-slate-900 p-1.5 font-bold text-rose-800">
                              Belum Tuntas (Perlu Perbaikan)
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Signature Block Page 2 */}
              <div className="grid grid-cols-2 text-center text-xs mt-6 pt-2">
                <div>
                  <p className="mb-10">Mengetahui,<br />Kepala {profile.schoolName}</p>
                  <p className="font-bold underline uppercase">{profile.principalName}</p>
                  <p>NIP. {profile.principalNip}</p>
                </div>

                <div>
                  <p className="mb-10">
                    {profile.location}, {profile.reportDate}<br />Guru Mata Pelajaran {profile.subject || 'PJOK'}
                  </p>
                  <p className="font-bold underline uppercase">{profile.teacherName}</p>
                  <p>NIP. {profile.teacherNip}</p>
                </div>
              </div>
            </div>
          )}

          {/* MODE 3: LEMBAR KERJA PESERTA DIDIK / LKPD (PDF HALAMAN 3) */}
          {activeMode === 'lkpd' && (
            <div>
              <div className="text-center space-y-0.5 mb-3">
                <h2 className="text-sm font-black uppercase tracking-wide text-slate-900 underline">
                  LEMBAR KERJA PESERTA DIDIK (LKPD) — HALAMAN 3
                </h2>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  ASESMEN LINGKUP MATERI ({phItem.code}: {phItem.title})
                </p>
              </div>

              {/* Student Identity Box */}
              <div className="border border-slate-900 p-2.5 rounded text-xs space-y-1.5 mb-3 bg-slate-50/50">
                <div className="font-bold text-slate-900 uppercase border-b border-slate-300 pb-1 mb-1">
                  IDENTITAS PESERTA DIDIK
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                  <div>Nama Siswa : ................................................................</div>
                  <div>Kelas / No Absen : <strong>{selectedClass}</strong> / ..........</div>
                  <div>Mata Pelajaran : {profile.subject || 'PJOK'}</div>
                  <div>Hari / Tanggal : ................................................................</div>
                </div>
              </div>

              {/* Capaian & TP Box */}
              <div className="border border-slate-900 p-2.5 rounded text-xs mb-3 bg-slate-50/30 space-y-1">
                <div><strong>Lingkup Materi:</strong> {phItem.topic}</div>
                <div><strong>Tujuan Pembelajaran (TP):</strong> {phItem.learningObjective}</div>
                <div className="text-[11px] text-slate-700 font-semibold pt-0.5">
                  KKM: {phItem.kkm} • Total Skor Maksimal: {phItem.totalMaxScore}
                </div>
              </div>

              {/* Instructions */}
              <div className="text-[11px] mb-3 bg-amber-50/80 p-2 border border-amber-200 rounded leading-relaxed text-amber-950">
                <strong>PETUNJUK PENGERJAAN LKPD:</strong>
                <ol className="list-decimal list-inside space-y-0.5 mt-0.5 text-[10.5px]">
                  <li>Berdoalah sebelum mengerjakan tugas / asesmen LKPD ini.</li>
                  <li>Selesaikan soal/tugas aspek penilaian berikut pada lembar jawaban yang tersedia.</li>
                  <li>Mintalah petunjuk dari Guru {profile.subject || 'PJOK'} jika menemui kendala teknis.</li>
                </ol>
              </div>

              {/* Question / Task List based on TP & itemMaxScores */}
              <div className="space-y-3 mb-4">
                <div className="font-bold text-xs uppercase border-b border-slate-900 pb-1">
                  SOAL / AKTIVITAS TUGAS PESERTA DIDIK:
                </div>
                {phItem.itemMaxScores.map((maxScore, idx) => (
                  <div key={idx} className="border border-slate-800 p-2.5 rounded bg-white text-xs space-y-1">
                    <div className="flex justify-between font-bold border-b border-slate-200 pb-1">
                      <span>Soal Aspek {idx + 1}: Keterampilan & Pemahaman {phItem.title}</span>
                      <span className="font-normal text-[10.5px]">Skor Maks: {maxScore}</span>
                    </div>
                    <p className="text-slate-800 text-[11px] pt-0.5">
                      {idx === 0 && `Jelaskan secara ringkas variasi teknik dasar ${phItem.title} yang telah dipelajari sesuai indikator TP!`}
                      {idx === 1 && `Uraikan urutan pelaksanaan gerak yang benar (persiapan, pelaksanaan, dan sikap akhir) pada materi ${phItem.title}!`}
                      {idx === 2 && `Sebutkan 2 kesalahan umum yang sering terjadi saat melakukan gerakan ${phItem.title} dan cara mengatasinya!`}
                      {idx === 3 && `Tuliskan bentuk penerapan sikap sportivitas dan kerjasama tim selama pembelajaran ${phItem.title}!`}
                      {idx >= 4 && `Lakukan refleksi diri dan tuliskan perbaikan gerakan yang perlu ditingkatkan pada aspek ke-${idx + 1}!`}
                    </p>
                    <div className="border border-slate-300 rounded p-1.5 min-h-[50px] bg-slate-50/30 text-[10px] text-slate-400">
                      Lembar Jawaban / Catatan Praktik Siswa:
                      <div className="border-b border-dotted border-slate-300 mt-3"></div>
                      <div className="border-b border-dotted border-slate-300 mt-3"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rubrik Penilaian Table Page 3 */}
              <div className="border border-slate-900 p-2 rounded mb-4 text-xs">
                <div className="font-bold mb-1 text-center uppercase">REKAPITULASI PENILAIAN GURU (HALAMAN 3)</div>
                <table className="w-full text-center border-collapse border border-slate-900 text-[10px]">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-slate-900">
                      {phItem.itemMaxScores.map((_, i) => (
                        <th key={i} className="border border-slate-900 p-1">Soal {i + 1}</th>
                      ))}
                      <th className="border border-slate-900 p-1">Total Skor</th>
                      <th className="border border-slate-900 p-1">Nilai (%)</th>
                      <th className="border border-slate-900 p-1">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {phItem.itemMaxScores.map((_, i) => (
                        <td key={i} className="border border-slate-900 p-1.5 text-slate-400">......</td>
                      ))}
                      <td className="border border-slate-900 p-1.5 text-slate-400 font-bold">... / {phItem.totalMaxScore}</td>
                      <td className="border border-slate-900 p-1.5 text-slate-400 font-bold">...... %</td>
                      <td className="border border-slate-900 p-1.5 text-slate-400 italic">TUNTAS / REMEDIAL</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signature Block Page 3 */}
              <div className="grid grid-cols-2 text-center text-xs mt-4 pt-2">
                <div>
                  <p className="mb-10">Mengetahui,<br />Kepala {profile.schoolName}</p>
                  <p className="font-bold underline uppercase">{profile.principalName}</p>
                  <p>NIP. {profile.principalNip}</p>
                </div>

                <div>
                  <p className="mb-10">
                    {profile.location}, {profile.reportDate}<br />Guru Mata Pelajaran {profile.subject || 'PJOK'}
                  </p>
                  <p className="font-bold underline uppercase">{profile.teacherName}</p>
                  <p>NIP. {profile.teacherNip}</p>
                </div>
              </div>
            </div>
          )}

          {/* MODE 4: DAFTAR NILAI AKHIR HASIL PERBAIKAN (PDF HALAMAN 4) */}
          {activeMode === 'remedial_final' && (
            <div>
              <div className="text-center font-extrabold text-base mb-1 uppercase tracking-wide text-slate-900">
                DAFTAR NILAI AKHIR HASIL PERBAIKAN (HALAMAN 4)
              </div>
              <div className="text-center font-bold text-xs mb-3 text-slate-700 uppercase tracking-wider">
                PROGRAM REMEDIAL & PENGAYAAN ASESMEN SUMATIF {profile.subject ? profile.subject.toUpperCase() : 'PJOK'}
              </div>

              {/* Metadata Block */}
              <table className="w-full text-xs mb-3 border-none border-collapse">
                <tbody>
                  <tr>
                    <td className="py-0.5 font-semibold w-32">Mata Pelajaran</td>
                    <td className="py-0.5">: {profile.subject || 'PJOK'}</td>
                    <td className="py-0.5 font-semibold w-24">Kelas</td>
                    <td className="py-0.5">: {selectedClass}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 font-semibold">Tahun Ajaran</td>
                    <td className="py-0.5">: {profile.academicYear}</td>
                    <td className="py-0.5 font-semibold">Semester</td>
                    <td className="py-0.5">: {profile.semester}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 font-semibold">UH / Asesmen ke</td>
                    <td className="py-0.5">: {phItem.code} ({phItem.title})</td>
                    <td className="py-0.5 font-semibold">KKM Minimal</td>
                    <td className="py-0.5">: {phItem.kkm}</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 font-semibold">Tanggal Laporan</td>
                    <td className="py-0.5" colSpan={3}>: {profile.reportDate}</td>
                  </tr>
                </tbody>
              </table>

              {/* Tabel Daftar Nilai Akhir Hasil Perbaikan */}
              <table className="w-full text-[9.5px] sm:text-[10px] border-collapse border border-slate-900 text-center mb-3">
                <thead>
                  <tr className="bg-slate-100 font-bold border-b border-slate-900">
                    <th className="border border-slate-900 p-1 w-8">NO</th>
                    <th className="border border-slate-900 p-1 text-left min-w-[150px]">NAMA SISWA</th>
                    <th className="border border-slate-900 p-1 w-20">NILAI UH (AWAL)</th>
                    <th className="border border-slate-900 p-1 w-20">NILAI PERBAIKAN</th>
                    <th className="border border-slate-900 p-1 w-20">NILAI AKHIR</th>
                    <th className="border border-slate-900 p-1 w-24">STATUS AKHIR</th>
                    <th className="border border-slate-900 p-1 text-left min-w-[140px]">CATATAN / STRATEGI</th>
                  </tr>
                </thead>

                <tbody>
                  {finalScoreRows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="border border-slate-900 p-3 italic">
                        Belum ada data siswa untuk kelas ini.
                      </td>
                    </tr>
                  ) : (
                    finalScoreRows.map((row, idx) => (
                      <tr key={row.student.id} className="border-b border-slate-900">
                        <td className="border border-slate-900 p-1">{idx + 1}</td>
                        <td className="border border-slate-900 p-1 text-left font-medium">{row.student.name}</td>
                        <td className="border border-slate-900 p-1">{row.initialScore}</td>
                        <td className="border border-slate-900 p-1 font-semibold">
                          {row.isInitiallyPassed ? '-' : (row.remedialScoreVal !== null ? row.remedialScoreVal : '-')}
                        </td>
                        <td className="border border-slate-900 p-1 font-bold text-slate-900">
                          {row.finalScore}
                        </td>
                        <td className={`border border-slate-900 p-1 font-bold ${row.isPassedFinal ? 'text-emerald-800' : 'text-rose-800'}`}>
                          {row.isPassedFinal ? 'TUNTAS' : 'BELUM TUNTAS'}
                        </td>
                        <td className="border border-slate-900 p-1 text-left text-[9px] italic">
                          {row.notes}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

                {/* Baris Rekapitulasi Rata-rata & Ketuntasan Akhir */}
                <tfoot className="font-bold bg-slate-100">
                  <tr>
                    <td colSpan={2} className="border border-slate-900 p-1 text-right">RATA-RATA KELAS</td>
                    <td className="border border-slate-900 p-1">{avgInitialScore}</td>
                    <td className="border border-slate-900 p-1">-</td>
                    <td className="border border-slate-900 p-1 text-indigo-900">{avgFinalScore}</td>
                    <td colSpan={2} className="border border-slate-900 p-1 text-left pl-2">
                      KETUNTASAN AKHIR: {finalPassedCount} / {classStudents.length} SISWA ({finalPassPct}%)
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Signature Block Page 4 */}
              <div className="grid grid-cols-2 text-center text-xs mt-6 pt-2">
                <div>
                  <p className="mb-10">Mengetahui,<br />Kepala {profile.schoolName}</p>
                  <p className="font-bold underline uppercase">{profile.principalName}</p>
                  <p>NIP. {profile.principalNip}</p>
                </div>

                <div>
                  <p className="mb-10">
                    {profile.location}, {profile.reportDate}<br />Guru Mata Pelajaran {profile.subject || 'PJOK'}
                  </p>
                  <p className="font-bold underline uppercase">{profile.teacherName}</p>
                  <p>NIP. {profile.teacherNip}</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Actions Bar (Hidden on Print) */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all"
            title="Kembali ke Halaman Depan Utama"
          >
            <ArrowLeft className="w-4 h-4 text-amber-300" />
            <span>Kembali ke Halaman Depan</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all disabled:opacity-70"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>
                Unduh PDF ({activeMode === 'matrix' ? 'Hal 1' : activeMode === 'analysis' ? 'Hal 2' : activeMode === 'lkpd' ? 'Hal 3 (LKPD)' : 'Hal 4 (Nilai Akhir)'})
              </span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
