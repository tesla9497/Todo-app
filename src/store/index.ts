import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createTodoSlice } from './slices/todoSlice'
import { createUserSlice } from './slices/userSlice'
import { TodoStoreType } from '../types/todo'
import { UserStoreType } from '../types/user'
import { UserType } from '../types/user'

type StoreState = TodoStoreType & UserStoreType & {
  availableUsers: UserType[];
  setAvailableUsers: (users: UserType[]) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (...a) => ({
      ...createTodoSlice(...a),
      ...createUserSlice(...a),
      availableUsers: [],
      setAvailableUsers: (users) => a[0]({ availableUsers: users }),
    }),
    {
      name: 'todo-app-storage', // unique name for localStorage key
      partialize: (state) => ({
        todos: state.todos,
        user: state.user,
      }), // only persist these fields
    }
  )
) 