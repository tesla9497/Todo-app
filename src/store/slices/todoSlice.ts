import { StateCreator } from 'zustand'
import { TodoType, TodoStoreType } from '../../types/todo'
import { UserType } from '../../types/user'
import { db } from '../../lib/firebase'
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  onSnapshot
} from 'firebase/firestore'

export const createTodoSlice: StateCreator<TodoStoreType> = (set) => ({
  todos: [],
  loading: false,
  error: null,
  setTodos: (todos: TodoType[]) => set({ todos }),
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  addTodo: async (todo: TodoType) => {
    set({ loading: true, error: null })
    try {
      const todosRef = collection(db, 'todos')
      await addDoc(todosRef, todo)
      set({ loading: false })
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Failed to add todo' })
    }
  },
  updateTodo: async (id: string, updates: Partial<TodoType>) => {
    set({ loading: true, error: null })
    try {
      const todoRef = doc(db, 'todos', id)
      await updateDoc(todoRef, updates)
      set({ loading: false })
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Failed to update todo' })
    }
  },
  deleteTodo: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const todoRef = doc(db, 'todos', id)
      await deleteDoc(todoRef)
      set((state) => ({
        todos: state.todos.filter((todo) => todo.id !== id),
        loading: false
      }))
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Failed to delete todo' })
    }
  },
  deleteAllTodos: async (userId: string) => {
    set({ loading: true, error: null })
    try {
      const todosRef = collection(db, 'todos')
      const q = query(todosRef, where('userId', '==', userId))
      const querySnapshot = await getDocs(q)
      
      const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref))
      await Promise.all(deletePromises)
      
      set({ todos: [], loading: false })
    } catch (error) {
      set({ loading: false, error: error instanceof Error ? error.message : 'Failed to delete all todos' })
    }
  },
  subscribeToTodos: (userId: string, user: UserType) => {
    const todosRef = collection(db, 'todos')
    const q = query(todosRef)
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const todos = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as TodoType[]
      const filteredTodos = user.role === 'user' 
        ? todos.filter(todo => todo.users.includes(userId))
        : todos
      
      set({ todos: filteredTodos })
    }, (error) => {
      set({ error: error.message })
    })
    
    return unsubscribe
  }
}) 