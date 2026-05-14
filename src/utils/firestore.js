import { db, auth } from './firebase';
import {
  doc, collection, query, where, orderBy, limit,
  getDocs, serverTimestamp, runTransaction,
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { getDailyKey } from './daily';

const UID_KEY = 'tg_uid';

async function getOrCreateUser() {
  if (!auth.currentUser) await signInAnonymously(auth);
  const uid = auth.currentUser.uid;
  try { localStorage.setItem(UID_KEY, uid); } catch {}
  return uid;
}

export function getCachedUserId() {
  try { return localStorage.getItem(UID_KEY) ?? null; } catch { return null; }
}

export async function saveDailyScore({ name, score, stars }) {
  try {
    const userId  = await getOrCreateUser();
    const dateKey = getDailyKey();
    const ref     = doc(db, 'dailyScores', `${userId}_${dateKey}`);

    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      if (snap.exists() && snap.data().score >= score) return;
      tx.set(ref, { userId, name, score, stars, date: dateKey, ts: serverTimestamp() });
    });
  } catch (err) {
    console.error('Firebase saveDailyScore:', err);
  }
}

export async function saveOnlineResult(name, result) {
  try {
    const userId = await getOrCreateUser();
    const ref = doc(db, 'onlineStats', userId);
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      const data = snap.exists()
        ? { ...snap.data() }
        : { wins: 0, losses: 0, draws: 0 };
      if (result === 'win')       data.wins++;
      else if (result === 'loss') data.losses++;
      else if (result === 'draw') data.draws++;
      data.name = name;
      data.updatedAt = serverTimestamp();
      tx.set(ref, data);
    });
  } catch (err) {
    console.error('Firebase saveOnlineResult:', err);
  }
}

export async function getOnlineLeaderboard(limitCount = 20) {
  try {
    const q = query(
      collection(db, 'onlineStats'),
      orderBy('wins', 'desc'),
      limit(limitCount),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  } catch (err) {
    console.error('Firebase getOnlineLeaderboard:', err);
    return [];
  }
}

export async function getDailyLeaderboard() {
  try {
    const dateKey = getDailyKey();
    const q = query(
      collection(db, 'dailyScores'),
      where('date', '==', dateKey),
      limit(50),
    );
    const snap = await getDocs(q);
    return snap.docs
      .map(d => d.data())
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  } catch (err) {
    console.error('Firebase getDailyLeaderboard:', err);
    return [];
  }
}
