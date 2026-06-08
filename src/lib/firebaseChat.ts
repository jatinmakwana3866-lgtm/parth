import {
  collection,
  doc,
  addDoc,
  setDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDoc,
  updateDoc,
  getDocs,
  limit,
  Unsubscribe,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface FirebaseMessage {
  id: string;
  text: string;
  senderUid: string;
  receiverUid: string;
  createdAt: Timestamp | null;
}

export interface FirebaseChat {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  participantPhotos: Record<string, string>;
  lastMessage: string;
  lastMessageAt: Timestamp | null;
  lastSenderUid: string;
}

// Deterministic chat ID from two UIDs
export function getChatId(uidA: string, uidB: string): string {
  return [uidA, uidB].sort().join('_');
}

export async function getOrCreateChat(
  myUid: string,
  myName: string,
  myPhoto: string,
  otherUid: string,
  otherName: string,
  otherPhoto: string
): Promise<string> {
  const chatId = getChatId(myUid, otherUid);
  const ref = doc(db, 'chats', chatId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      participants: [myUid, otherUid],
      participantNames: { [myUid]: myName, [otherUid]: otherName },
      participantPhotos: { [myUid]: myPhoto, [otherUid]: otherPhoto },
      lastMessage: '',
      lastMessageAt: serverTimestamp(),
      lastSenderUid: '',
    });
  }

  return chatId;
}

export async function sendFirebaseMessage(
  chatId: string,
  senderUid: string,
  receiverUid: string,
  text: string
): Promise<void> {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  await addDoc(messagesRef, {
    text,
    senderUid,
    receiverUid,
    createdAt: serverTimestamp(),
  });

  // Update chat metadata
  const chatRef = doc(db, 'chats', chatId);
  await updateDoc(chatRef, {
    lastMessage: text.length > 60 ? text.slice(0, 60) + '...' : text,
    lastMessageAt: serverTimestamp(),
    lastSenderUid: senderUid,
  });
}

export function subscribeToMessages(
  chatId: string,
  callback: (messages: FirebaseMessage[]) => void
): Unsubscribe {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const msgs: FirebaseMessage[] = snapshot.docs.map(d => ({
      id: d.id,
      ...(d.data() as Omit<FirebaseMessage, 'id'>),
    }));
    callback(msgs);
  });
}

export function subscribeToChats(
  uid: string,
  callback: (chats: FirebaseChat[]) => void
): Unsubscribe {
  const chatsRef = collection(db, 'chats');
  // Listen to all chats and filter client-side (Firestore array-contains needed for proper query)
  return onSnapshot(chatsRef, (snapshot) => {
    const chats: FirebaseChat[] = snapshot.docs
      .map(d => ({ id: d.id, ...(d.data() as Omit<FirebaseChat, 'id'>) }))
      .filter(c => c.participants?.includes(uid));
    chats.sort((a, b) => {
      const ta = a.lastMessageAt?.seconds ?? 0;
      const tb = b.lastMessageAt?.seconds ?? 0;
      return tb - ta;
    });
    callback(chats);
  });
}

export async function getRecentMessages(
  chatId: string,
  count = 50
): Promise<FirebaseMessage[]> {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({
    id: d.id,
    ...(d.data() as Omit<FirebaseMessage, 'id'>),
  }));
}
