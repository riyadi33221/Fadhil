import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDocFromServer,
  writeBatch,
  query,
  where,
} from 'firebase/firestore';
import firebaseConfigJson from '../firebase-applet-config.json';
import {
  SchoolProfile,
  AssessmentItem,
  Student,
  ScoreRecord,
  ClassId,
} from './types';
import {
  DEFAULT_SCHOOL_PROFILE,
  INITIAL_PH_ITEMS,
  INITIAL_STUDENTS,
  generateInitialScores,
} from './data/initialData';

// Initialize Firebase App
const app = initializeApp(firebaseConfigJson);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Sign in anonymously on load if enabled, otherwise proceed with standard access
signInAnonymously(auth).catch(() => {
  // Anonymous sign-in may be disabled in console; Firestore operates under project security rules.
});

// Initialize Firestore with specific database ID if provided in config
export const db = firebaseConfigJson.firestoreDatabaseId
  ? getFirestore(app, firebaseConfigJson.firestoreDatabaseId)
  : getFirestore(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): Error {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return new Error(JSON.stringify(errInfo));
}

// Test Connection on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'workspaces', 'health_check'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// COLLECTIONS inside a Workspace
const PROFILE_COLLECTION = 'school_profile';
const PH_ITEMS_COLLECTION = 'ph_items';
const STUDENTS_COLLECTION = 'students';
const SCORES_COLLECTION = 'scores';

/**
 * Get Workspace Collection Reference
 */
function getWsCollection(wsId: string, collectionName: string) {
  const cleanWs = (wsId || 'smpn2kutasari').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  return collection(db, 'workspaces', cleanWs || 'smpn2kutasari', collectionName);
}

/**
 * Get Workspace Doc Reference
 */
function getWsDoc(wsId: string, collectionName: string, docId: string) {
  const cleanWs = (wsId || 'smpn2kutasari').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  return doc(db, 'workspaces', cleanWs || 'smpn2kutasari', collectionName, docId);
}

/**
 * Real-time listener for School Profile
 */
export function subscribeToSchoolProfile(
  wsId: string,
  onUpdate: (profile: SchoolProfile | null) => void,
  onError?: (error: Error) => void
) {
  const docRef = getWsDoc(wsId, PROFILE_COLLECTION, 'default');
  const pathStr = `workspaces/${wsId}/${PROFILE_COLLECTION}/default`;
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as SchoolProfile);
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      const formatted = handleFirestoreError(err, OperationType.GET, pathStr);
      if (onError) onError(formatted);
    }
  );
}

/**
 * Real-time listener for PH Items
 */
export function subscribeToPhItems(
  wsId: string,
  onUpdate: (phItems: AssessmentItem[]) => void,
  onError?: (error: Error) => void
) {
  const collRef = getWsCollection(wsId, PH_ITEMS_COLLECTION);
  const pathStr = `workspaces/${wsId}/${PH_ITEMS_COLLECTION}`;
  return onSnapshot(
    collRef,
    (snapshot) => {
      const items: AssessmentItem[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as AssessmentItem);
      });
      // Sort by ID PH-1 to PH-10
      items.sort((a, b) => {
        const numA = parseInt(a.id.replace('PH-', ''), 10) || 0;
        const numB = parseInt(b.id.replace('PH-', ''), 10) || 0;
        return numA - numB;
      });
      onUpdate(items);
    },
    (err) => {
      const formatted = handleFirestoreError(err, OperationType.LIST, pathStr);
      if (onError) onError(formatted);
    }
  );
}

/**
 * Real-time listener for Students
 */
export function subscribeToStudents(
  wsId: string,
  onUpdate: (students: Student[]) => void,
  onError?: (error: Error) => void
) {
  const collRef = getWsCollection(wsId, STUDENTS_COLLECTION);
  const pathStr = `workspaces/${wsId}/${STUDENTS_COLLECTION}`;
  return onSnapshot(
    collRef,
    (snapshot) => {
      const students: Student[] = [];
      snapshot.forEach((d) => {
        students.push(d.data() as Student);
      });
      onUpdate(students);
    },
    (err) => {
      const formatted = handleFirestoreError(err, OperationType.LIST, pathStr);
      if (onError) onError(formatted);
    }
  );
}

