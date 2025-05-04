"use client";
import { useState } from "react";
import { Todo } from "@/types/todo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
// Todo app
export default function Home() {
  const [input, setInput] = useState<string>("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [sort, setSort] = useState<string>("asc");
  const [filter, setFilter] = useState<string>("all");
  const [showFilter, setShowFilter] = useState<boolean>(false);
  // Alert for delete all
  const [showAlert, setShowAlert] = useState<boolean>(false);

  const filteredTodos = todos.filter((todo) => {
    if (filter === "completed") return todo.completed;
    if (filter === "not-completed") return !todo.completed;
    return true; // Default to include all todos
  });

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (sort === "asc") {
      //  incomplete todos first
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      //  sort by createdAt date
      if (a.completed && b.completed) {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sort === "desc") {
      //  incomplete todos first
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      //  sort by createdAt date
      if (a.completed && b.completed) {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return 0;
  });
  return (
    <>
      <div className="flex flex-col items-center min-h-screen p-4">
        <h1 className="text-4xl font-bold mb-4">Todo App</h1>
        {/* Input and button*/}
        <div className="flex items-center w-full max-w-md mb-4">
          <form
            className="flex items-center w-full max-w-md"
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim() === "") return;
              const newTodo: Todo = {
                id: Date.now().toString(),
                title: input,
                completed: false,
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              setTodos([...todos, newTodo]);
              setInput("");
            }}
          >
            <Input
              placeholder="Type here..."
              className="w-full max-w-md mr-2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button type="submit">Add Todo</Button>
          </form>
        </div>
        {/* Todo list header with title  */}
        <h2 className="w-full max-w-md text-2xl font-bold text-left">
          Todo List
        </h2>
        <div className="flex items-center mb-4 w-full max-w-md ">
          <span className="text-gray-500">
            {todos.length} {todos.length === 1 ? "todo" : "todos"}
          </span>
          <div className="ml-auto gap-2 flex">
            {/* Filter buttons opens a popover there will be filters (asc, desc, completed, not completed, all) */}
            <Popover open={showFilter} onOpenChange={setShowFilter}>
              <PopoverTrigger asChild>
                <Button variant="outline">Filter</Button>
              </PopoverTrigger>
              <PopoverContent className="w-40">
                <Label className="mb-2">Filter</Label>
                <Select
                  value={filter}
                  onValueChange={(value) => setFilter(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="not-completed">Not Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Label className="mt-4">Sort</Label>
                <Select value={sort} onValueChange={(value) => setSort(value)}>
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </PopoverContent>
            </Popover>
            {/* Delete all button */}
            <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={todos.length === 0}>
                  Delete All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to delete all todos?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      setTodos([]);
                      setShowAlert(false);
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Todo list items */}
        <ul className="w-full max-w-md">
          {sortedTodos.length === 0 ? (
            <Card className="p-4 mb-2">
              <p className="text-gray-500 text-center">No todos yet</p>
            </Card>
          ) : (
            sortedTodos.map((todo) => (
              <Card
                key={todo.id}
                className="flex flex-row justify-between items-center p-2 mb-1"
              >
                {/* Checkbox and todo title */}
                <div className="flex items-center">
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={(checked) => {
                      setTodos(
                        todos.map((t) =>
                          t.id === todo.id ? { ...t, completed: !!checked } : t
                        )
                      );
                    }}
                  />
                  <span
                    className={`ml-2 ${
                      todo.completed ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {todo.title}
                  </span>
                </div>
                {/* Delete button */}
                <Button
                  variant="destructive"
                  onClick={() => {
                    setTodos(todos.filter((t) => t.id !== todo.id));
                  }}
                >
                  Delete
                </Button>
              </Card>
            ))
          )}
        </ul>
      </div>
    </>
  );
}
