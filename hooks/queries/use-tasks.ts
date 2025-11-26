/**
 * Task Query Hooks - Example Implementation
 *
 * Demonstrates all TanStack Query patterns:
 * - Basic queries
 * - Mutations with invalidation
 * - Optimistic updates
 * - Prefetching
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  queryOptions,
} from "@tanstack/react-query";
import { STALE_TIME_SHORT, STALE_TIME_DEFAULT } from "@/constants/query";

// =============================================================================
// Types
// =============================================================================

export interface Task {
  id: string;
  title: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  createdAt: string;
}

export interface TaskFilters {
  status?: Task["status"];
  priority?: Task["priority"];
  page?: number;
  limit?: number;
}

interface TasksResponse {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  byPriority: {
    high: number;
    medium: number;
    low: number;
  };
  lastUpdated: string;
}

interface CreateTaskInput {
  title: string;
  status?: Task["status"];
  priority?: Task["priority"];
}

interface UpdateTaskInput {
  id: string;
  title?: string;
  status?: Task["status"];
  priority?: Task["priority"];
}

// =============================================================================
// Query Keys Factory
// =============================================================================

export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (filters?: TaskFilters) => [...taskKeys.lists(), filters ?? {}] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  stats: () => [...taskKeys.all, "stats"] as const,
};

// =============================================================================
// API Functions
// =============================================================================

async function fetchTasks(filters?: TaskFilters): Promise<TasksResponse> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.priority) params.set("priority", filters.priority);
  if (filters?.page) params.set("page", String(filters.page));
  if (filters?.limit) params.set("limit", String(filters.limit));

  const res = await fetch(`/api/dummy/tasks?${params}`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

async function fetchTask(id: string): Promise<Task> {
  const res = await fetch(`/api/dummy/tasks/${id}`);
  if (!res.ok) throw new Error("Failed to fetch task");
  return res.json();
}

async function fetchTaskStats(): Promise<TaskStats> {
  const res = await fetch("/api/dummy/stats");
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

async function createTask(input: CreateTaskInput): Promise<Task> {
  const res = await fetch("/api/dummy/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create task");
  }
  return res.json();
}

async function updateTask(input: UpdateTaskInput): Promise<Task> {
  const { id, ...data } = input;
  const res = await fetch(`/api/dummy/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update task");
  }
  return res.json();
}

async function deleteTask(id: string): Promise<Task> {
  const res = await fetch(`/api/dummy/tasks/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete task");
  return res.json();
}

// =============================================================================
// Query Options (for reuse across hooks and prefetching)
// =============================================================================

export function tasksQueryOptions(filters?: TaskFilters) {
  return queryOptions({
    queryKey: taskKeys.list(filters),
    queryFn: () => fetchTasks(filters),
    staleTime: STALE_TIME_DEFAULT,
  });
}

export function taskQueryOptions(id: string) {
  return queryOptions({
    queryKey: taskKeys.detail(id),
    queryFn: () => fetchTask(id),
    staleTime: STALE_TIME_DEFAULT,
    enabled: !!id,
  });
}

export function taskStatsQueryOptions() {
  return queryOptions({
    queryKey: taskKeys.stats(),
    queryFn: fetchTaskStats,
    staleTime: STALE_TIME_SHORT,
  });
}

// =============================================================================
// Query Hooks
// =============================================================================

/**
 * Fetch tasks with optional filters
 */
export function useTasks(filters?: TaskFilters) {
  return useQuery(tasksQueryOptions(filters));
}

/**
 * Fetch a single task by ID
 */
export function useTask(id: string) {
  return useQuery(taskQueryOptions(id));
}

/**
 * Fetch task statistics
 */
export function useTaskStats() {
  return useQuery(taskStatsQueryOptions());
}

/**
 * Infinite scroll for tasks
 */
export function useInfiniteTasks(filters?: Omit<TaskFilters, "page">) {
  return useInfiniteQuery({
    queryKey: [...taskKeys.lists(), "infinite", filters ?? {}],
    queryFn: ({ pageParam = 1 }) =>
      fetchTasks({ ...filters, page: pageParam, limit: 3 }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });
}

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * Create a new task
 */
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      // Invalidate all task lists and stats
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.stats() });
    },
  });
}

/**
 * Update a task with optimistic updates
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTask,

    // Optimistic update
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.detail(newData.id) });
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });

      // Snapshot previous values
      const previousTask = queryClient.getQueryData<Task>(
        taskKeys.detail(newData.id)
      );
      const previousLists = queryClient.getQueriesData<TasksResponse>({
        queryKey: taskKeys.lists(),
      });

      // Optimistically update detail cache
      if (previousTask) {
        queryClient.setQueryData(taskKeys.detail(newData.id), {
          ...previousTask,
          ...newData,
        });
      }

      // Optimistically update list caches
      queryClient.setQueriesData<TasksResponse>(
        { queryKey: taskKeys.lists() },
        (old) => {
          if (!old?.tasks) return old;
          return {
            ...old,
            tasks: old.tasks.map((task) =>
              task.id === newData.id ? { ...task, ...newData } : task
            ),
          };
        }
      );

      return { previousTask, previousLists };
    },

    // Rollback on error
    onError: (err, newData, context) => {
      if (context?.previousTask) {
        queryClient.setQueryData(
          taskKeys.detail(newData.id),
          context.previousTask
        );
      }
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          if (data) {
            queryClient.setQueryData(queryKey, data);
          }
        });
      }
    },

    // Sync with server
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.stats() });
    },
  });
}

/**
 * Delete a task
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,

    // Optimistic delete
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });

      const previousLists = queryClient.getQueriesData<TasksResponse>({
        queryKey: taskKeys.lists(),
      });

      // Optimistically remove from lists
      queryClient.setQueriesData<TasksResponse>(
        { queryKey: taskKeys.lists() },
        (old) => {
          if (!old?.tasks) return old;
          return {
            ...old,
            tasks: old.tasks.filter((task) => task.id !== id),
            total: Math.max(0, old.total - 1),
          };
        }
      );

      return { previousLists };
    },

    onError: (err, id, context) => {
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          if (data) {
            queryClient.setQueryData(queryKey, data);
          }
        });
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.stats() });
    },
  });
}

// =============================================================================
// Prefetch Helpers
// =============================================================================

/**
 * Prefetch a task (use on hover for instant navigation)
 */
export function usePrefetchTask() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery(taskQueryOptions(id));
  };
}

