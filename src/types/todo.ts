import { UserType } from './user'

// Todo type
export interface TodoType {
  id?: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  users: string[];
  userId: string;
  createdAt: string;
  completedDate: string | null;
  createdBy: string;
  updatedAt: string;
}

export interface TodoStoreType {
  todos: TodoType[];
  loading: boolean;
  error: string | null;
  setTodos: (todos: TodoType[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addTodo: (todo: TodoType) => Promise<void>;
  updateTodo: (id: string, updates: Partial<TodoType>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  deleteAllTodos: (userId: string) => Promise<void>;
  subscribeToTodos: (userId: string, user: UserType) => () => void;
}