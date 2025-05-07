import { UserType } from './user'

// Project type
export interface ProjectType {
  id?: string;
  name: string;
  description: string;
  color: string;
  clientName: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Todo type
export interface TodoType {
  id?: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  users: string[];
  userId: string;
  projectId: string | null;
  createdAt: string;
  completedDate: string | null;
  estimatedDate: string | null;
  createdBy: string;
  updatedAt: string;
}

export interface TodoStoreType {
  todos: TodoType[];
  projects: ProjectType[];
  loading: boolean;
  error: string | null;
  setTodos: (todos: TodoType[]) => void;
  setProjects: (projects: ProjectType[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addTodo: (todo: TodoType) => Promise<void>;
  updateTodo: (id: string, updates: Partial<TodoType>) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  deleteAllTodos: (userId: string) => Promise<void>;
  addProject: (project: ProjectType) => Promise<void>;
  updateProject: (id: string, updates: Partial<ProjectType>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  subscribeToTodos: (userId: string, user: UserType) => () => void;
  subscribeToProjects: (userId: string) => () => void;
}