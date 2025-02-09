// tests/unit/services/auth.spec.js
import { loginWithEmail, registerWithEmail, loginWithGoogle } from 'server/utils/firebase';
import { auth } from 'server/utils/firebase';
import { vi } from 'vitest';

describe('Authentication Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loginWithEmail', () => {
    it('successfully logs in with valid credentials', async () => {
      const mockUser = { uid: '123', email: 'test@example.com' };
      const email = 'test@example.com';
      const password = 'password123';

      vi.spyOn(auth, 'signInWithEmailAndPassword').mockResolvedValue({ user: mockUser });

      const result = await loginWithEmail(email, password);
      expect(result).toEqual(mockUser);
      expect(auth.signInWithEmailAndPassword).toHaveBeenCalledWith(auth, email, password);
    });

    it('handles login errors appropriately', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      vi.spyOn(auth, 'signInWithEmailAndPassword').mockRejectedValue(new Error('Invalid credentials'));

      await expect(loginWithEmail(email, password)).rejects.toThrow('Login failed: Invalid credentials');
    });
  });

  describe('registerWithEmail', () => {
    it('successfully registers a new user', async () => {
      const mockUser = { uid: '123', email: 'test@example.com' };
      const email = 'test@example.com';
      const password = 'password123';
      const displayName = 'Test User';

      vi.spyOn(auth, 'createUserWithEmailAndPassword').mockResolvedValue({ user: mockUser });
      vi.spyOn(auth, 'updateProfile').mockResolvedValue();
      vi.spyOn(auth, 'sendEmailVerification').mockResolvedValue();

      const result = await registerWithEmail(email, password, displayName);
      expect(result).toEqual(mockUser);
      expect(auth.createUserWithEmailAndPassword).toHaveBeenCalledWith(auth, email, password);
      expect(auth.updateProfile).toHaveBeenCalled();
      expect(auth.sendEmailVerification).toHaveBeenCalled();
    });

    it('handles registration errors appropriately', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const displayName = 'Test User';

      vi.spyOn(auth, 'createUserWithEmailAndPassword').mockRejectedValue(new Error('Email already in use'));

      await expect(registerWithEmail(email, password, displayName)).rejects.toThrow('Registration failed: Email already in use');
    });
  });

  describe('loginWithGoogle', () => {
    it('successfully logs in with Google', async () => {
      const mockUser = { uid: '123', email: 'test@gmail.com' };
      const mockCredential = { user: mockUser };

      vi.spyOn(auth, 'signInWithPopup').mockResolvedValue(mockCredential);

      const result = await loginWithGoogle();
      expect(result).toEqual(mockUser);
      expect(auth.signInWithPopup).toHaveBeenCalled();
    });

    it('handles Google login errors appropriately', async () => {
      vi.spyOn(auth, 'signInWithPopup').mockRejectedValue(new Error('Google auth failed'));

      await expect(loginWithGoogle()).rejects.toThrow('Google auth failed');
    });
  });
});



