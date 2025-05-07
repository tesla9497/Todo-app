"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, MoreHorizontal, Pencil, Trash2, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TodoType, ProjectType } from "@/types/todo";
import { useStore } from "@/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserType } from "@/types/user";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import { DatePicker } from "@/components/ui/date-picker";

function AvatarGroup({ users }: { users: string[] }) {
  const { availableUsers } = useStore();
  return (
    <div className="flex -space-x-2">
      {users.map((userId, i) => {
        const user = availableUsers.find((u) => u.id === userId);
        return (
          <div
            key={i}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-xs font-bold text-white border-2 border-white shadow-md hover:scale-110 transition-transform duration-200 cursor-pointer overflow-hidden"
          >
            {user?.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            ) : (
              user?.name?.[0]?.toUpperCase() || "?"
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddProjectDialogOpen, setIsAddProjectDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTask, setEditingTask] = useState<TodoType | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    color: "#6366f1",
    clientName: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "current-user",
  });
  const router = useRouter();
  const {
    todos,
    projects,
    addTodo,
    updateTodo,
    deleteTodo,
    addProject,
    subscribeToTodos,
    subscribeToProjects,
    user,
    logout,
    setAvailableUsers,
    availableUsers,
  } = useStore();

  useEffect(() => {
    // Subscribe to todos updates
    if (!user) return;
    const unsubscribeTodos = subscribeToTodos(user.id, user);
    const unsubscribeProjects = subscribeToProjects(user.id);
    return () => {
      unsubscribeTodos();
      unsubscribeProjects();
    };
  }, [subscribeToTodos, subscribeToProjects, user]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, "users");
        const snapshot = await getDocs(usersRef);
        const users = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as UserType[];
        setAvailableUsers(users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [setAvailableUsers]);

  const handleAddTask = async () => {
    if (!newTask.title || !newTask.priority || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const todo: TodoType = {
        ...newTask,
      };

      await addTodo(todo);
      setIsAddDialogOpen(false);
      setNewTask({
        title: "",
        description: "",
        priority: "",
        status: "Pending",
        users: [],
        userId: "current-user",
        projectId: null,
        createdAt: new Date().toISOString(),
        completedDate: null,
        estimatedDate: null,
        createdBy: "current-user",
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error adding task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTask = async () => {
    if (
      !editingTask?.id ||
      !editingTask.title ||
      !editingTask.priority ||
      isSubmitting
    )
      return;

    try {
      setIsSubmitting(true);
      const updates = {
        title: editingTask.title,
        description: editingTask.description,
        priority: editingTask.priority,
        status: editingTask.status,
        users: editingTask.users,
        projectId: editingTask.projectId,
        estimatedDate: editingTask.estimatedDate,
        updatedAt: new Date().toISOString(),
      };
      await updateTodo(editingTask.id, updates);
      setIsEditDialogOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error("Error editing task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const updates = {
        status: newStatus,
        completedDate:
          newStatus === "Completed" ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString(),
      };
      await updateTodo(taskId, updates);
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setIsSubmitting(true);
      await deleteTodo(taskId);
      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddProject = async () => {
    if (!newProject.name || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const project: ProjectType = {
        ...newProject,
        createdBy: user?.id || "current-user",
      };

      await addProject(project);
      setIsAddProjectDialogOpen(false);
      setNewProject({
        name: "",
        description: "",
        color: "#6366f1",
        clientName: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "current-user",
      });
    } catch (error) {
      console.error("Error adding project:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTodos = selectedProject
    ? todos.filter((todo) => todo.projectId === selectedProject)
    : todos;

  const tasksOnHold = filteredTodos.filter(
    (task: TodoType) =>
      task.status !== "Completed" && task.status !== "Cancelled"
  );
  const tasksCompleted = filteredTodos.filter(
    (task: TodoType) =>
      task.status === "Completed" || task.status === "Cancelled"
  );

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "",
    status: "Pending",
    users: [] as string[],
    userId: "current-user",
    projectId: null as string | null,
    createdAt: new Date().toISOString(),
    completedDate: null as string | null,
    estimatedDate: null as string | null,
    createdBy: "current-user",
    updatedAt: new Date().toISOString(),
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-4">
          <Search className="w-5 h-5 text-purple-500" />
          <Input
            placeholder="Search for any training you want"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-96 rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="w-12 h-12 cursor-pointer hover:scale-105 transition-all duration-200 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30">
              <AvatarImage src={user?.avatar} alt={user?.name || "User"} />
              <AvatarFallback className="bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-400 text-white font-bold">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={async () => {
                await logout();
                router.push("/");
              }}
              className="text-red-600 cursor-pointer"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="px-8 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold">
              You&apos;ve got{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 font-extrabold">
                {filteredTodos.length} tasks
              </span>{" "}
              today
            </h2>
          </div>
          <div className="flex gap-4">
            <Select
              value={selectedProject || "all"}
              onValueChange={(value) =>
                setSelectedProject(value === "all" ? null : value)
              }
            >
              <SelectTrigger className="w-[200px] rounded-xl focus:border-purple-500 focus:ring-purple-500/20">
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id || ""}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      {project.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => setIsAddProjectDialogOpen(true)}
              variant="outline"
              className="rounded-xl"
            >
              New Project
            </Button>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-200 hover:scale-105 px-6 py-2 rounded-xl"
            >
              Add New Task
            </Button>
          </div>
        </div>
      </div>

      {/* Add New Project Dialog */}
      <AlertDialog
        open={isAddProjectDialogOpen}
        onOpenChange={setIsAddProjectDialogOpen}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Add New Project</AlertDialogTitle>
            <AlertDialogDescription>
              Create a new project to organize your tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="projectName" className="text-gray-700">
                Project Name
              </Label>
              <Input
                id="projectName"
                value={newProject.name}
                onChange={(e) =>
                  setNewProject({ ...newProject, name: e.target.value })
                }
                placeholder="Enter project name"
                className="rounded-xl focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientName" className="text-gray-700">
                Client Name
              </Label>
              <Input
                id="clientName"
                value={newProject.clientName}
                onChange={(e) =>
                  setNewProject({ ...newProject, clientName: e.target.value })
                }
                placeholder="Enter client name"
                className="rounded-xl focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectDescription" className="text-gray-700">
                Description
              </Label>
              <Textarea
                id="projectDescription"
                value={newProject.description}
                onChange={(e) =>
                  setNewProject({ ...newProject, description: e.target.value })
                }
                placeholder="Enter project description"
                className="rounded-xl focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectColor" className="text-gray-700">
                Color
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  id="projectColor"
                  value={newProject.color}
                  onChange={(e) =>
                    setNewProject({ ...newProject, color: e.target.value })
                  }
                  className="w-12 h-12 p-1 rounded-xl"
                />
                <span className="text-sm text-gray-500">
                  Choose a color for your project
                </span>
              </div>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setIsAddProjectDialogOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={handleAddProject}
              disabled={
                isSubmitting || !newProject.name || !newProject.clientName
              }
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-200 hover:scale-105 px-6 py-2 rounded-xl"
            >
              {isSubmitting ? "Adding..." : "Add Project"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add New Task Dialog */}
      <AlertDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Add New Task</AlertDialogTitle>
            <AlertDialogDescription>
              Create a new task to track your progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                placeholder="Enter task title"
                className="rounded-xl focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                placeholder="Enter task description"
                className="rounded-xl focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select
                value={newTask.projectId || "none"}
                onValueChange={(value) =>
                  setNewTask({
                    ...newTask,
                    projectId: value === "none" ? null : value,
                  })
                }
              >
                <SelectTrigger className="w-full rounded-xl focus:border-purple-500 focus:ring-purple-500/20">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id || ""}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        {project.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-gray-700">
                Priority
              </Label>
              <Select
                value={newTask.priority}
                onValueChange={(value) =>
                  setNewTask({ ...newTask, priority: value })
                }
              >
                <SelectTrigger className="w-full rounded-xl focus:border-purple-500 focus:ring-purple-500/20">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Minor">Minor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newTask.status}
                onValueChange={(value) =>
                  setNewTask({ ...newTask, status: value })
                }
              >
                <SelectTrigger className="w-full rounded-xl focus:border-purple-500 focus:ring-purple-500/20">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedDate">Estimated Completion Date</Label>
              <DatePicker
                date={
                  newTask.estimatedDate
                    ? new Date(newTask.estimatedDate)
                    : undefined
                }
                onDateChange={(date) =>
                  setNewTask({
                    ...newTask,
                    estimatedDate: date ? date.toISOString() : null,
                  })
                }
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setIsAddDialogOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={handleAddTask}
              disabled={isSubmitting || !newTask.title || !newTask.priority}
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-200 hover:scale-105 px-6 py-2 rounded-xl"
            >
              {isSubmitting ? "Adding..." : "Add Task"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Task Dialog */}
      <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <AlertDialogContent className="rounded-2xl border border-gray-100 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold">
              Edit Task
            </AlertDialogTitle>
            <AlertDialogDescription className="">
              Update your task details
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title" className="">
                Task Title
              </Label>
              <Input
                id="edit-title"
                placeholder="Enter task title"
                value={editingTask?.title || ""}
                onChange={(e) =>
                  setEditingTask((prev) =>
                    prev ? { ...prev, title: e.target.value } : null
                  )
                }
                className="w-full rounded-xl focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description" className="">
                Description
              </Label>
              <Textarea
                id="edit-description"
                placeholder="Enter task description"
                value={editingTask?.description || ""}
                onChange={(e) =>
                  setEditingTask((prev) =>
                    prev ? { ...prev, description: e.target.value } : null
                  )
                }
                className="w-full rounded-xl focus:border-purple-500 focus:ring-purple-500/20 min-h-[100px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-project">Project</Label>
              <Select
                value={editingTask?.projectId || "none"}
                onValueChange={(value) =>
                  setEditingTask((prev) =>
                    prev
                      ? { ...prev, projectId: value === "none" ? null : value }
                      : null
                  )
                }
              >
                <SelectTrigger className="w-full rounded-xl focus:border-purple-500 focus:ring-purple-500/20">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id || ""}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        {project.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-priority">Priority</Label>
              <Select
                value={editingTask?.priority || ""}
                onValueChange={(value) =>
                  setEditingTask((prev) =>
                    prev ? { ...prev, priority: value } : null
                  )
                }
              >
                <SelectTrigger className="w-full rounded-xl focus:border-purple-500 focus:ring-purple-500/20">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Critical">Critical</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Minor">Minor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status" className="text-gray-700">
                Status
              </Label>
              <Select
                value={editingTask?.status || ""}
                onValueChange={(value) =>
                  setEditingTask((prev) =>
                    prev ? { ...prev, status: value } : null
                  )
                }
              >
                <SelectTrigger className="w-full rounded-xl focus:border-purple-500 focus:ring-purple-500/20">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-estimatedDate">
                Estimated Completion Date
              </Label>
              <DatePicker
                date={
                  editingTask?.estimatedDate
                    ? new Date(editingTask.estimatedDate)
                    : undefined
                }
                onDateChange={(date) =>
                  setEditingTask((prev) =>
                    prev
                      ? {
                          ...prev,
                          estimatedDate: date ? date.toISOString() : null,
                        }
                      : null
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-users">Assign Users</Label>
              <Select
                value=""
                onValueChange={(value) => {
                  if (editingTask && !editingTask.users.includes(value)) {
                    setEditingTask({
                      ...editingTask,
                      users: [...editingTask.users, value],
                    });
                  }
                }}
              >
                <SelectTrigger className="w-full rounded-xl focus:border-purple-500 focus:ring-purple-500/20">
                  <SelectValue placeholder="Select users" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2 mt-2">
                {editingTask?.users.map((userId) => {
                  const user = availableUsers.find((u) => u.id === userId);
                  return user ? (
                    <div
                      key={userId}
                      className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{user.name}</span>
                      <button
                        onClick={() => {
                          if (editingTask) {
                            setEditingTask({
                              ...editingTask,
                              users: editingTask.users.filter(
                                (id) => id !== userId
                              ),
                            });
                          }
                        }}
                        className="hover:text-purple-900"
                      >
                        ×
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>

          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <Button
              onClick={handleEditTask}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 text-white rounded-xl"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="rounded-2xl border border-gray-100 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold">
              Delete Task
            </AlertDialogTitle>
            <AlertDialogDescription className="">
              Are you sure you want to delete this task? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <Button
              onClick={() => taskToDelete && handleDeleteTask(taskToDelete)}
              disabled={isSubmitting}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl"
            >
              {isSubmitting ? "Deleting..." : "Delete Task"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Content */}
      <div className="flex flex-1 gap-8 px-8 pb-8">
        {/* Task Lists */}
        <div className="flex-1 space-y-8">
          {tasksOnHold.length === 0 && tasksCompleted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center mb-6">
                <span className="text-4xl">📋</span>
              </div>
              <h4 className="text-2xl font-semibold mb-3">No tasks yet</h4>
              <p className="text-gray-500 mb-6 max-w-md">
                Get started by adding your first task. You can organize them by
                priority and track their progress.
              </p>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all duration-200 hover:scale-105 px-8 py-3 rounded-xl text-lg"
              >
                Create Your First Task
              </Button>
            </div>
          ) : (
            <>
              {tasksOnHold.length > 0 && (
                <div>
                  <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                    On Hold
                  </h3>
                  <Card className="backdrop-blur-md shadow-xl shadow-purple-500/5 hover:shadow-purple-500/10 transition-all duration-200 rounded-2xl border border-gray-100">
                    <div className="divide-y divide-gray-100">
                      {tasksOnHold.map((task: TodoType) => (
                        <div
                          key={task.id}
                          className="flex flex-col py-5 px-6 transition-all duration-200 group"
                        >
                          <Accordion
                            type="single"
                            collapsible
                            className="w-full"
                          >
                            <AccordionItem
                              value={task.id || "task"}
                              className="border-none overflow-hidden"
                            >
                              <AccordionTrigger className="flex-1 w-full py-0 hover:no-underline [&>svg]:h-4 [&>svg]:w-4">
                                <div className="flex items-center gap-4 w-full">
                                  <span className="text-pink-400 text-xs group-hover:scale-110 transition-transform duration-200">
                                    ●
                                  </span>
                                  <div className="flex flex-1 items-center gap-4 w-full">
                                    <span className="flex-1 font-medium group-hover:text-purple-600 transition-colors duration-200 text-left">
                                      {task.title}
                                    </span>
                                    {task.projectId && (
                                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                                        <div
                                          className="w-2 h-2 rounded-full"
                                          style={{
                                            backgroundColor:
                                              projects.find(
                                                (p) => p.id === task.projectId
                                              )?.color || "#6366f1",
                                          }}
                                        />
                                        {
                                          projects.find(
                                            (p) => p.id === task.projectId
                                          )?.name
                                        }
                                      </div>
                                    )}
                                    <Select
                                      value={task.status}
                                      onValueChange={(value) => {
                                        if (!task.id) return;
                                        handleStatusChange(task.id, value);
                                      }}
                                    >
                                      <SelectTrigger className="w-[140px] text-xs px-3 py-1.5 rounded-full bg-orange-100 text-orange-600 font-medium shadow-sm">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Pending">
                                          Pending
                                        </SelectItem>
                                        <SelectItem value="In Progress">
                                          In Progress
                                        </SelectItem>
                                        <SelectItem value="Completed">
                                          Completed
                                        </SelectItem>
                                        <SelectItem value="Cancelled">
                                          Cancelled
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <span
                                      className={`text-xs px-3 py-1.5 rounded-full font-medium shadow-sm ${
                                        task.priority === "Critical"
                                          ? "bg-red-100 text-red-600"
                                          : task.priority === "Normal"
                                          ? "bg-yellow-100 text-yellow-600"
                                          : "bg-green-100 text-green-600"
                                      }`}
                                    >
                                      {task.priority}
                                    </span>
                                    {task.estimatedDate && (
                                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
                                        <span>
                                          Due:{" "}
                                          {new Date(
                                            task.estimatedDate
                                          ).toLocaleDateString()}
                                        </span>
                                      </div>
                                    )}
                                    <AvatarGroup users={task.users} />
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="ml-2 rounded-full transition-all duration-200"
                                          onClick={(e: React.MouseEvent) =>
                                            e.stopPropagation()
                                          }
                                        >
                                          <MoreHorizontal className="w-5 h-5 text-purple-400 transition-all duration-200 group-hover:text-gray-400" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                          onClick={(e: React.MouseEvent) => {
                                            e.stopPropagation();
                                            setEditingTask(task);
                                            setIsEditDialogOpen(true);
                                          }}
                                        >
                                          <Pencil className="w-4 h-4 mr-2" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={(e: React.MouseEvent) => {
                                            e.stopPropagation();
                                            setTaskToDelete(task.id || null);
                                            setIsDeleteDialogOpen(true);
                                          }}
                                          className="text-red-600"
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="pt-2 pb-0">
                                <div className="pl-8">
                                  <p className="text-sm text-gray-600">
                                    {task.description ||
                                      "No description available"}
                                  </p>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

              {tasksCompleted.length > 0 && (
                <div>
                  <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                    Completed
                  </h3>
                  <Card className="backdrop-blur-md shadow-xl shadow-purple-500/5 hover:shadow-purple-500/10 transition-all duration-200 rounded-2xl border border-gray-100">
                    <div className="divide-y divide-gray-100">
                      {tasksCompleted.map((task: TodoType) => (
                        <div
                          key={task.id}
                          className="flex flex-col py-5 px-6 transition-all duration-200 group"
                        >
                          <Accordion
                            type="single"
                            collapsible
                            className="w-full"
                          >
                            <AccordionItem
                              value={task.id || "task"}
                              className="border-none"
                            >
                              <AccordionTrigger className="flex-1 w-full py-0 hover:no-underline [&>svg]:h-4 [&>svg]:w-4">
                                <div className="flex items-center gap-4 w-full">
                                  <span className="text-green-400 text-xs group-hover:scale-110 transition-transform duration-200">
                                    ●
                                  </span>
                                  <div className="flex flex-1 items-center gap-4 w-full">
                                    <span className="flex-1 font-medium group-hover:text-purple-600 transition-colors duration-200 text-left">
                                      {task.title}
                                    </span>
                                    {task.projectId && (
                                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                                        <div
                                          className="w-2 h-2 rounded-full"
                                          style={{
                                            backgroundColor:
                                              projects.find(
                                                (p) => p.id === task.projectId
                                              )?.color || "#6366f1",
                                          }}
                                        />
                                        {
                                          projects.find(
                                            (p) => p.id === task.projectId
                                          )?.name
                                        }
                                      </div>
                                    )}
                                    <Select
                                      value={task.status}
                                      onValueChange={(value) => {
                                        if (!task.id) return;
                                        handleStatusChange(task.id, value);
                                      }}
                                    >
                                      <SelectTrigger className="w-[140px] text-xs px-3 py-1.5 rounded-full bg-green-100 text-green-600 font-medium shadow-sm">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Pending">
                                          Pending
                                        </SelectItem>
                                        <SelectItem value="In Progress">
                                          In Progress
                                        </SelectItem>
                                        <SelectItem value="Completed">
                                          Completed
                                        </SelectItem>
                                        <SelectItem value="Cancelled">
                                          Cancelled
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <span
                                      className={`text-xs px-3 py-1.5 rounded-full font-medium shadow-sm ${
                                        task.priority === "Critical"
                                          ? "bg-red-100 text-red-600"
                                          : task.priority === "Normal"
                                          ? "bg-yellow-100 text-yellow-600"
                                          : "bg-green-100 text-green-600"
                                      }`}
                                    >
                                      {task.priority}
                                    </span>
                                    {task.estimatedDate && (
                                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
                                        <span>
                                          Due:{" "}
                                          {new Date(
                                            task.estimatedDate
                                          ).toLocaleDateString()}
                                        </span>
                                      </div>
                                    )}
                                    <AvatarGroup users={task.users} />
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="ml-2 rounded-full transition-all duration-200"
                                          onClick={(e: React.MouseEvent) =>
                                            e.stopPropagation()
                                          }
                                        >
                                          <MoreHorizontal className="w-5 h-5 text-purple-400 transition-all duration-200 group-hover:text-gray-400" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                          onClick={(e: React.MouseEvent) => {
                                            e.stopPropagation();
                                            setEditingTask(task);
                                            setIsEditDialogOpen(true);
                                          }}
                                        >
                                          <Pencil className="w-4 h-4 mr-2" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={(e: React.MouseEvent) => {
                                            e.stopPropagation();
                                            setTaskToDelete(task.id || null);
                                            setIsDeleteDialogOpen(true);
                                          }}
                                          className="text-red-600"
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="pt-2 pb-0">
                                <div className="pl-8">
                                  <p className="text-sm text-gray-600">
                                    {task.description ||
                                      "No description available"}
                                  </p>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
