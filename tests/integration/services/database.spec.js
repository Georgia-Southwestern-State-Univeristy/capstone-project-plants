import { db } from 'server/utils/firebase';
import { collection, addDoc, getDoc, doc } from 'firebase/firestore';
import { vi } from 'vitest';

describe('Database Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('successfully stores chat messages', async () => {
    const mockMessage = {
      content: 'Test message',
      timestamp: new Date(),
      userId: '123'
    };

    const mockDocRef = { id: 'abc123' };
    vi.spyOn(collection, 'addDoc').mockResolvedValue(mockDocRef);

    const docRef = await addDoc(collection(db, 'messages'), mockMessage);
    expect(docRef.id).toBe('abc123');
  });

  it('retrieves user data correctly', async () => {
    const mockUser = {
      name: 'Test User',
      email: 'test@example.com',
      preferences: { notifications: true }
    };

    vi.spyOn(doc, 'getDoc').mockResolvedValue({
      exists: () => true,
      data: () => mockUser
    });

    const docSnap = await getDoc(doc(db, 'users', '123'));
    expect(docSnap.exists()).toBe(true);
    expect(docSnap.data()).toEqual(mockUser);
  });

  it('handles real-time updates', (done) => {
    const unsubscribe = db.collection('messages')
      .where('userId', '==', '123')
      .onSnapshot((snapshot) => {
        expect(snapshot.docChanges().length).toBeGreaterThan(0);
        unsubscribe();
        done();
      });

    // Simulate a new message
    db.collection('messages').add({
      content: 'New message',
      userId: '123',
      timestamp: new Date()
    });
  });
});
