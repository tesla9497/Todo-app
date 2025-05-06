import { StateCreator } from 'zustand'
import { UserType, UserStoreType } from '../../types/user'
import { auth, googleProvider, db } from '@/lib/firebase'
import { 
  signInWithPopup, 
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User as FirebaseUser
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'

const mapFirebaseUser = (firebaseUser: FirebaseUser): UserType => ({
  id: firebaseUser.uid,
  email: firebaseUser.email || '',
  name: firebaseUser.displayName || '',
  avatar: firebaseUser.photoURL || '',
  role: 'user',
  createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
  updatedAt: new Date(firebaseUser.metadata.lastSignInTime || Date.now())
})

const saveUserToFirestore = async (user: UserType) => {
  const userRef = doc(db, 'users', user.id)
  await setDoc(userRef, {
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  }, { merge: true })
}

export const createUserSlice: StateCreator<UserStoreType> = (set) => ({
  user: null,
  loading: false,
  error: null,
  setUser: (user: UserType | null) => set({ user }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  login: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = mapFirebaseUser(userCredential.user)
      await saveUserToFirestore(user)
      set({ user, loading: false })
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Login failed' })
    }
  },
  logout: async () => {
    set({ loading: true, error: null })
    try {
      await firebaseSignOut(auth)
      set({ user: null, loading: false })
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Logout failed' })
    }
  },
  register: async (email: string, password: string, name: string) => {
    set({ loading: true, error: null })
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await firebaseUpdateProfile(userCredential.user, { displayName: name })
      const user = mapFirebaseUser(userCredential.user)
      await saveUserToFirestore(user)
      set({ user, loading: false })
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Registration failed' })
    }
  },
  updateProfile: async (updates: Partial<UserType>) => {
    set({ loading: true, error: null })
    try {
      if (!auth.currentUser) throw new Error('No user logged in')
      await firebaseUpdateProfile(auth.currentUser, {
        displayName: updates.name
      })
      const user = mapFirebaseUser(auth.currentUser)
      await saveUserToFirestore(user)
      set({ user, loading: false })
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Profile update failed' })
    }
  },
  signInWithGoogle: async () => {
    set({ loading: true, error: null })
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = mapFirebaseUser(result.user)
      await saveUserToFirestore(user)
      set({ user, loading: false })
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Google sign in failed' })
    }
  }
}) 