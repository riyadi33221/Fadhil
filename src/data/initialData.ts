import { AssessmentItem, ClassId, SchoolProfile, Student, ScoreRecord } from '../types';

export const CLASSES: ClassId[] = [
  'VII A',
  'VII B',
  'VII C',
  'VII D',
  'VII E',
  'VII F',
  'VII G',
  'VIII A',
  'VIII B',
  'VIII C',
  'VIII D',
  'VIII E',
  'VIII F',
  'VIII G',
  'IX A',
  'IX B',
  'IX C',
  'IX D',
  'IX E',
  'IX F',
  'IX G',
];

export const DEFAULT_SCHOOL_PROFILE: SchoolProfile = {
  schoolName: 'SMP NEGERI 2 KUTASARI',
  schoolAddress: 'Jl. Raya Kutasari No. 12, Kec. Kutasari, Kab. Purbalingga, Jawa Tengah',
  logoUrl: 'https://lh3.googleusercontent.com/d/1q-uihP_9bDg8jusw9As1Qkw_G6CdCKwA',
  subject: 'PJOK',
  gradeLevel: 'Kelas VII (Tujuh)',
  teacherName: 'Purwanto, S.Pd.',
  teacherNip: '19870512 201201 1 003',
  principalName: 'Drs. Supriyanto, M.Pd.',
  principalNip: '19690815 199503 1 004',
  academicYear: '2026/2027',
  semester: 'Gasal',
  location: 'Kutasari, Purbalingga',
  reportDate: '12 Oktober 2026',
};