/**
 * Real-time listener for Scores
 */
export function subscribeToScores(
  wsId: string,
  onUpdate: (scores: ScoreRecord[]) => void,
  onError?: (error: Error) => void
) {
  const collRef = getWsCollection(wsId, SCORES_COLLECTION);
  const pathStr = `workspaces/${wsId}/${SCORES_COLLECTION}`;
  return onSnapshot(
    collRef,
    (snapshot) => {
      const scores: ScoreRecord[] = [];
      snapshot.forEach((d) => {
        scores.push(d.data() as ScoreRecord);
      });
      onUpdate(scores);
    },
    (err) => {
      const formatted = handleFirestoreError(err, OperationType.LIST, pathStr);
      if (onError) onError(formatted);
    }
  );
}

/**
 * Save School Profile
 */
export async function saveSchoolProfile(wsId: string, profile: SchoolProfile) {
  const pathStr = `workspaces/${wsId}/${PROFILE_COLLECTION}/default`;
  try {
    const docRef = getWsDoc(wsId, PROFILE_COLLECTION, 'default');
    await setDoc(docRef, profile, { merge: true });
  } catch (err) {
    throw handleFirestoreError(err, OperationType.WRITE, pathStr);
  }
}

/**
 * Save Assessment PH Item
 */
export async function savePhItem(wsId: string, phItem: AssessmentItem) {
  const pathStr = `workspaces/${wsId}/${PH_ITEMS_COLLECTION}/${phItem.id}`;
  try {
    const docRef = getWsDoc(wsId, PH_ITEMS_COLLECTION, phItem.id);
    await setDoc(docRef, phItem, { merge: true });
  } catch (err) {
    throw handleFirestoreError(err, OperationType.WRITE, pathStr);
  }
}

/**
 * Save Single Student
 */
export async function saveStudent(wsId: string, student: Student) {
  const pathStr = `workspaces/${wsId}/${STUDENTS_COLLECTION}/${student.id}`;
  try {
    const docRef = getWsDoc(wsId, STUDENTS_COLLECTION, student.id);
    await setDoc(docRef, student, { merge: true });
  } catch (err) {
    throw handleFirestoreError(err, OperationType.WRITE, pathStr);
  }
}

/**
 * Save Batch Students
 */
export async function saveStudentsBatch(wsId: string, students: Student[]) {
  if (students.length === 0) return;
  const pathStr = `workspaces/${wsId}/${STUDENTS_COLLECTION}`;
  try {
    const CHUNK_SIZE = 400;
    for (let i = 0; i < students.length; i += CHUNK_SIZE) {
      const chunk = students.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      chunk.forEach((student) => {
        const docRef = getWsDoc(wsId, STUDENTS_COLLECTION, student.id);
        batch.set(docRef, student, { merge: true });
      });
      await batch.commit();
    }
  } catch (err) {
    throw handleFirestoreError(err, OperationType.WRITE, pathStr);
  }
}

/**
 * Delete Student & Score records
 */
export async function deleteStudentInCloud(wsId: string, studentId: string) {
  const pathStr = `workspaces/${wsId}/${STUDENTS_COLLECTION}/${studentId}`;
  try {
    // Delete student doc
    const studentRef = getWsDoc(wsId, STUDENTS_COLLECTION, studentId);
    await deleteDoc(studentRef);

    // Query & delete score records
    const scoresQuery = query(
      getWsCollection(wsId, SCORES_COLLECTION),
      where('studentId', '==', studentId)
    );
    const snapshot = await getDocs(scoresQuery);
    if (!snapshot.empty) {
      const batch = writeBatch(db);
      snapshot.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
    }
  } catch (err) {
    throw handleFirestoreError(err, OperationType.DELETE, pathStr);
  }
}

/**
 * Delete All Students in a Class
 */