export const INITIAL_PH_ITEMS: AssessmentItem[] = [
  {
    id: 'PH-1',
    code: 'PH 1',
    title: 'Permainan Bola Besar',
    topic: 'Variasi dan Kombinasi Gerak Spesifik Sepak Bola & Voli',
    learningObjective: 'Mempraktikkan teknik dasar menendang dan menghentikan bola, serta memahami peraturan permainan sepakbola.',
    kkm: 75, // Tingkat Kesulitan: Sedang
    itemMaxScores: [4, 5, 3, 4, 5, 4], // Total = 25
    totalMaxScore: 25,
  },
  {
    id: 'PH-2',
    code: 'PH 2',
    title: 'Permainan Bola Kecil',
    topic: 'Gerak Spesifik Bulutangkis & Kasti',
    learningObjective: 'Mempraktikkan servis, pukulan lob, dan menangkap bola kecil secara presisi.',
    kkm: 75, // Tingkat Kesulitan: Sedang
    itemMaxScores: [5, 5, 5, 5, 5], // Total = 25
    totalMaxScore: 25,
  },
  {
    id: 'PH-3',
    code: 'PH 3',
    title: 'Aktivitas Atletik',
    topic: 'Lari Jarak Pendek (Start Jongkok) & Lompat Jauh',
    learningObjective: 'Menganalisis dan mempraktikkan koordinasi start, tumpuan, dan pendaratan.',
    kkm: 73, // Tingkat Kesulitan: Cukup Tinggi (Koordinasi Motorik)
    itemMaxScores: [4, 4, 4, 4, 4, 5], // Total = 25
    totalMaxScore: 25,
  },
  {
    id: 'PH-4',
    code: 'PH 4',
    title: 'Aktivitas Bela Diri',
    topic: 'Seni Bela Diri Pencak Silat',
    learningObjective: 'Mempraktikkan kuda-kuda, pukulan, tangkisan, dan elakan dasar pencak silat.',
    kkm: 72, // Tingkat Kesulitan: Tinggi (Kompleksitas Gerak)
    itemMaxScores: [5, 5, 5, 5, 5], // Total = 25
    totalMaxScore: 25,
  },
  {
    id: 'PH-5',
    code: 'PH 5',
    title: 'Kebugaran Jasmani',
    topic: 'Komponen Kekuatan, Daya Tahan & Kelentukan',
    learningObjective: 'Mengukur dan mempraktikkan tes kebugaran jasmani (push up, sit up, shuttle run).',
    kkm: 76, // Tingkat Kesulitan: Sedang-Mudah (Fisik Dasar)
    itemMaxScores: [4, 5, 4, 6, 6], // Total = 25
    totalMaxScore: 25,
  },
  {
    id: 'PH-6',
    code: 'PH 6',
    title: 'Senam Lantai',
    topic: 'Guling Depan, Guling Belakang & Sikap Lilin',
    learningObjective: 'Mempraktikkan gerak spesifik senam lantai dengan memperhatikan faktor keselamatan.',
    kkm: 70, // Tingkat Kesulitan: Sangat Tinggi (Kelentukan & Keberanian)
    itemMaxScores: [5, 5, 5, 5, 5], // Total = 25
    totalMaxScore: 25,
  },
  {
    id: 'PH-7',
    code: 'PH 7',
    title: 'Aktivitas Gerak Berirama',
    topic: 'Senam Ritmik & Variasi Langkah Kaki',
    learningObjective: 'Kreativitas merangkai ayunan lengan dan langkah kaki berirama iringan musik.',
    kkm: 75, // Tingkat Kesulitan: Sedang
    itemMaxScores: [5, 5, 5, 5, 5], // Total = 25
    totalMaxScore: 25,
  },
  {
    id: 'PH-8',
    code: 'PH 8',
    title: 'Aktivitas Air / Renang',
    topic: 'Renang Gaya Dada & Keselamatan di Air',
    learningObjective: 'Mempraktikkan teknik meluncur, gerakan kaki, dan koordinasi pernapasan gaya dada.',
    kkm: 72, // Tingkat Kesulitan: Tinggi (Fasilitas & Pernapasan)
    itemMaxScores: [5, 5, 5, 5, 5], // Total = 25
    totalMaxScore: 25,
  },
  {
    id: 'PH-9',
    code: 'PH 9',
    title: 'Kesehatan Remaja',
    topic: 'Pencegahan Bahaya Pergaulan Bebas & Obat Terlarang',
    learningObjective: 'Menganalisis dampak pergaulan bebas dan menerapkan pola hidup sehat sehari-hari.',
    kkm: 78, // Tingkat Kesulitan: Rendah / Teori Pemahaman
    itemMaxScores: [5, 5, 5, 5, 5], // Total = 25
    totalMaxScore: 25,
  },
  {
    id: 'PH-10',
    code: 'PH 10',
    title: 'Pola Makan Sehat',
    topic: 'Gizi Seimbang & Aktivitas Fisik Teratur',
    learningObjective: 'Memahami prinsip gizi seimbang, memilih makanan sehat, dan manajemen istirahat.',
    kkm: 80, // Tingkat Kesulitan: Sangat Rendah / Pengetahuan Umum
    itemMaxScores: [5, 5, 5, 5, 5], // Total = 25
    totalMaxScore: 25,
  },
];