export async function deleteClassStudentsInCloud(wsId: string, classId: ClassId) {
  const pathStr = `workspaces/${wsId}/${STUDENTS_COLLECTION}`;
  try {
    const studentsQuery = query(
      getWsCollection(wsId, STUDENTS_COLLECTION),
      where('classId', '==', classId)
    );
    const snapshot = await getDocs(studentsQuery);
    if (!snapshot.empty) {
      const batch = writeBatch(db);
      snapshot.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();

      // Delete scores for classId
      const scoresQuery = query(
        getWsCollection(wsId, SCORES_COLLECTION),
        where('classId', '==', classId)
      );
      const scoresSnapshot = await getDocs(scoresQuery);
      if (!scoresSnapshot.empty) {
        const scoresBatch = writeBatch(db);
        scoresSnapshot.forEach((sSnap) => {
          scoresBatch.delete(sSnap.ref);
        });
        await scoresBatch.commit();
      }
    }
  } catch (err) {
    throw handleFirestoreError(err, OperationType.DELETE, pathStr);
  }
}

/**
 * Save Single Score Record
 */
export async function saveScoreRecord(wsId: string, record: ScoreRecord) {
  const docId = `${record.studentId}_${record.phId}`;
  const pathStr = `workspaces/${wsId}/${SCORES_COLLECTION}/${docId}`;
  try {
    const docRef = getWsDoc(wsId, SCORES_COLLECTION, docId);
    await setDoc(docRef, record, { merge: true });
  } catch (err) {
    throw handleFirestoreError(err, OperationType.WRITE, pathStr);
  }
}

/**
 * Save Batch Score Records
 */
export async function saveScoresBatch(wsId: string, records: ScoreRecord[]) {
  if (records.length === 0) return;
  const pathStr = `workspaces/${wsId}/${SCORES_COLLECTION}`;
  try {
    const CHUNK_SIZE = 400;
    for (let i = 0; i < records.length; i += CHUNK_SIZE) {
      const chunk = records.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      chunk.forEach((record) => {
        const docId = `${record.studentId}_${record.phId}`;
        const docRef = getWsDoc(wsId, SCORES_COLLECTION, docId);
        batch.set(docRef, record, { merge: true });
      });
      await batch.commit();
    }
  } catch (err) {
    throw handleFirestoreError(err, OperationType.WRITE, pathStr);
  }
}

/**
 * Seed initial data to Firestore for a workspace if empty
 */
export async function seedInitialDataIfEmpty(
  wsId: string,
  defaultProfile: SchoolProfile,
  defaultPhItems: AssessmentItem[],
  defaultStudents: Student[],
  defaultScores: ScoreRecord[]
) {
  const pathStr = `workspaces/${wsId}/${STUDENTS_COLLECTION}`;
  try {
    const studentsSnap = await getDocs(getWsCollection(wsId, STUDENTS_COLLECTION));

    if (studentsSnap.empty) {
      console.log(`Seeding workspace [${wsId}] data into Firestore...`);

      const profileToSeed = defaultProfile || DEFAULT_SCHOOL_PROFILE;
      const phToSeed = defaultPhItems && defaultPhItems.length > 0 ? defaultPhItems : INITIAL_PH_ITEMS;
      const studentsToSeed = defaultStudents && defaultStudents.length > 0 ? defaultStudents : INITIAL_STUDENTS;
      const scoresToSeed =
        defaultScores && defaultScores.length > 0
          ? defaultScores
          : generateInitialScores(studentsToSeed, phToSeed);

      // Save School Profile
      await saveSchoolProfile(wsId, profileToSeed);

      // Save PH Items
      for (const ph of phToSeed) {
        await savePhItem(wsId, ph);
      }

      // Save Students in batch
      await saveStudentsBatch(wsId, studentsToSeed);

      // Save Scores in batch
      await saveScoresBatch(wsId, scoresToSeed);

      console.log(`Workspace [${wsId}] initial cloud seed complete!`);
    }
  } catch (err) {
    console.error('Error during cloud seeding:', err);
    handleFirestoreError(err, OperationType.GET, pathStr);
  }
}