// Helper to generate realistic student list for classes VII A - VII G
function generateClassStudents(classId: ClassId): Student[] {
  const baseNames: { name: string; gender: 'L' | 'P' }[] = ([
    { name: 'Abdul Faris', gender: 'L' as const },
    { name: 'Ade Triono', gender: 'L' as const },
    { name: 'Adi Pranata Eka P', gender: 'L' as const },
    { name: 'Agus Setiawan', gender: 'L' as const },
    { name: 'Ahmad Kurniawan', gender: 'L' as const },
    { name: 'Aisyah Putri Rahmadani', gender: 'P' as const },
    { name: 'Akbar Santoso', gender: 'L' as const },
    { name: 'Anisa Nur Ramadhani', gender: 'P' as const },
    { name: 'Ardiansyah M. N', gender: 'L' as const },
    { name: 'Ayu Fitrianingsih', gender: 'P' as const },
    { name: 'Bagus Setyawan', gender: 'L' as const },
    { name: 'Bunga Citra Lestari', gender: 'P' as const },
    { name: 'Daffa Rizky Pratama', gender: 'L' as const },
    { name: 'Dina Kurniawati', gender: 'P' as const },
    { name: 'Edi Awaludin', gender: 'L' as const },
    { name: 'Eni Muliani', gender: 'P' as const },
    { name: 'Erwinsyah Saputra', gender: 'L' as const },
    { name: 'Fadhil Nur Hidayat', gender: 'L' as const },
    { name: 'Faradillah Sandi', gender: 'P' as const },
    { name: 'Fitriani Indah', gender: 'P' as const },
    { name: 'Hamidun Setiadi', gender: 'L' as const },
    { name: 'Ikda Safitri Jubaidi', gender: 'P' as const },
    { name: 'Ilham Syahputra', gender: 'L' as const },
    { name: 'Inda Uswatun Hasanah', gender: 'P' as const },
    { name: 'Ita Kurniati', gender: 'P' as const },
    { name: 'Iwan Setiawan', gender: 'L' as const },
    { name: 'Jauhar Fadlin', gender: 'L' as const },
    { name: 'Kharisma Dewi', gender: 'P' as const },
    { name: 'Muhammad Farisal', gender: 'L' as const },
    { name: 'Nani Minarni', gender: 'P' as const },
    { name: 'Nurwahidah', gender: 'P' as const },
    { name: 'Rizky Firmansyah', gender: 'L' as const },
    { name: 'Sri Anisa Wulandari', gender: 'P' as const },
    { name: 'Yuli Susanti', gender: 'P' as const },
  ] as { name: string; gender: 'L' | 'P' }[]).sort((a, b) => a.name.localeCompare(b.name, 'id', { sensitivity: 'base' }));

  // Tailor prefix/variations per class
  const classCode = classId.replace(' ', '');
  return baseNames.map((s, idx) => {
    const paddedNum = String(idx + 1).padStart(2, '0');
    return {
      id: `${classCode}-${paddedNum}`,
      nis: `2025${classCode.substring(3)}${paddedNum}`,
      name: s.name,
      gender: s.gender,
      classId: classId,
    };
  });
}

export const INITIAL_STUDENTS: Student[] = CLASSES.flatMap((c) =>
  generateClassStudents(c)
);

// Helper to seed realistic initial scores matching PDF structure
export function generateInitialScores(
  students: Student[],
  phItems: AssessmentItem[]
): ScoreRecord[] {
  const records: ScoreRecord[] = [];

  students.forEach((student) => {
    phItems.forEach((ph) => {
      // Create seed logic for scores
      // Generate scores based on student hash to keep consistent
      const numCode = parseInt(student.id.split('-')[1] || '1', 10);
      const phNum = parseInt(ph.id.replace('PH-', ''), 10);

      // Create item scores
      const itemMax = ph.itemMaxScores;
      const itemScores: number[] = [];

      itemMax.forEach((max, idx) => {
        // Pseudo random deterministic pattern
        const scoreFactor = (numCode * 7 + phNum * 13 + idx * 5) % 100;
        let score = max;
        if (scoreFactor < 15) {
          score = Math.max(1, max - 2);
        } else if (scoreFactor < 35) {
          score = Math.max(1, max - 1);
        } else {
          score = max;
        }
        itemScores.push(score);
      });

      const totalScore = itemScores.reduce((a, b) => a + b, 0);
      const percentageScore = Math.round((totalScore / ph.totalMaxScore) * 100);
      const isPassed = percentageScore >= ph.kkm;

      let remedialScore: number | null = null;
      let postRemedialPercentage: number | null = null;
      let isPassedPostRemedial: boolean | null = null;

      if (!isPassed && (numCode % 3 === 0)) {
        // Some remedial students have completed remedial
        remedialScore = Math.min(ph.totalMaxScore, totalScore + 4);
        postRemedialPercentage = Math.round((remedialScore / ph.totalMaxScore) * 100);
        isPassedPostRemedial = postRemedialPercentage >= ph.kkm;
      }

      records.push({
        studentId: student.id,
        phId: ph.id,
        classId: student.classId,
        itemScores,
        totalScore,
        percentageScore,
        isPassed,
        remedialScore,
        postRemedialPercentage,
        isPassedPostRemedial: isPassedPostRemedial ?? isPassed,
        remedialNotes: !isPassed ? 'Penjelasan ulang materi & tugas praktek mandiri' : '',
      });
    });
  });

  return records;
}
