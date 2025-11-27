"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useTasks,
  useTask,
  useTaskStats,
  useInfiniteTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  usePrefetchTask,
  taskKeys,
  type Task,
  type TaskFilters,
} from "@/hooks/queries/use-tasks";

export default function TanStackQueryExamplePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            TanStack Query Examples
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Interactive examples demonstrating queries, mutations, optimistic
            updates, caching, and more.
          </p>
        </header>

        {/* Stats Section */}
        <StatsSection />

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Basic Query */}
          <TaskListSection />

          {/* Filtered Query */}
          <FilteredTasksSection />
        </div>

        {/* Single Task Query */}
        <SingleTaskSection />

        {/* Infinite Scroll */}
        <InfiniteScrollSection />

        {/* Create Task (Mutation) */}
        <CreateTaskSection />

        {/* Cache Inspector */}
        <CacheInspectorSection />
      </div>
    </div>
  );
}

// =============================================================================
// Stats Section - Basic Query
// =============================================================================

function StatsSection() {
  const { data: stats, isLoading, error, isFetching } = useTaskStats();

  return (
    <Section
      title="📊 Task Statistics"
      description="Basic useQuery with staleTime: 30s"
      code={`const { data, isLoading } = useTaskStats();`}
    >
      {isLoading ? (
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : error ? (
        <ErrorDisplay error={error} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total" value={stats?.total ?? 0} color="violet" />
          <StatCard label="Pending" value={stats?.pending ?? 0} color="yellow" />
          <StatCard
            label="In Progress"
            value={stats?.inProgress ?? 0}
            color="blue"
          />
          <StatCard
            label="Completed"
            value={stats?.completed ?? 0}
            color="green"
          />
        </div>
      )}
      {isFetching && !isLoading && (
        <div className="text-xs text-zinc-500 mt-2">Refreshing in background...</div>
      )}
    </Section>
  );
}

// =============================================================================
// Task List Section - Basic Query with Loading States
// =============================================================================

function TaskListSection() {
  const { data, isLoading, error, refetch, isFetching } = useTasks();

  return (
    <Section
      title="📋 Task List"
      description="Basic query with manual refetch"
      code={`const { data, refetch } = useTasks();`}
    >
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-zinc-500">
          {data?.total ?? 0} tasks total
        </span>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="px-3 py-1 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-lg transition disabled:opacity-50"
        >
          {isFetching ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {isLoading ? (
        <TaskListSkeleton count={3} />
      ) : error ? (
        <ErrorDisplay error={error} />
      ) : (
        <div className="space-y-2">
          {data?.tasks.slice(0, 3).map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </Section>
  );
}

// =============================================================================
// Filtered Tasks Section - Query with Filters
// =============================================================================

function FilteredTasksSection() {
  const [filters, setFilters] = useState<TaskFilters>({});
  const { data, isLoading, error } = useTasks(filters);

  return (
    <Section
      title="🔍 Filtered Tasks"
      description="Query with dynamic filters"
      code={`const { data } = useTasks({ status: "pending" });`}
    >
      <div className="flex gap-2 mb-4 flex-wrap">
        <FilterButton
          active={!filters.status}
          onClick={() => setFilters({})}
        >
          All
        </FilterButton>
        <FilterButton
          active={filters.status === "pending"}
          onClick={() => setFilters({ status: "pending" })}
        >
          Pending
        </FilterButton>
        <FilterButton
          active={filters.status === "in_progress"}
          onClick={() => setFilters({ status: "in_progress" })}
        >
          In Progress
        </FilterButton>
        <FilterButton
          active={filters.status === "completed"}
          onClick={() => setFilters({ status: "completed" })}
        >
          Completed
        </FilterButton>
      </div>

      {isLoading ? (
        <TaskListSkeleton count={3} />
      ) : error ? (
        <ErrorDisplay error={error} />
      ) : data?.tasks.length === 0 ? (
        <div className="text-zinc-500 text-center py-8">No tasks found</div>
      ) : (
        <div className="space-y-2">
          {data?.tasks.slice(0, 3).map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </Section>
  );
}

// =============================================================================
// Single Task Section - Detail Query with Prefetch
// =============================================================================

function SingleTaskSection() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: task, isLoading, error } = useTask(selectedId ?? "");
  const prefetchTask = usePrefetchTask();
  const { data: taskList } = useTasks();

  return (
    <Section
      title="🎯 Single Task Query"
      description="Detail query with prefetch on hover"
      code={`const { data } = useTask(id);
const prefetch = usePrefetchTask();
<div onMouseEnter={() => prefetch(id)}>...`}
    >
      <div className="grid md:grid-cols-2 gap-6">
        {/* Task Selector */}
        <div>
          <h4 className="text-sm font-medium text-zinc-400 mb-3">
            Hover to prefetch, click to select:
          </h4>
          <div className="space-y-2">
            {taskList?.tasks.map((t) => (
              <button
                key={t.id}
                onMouseEnter={() => prefetchTask(t.id)}
                onClick={() => setSelectedId(t.id)}
                className={`w-full text-left px-4 py-2 rounded-lg transition ${
                  selectedId === t.id
                    ? "bg-violet-600"
                    : "bg-zinc-800 hover:bg-zinc-700"
                }`}
              >
                {t.title}
              </button>
            ))}
          </div>
        </div>

        {/* Task Detail */}
        <div>
          <h4 className="text-sm font-medium text-zinc-400 mb-3">
            Task Detail:
          </h4>
          {!selectedId ? (
            <div className="bg-zinc-800 rounded-lg p-6 text-center text-zinc-500">
              Select a task to view details
            </div>
          ) : isLoading ? (
            <Skeleton className="h-32" />
          ) : error ? (
            <ErrorDisplay error={error} />
          ) : task ? (
            <div className="bg-zinc-800 rounded-lg p-6 space-y-3">
              <h3 className="font-semibold text-lg">{task.title}</h3>
              <div className="flex gap-2">
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
              </div>
              <p className="text-sm text-zinc-500">
                Created: {new Date(task.createdAt).toLocaleString()}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  );
}

// =============================================================================
// Infinite Scroll Section
// =============================================================================

function InfiniteScrollSection() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteTasks();

  const allTasks = data?.pages.flatMap((page) => page.tasks) ?? [];

  return (
    <Section
      title="♾️ Infinite Scroll"
      description="useInfiniteQuery with load more"
      code={`const { data, fetchNextPage, hasNextPage } = useInfiniteTasks();
const allTasks = data?.pages.flatMap(p => p.tasks);`}
    >
      {isLoading ? (
        <TaskListSkeleton count={3} />
      ) : error ? (
        <ErrorDisplay error={error} />
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            {allTasks.map((task) => (
              <TaskCard key={task.id} task={task} compact />
            ))}
          </div>

          {hasNextPage && (
            <div className="mt-4 text-center">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="px-6 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg transition disabled:opacity-50"
              >
                {isFetchingNextPage ? "Loading more..." : "Load More"}
              </button>
            </div>
          )}

          {!hasNextPage && allTasks.length > 0 && (
            <p className="text-center text-zinc-500 mt-4">
              All tasks loaded
            </p>
          )}
        </>
      )}
    </Section>
  );
}

// =============================================================================
// Create Task Section - Mutation
// =============================================================================

function CreateTaskSection() {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const { data: taskList } = useTasks();

  const handleCreate = () => {
    if (!title.trim()) return;
    createTask.mutate(
      { title, priority },
      {
        onSuccess: () => {
          setTitle("");
        },
      }
    );
  };

  return (
    <Section
      title="✏️ Mutations"
      description="Create, update (optimistic), and delete tasks"
      code={`const createTask = useCreateTask();
createTask.mutate({ title, priority });

const updateTask = useUpdateTask(); // Has optimistic updates
const deleteTask = useDeleteTask(); // Has optimistic delete`}
    >
      <div className="grid md:grid-cols-2 gap-8">
        {/* Create Form */}
        <div>
          <h4 className="text-sm font-medium text-zinc-400 mb-3">
            Create New Task
          </h4>
          <div className="space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title..."
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-violet-500"
            />
            <div className="flex gap-2">
              {(["low", "medium", "high"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`px-3 py-1 rounded-lg text-sm capitalize ${
                    priority === p
                      ? "bg-violet-600"
                      : "bg-zinc-800 hover:bg-zinc-700"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={handleCreate}
              disabled={createTask.isPending || !title.trim()}
              className="w-full py-2 bg-violet-600 hover:bg-violet-500 rounded-lg transition disabled:opacity-50"
            >
              {createTask.isPending ? "Creating..." : "Create Task"}
            </button>
            {createTask.isError && (
              <p className="text-red-400 text-sm">
                {createTask.error.message}
              </p>
            )}
          </div>
        </div>

        {/* Update/Delete */}
        <div>
          <h4 className="text-sm font-medium text-zinc-400 mb-3">
            Update Status (Optimistic) / Delete
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {taskList?.tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-2 bg-zinc-800 rounded-lg p-3"
              >
                <span className="flex-1 truncate text-sm">{task.title}</span>
                <select
                  value={task.status}
                  onChange={(e) =>
                    updateTask.mutate({
                      id: task.id,
                      status: e.target.value as Task["status"],
                    })
                  }
                  className="bg-zinc-700 rounded px-2 py-1 text-xs"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <button
                  onClick={() => deleteTask.mutate(task.id)}
                  className="text-red-400 hover:text-red-300 px-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          {updateTask.isError && (
            <p className="text-red-400 text-sm mt-2">
              Update failed (rolled back): {updateTask.error.message}
            </p>
          )}
        </div>
      </div>
    </Section>
  );
}

// =============================================================================
// Cache Inspector Section
// =============================================================================

function CacheInspectorSection() {
  const queryClient = useQueryClient();
  const [cacheState, setCacheState] = useState<string>("");

  const inspectCache = () => {
    const cache = queryClient.getQueryCache().getAll();
    const simplified = cache.map((query) => ({
      queryKey: query.queryKey,
      state: query.state.status,
      dataUpdatedAt: query.state.dataUpdatedAt
        ? new Date(query.state.dataUpdatedAt).toLocaleTimeString()
        : null,
      isStale: query.isStale(),
    }));
    setCacheState(JSON.stringify(simplified, null, 2));
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: taskKeys.all });
  };

  const clearCache = () => {
    queryClient.clear();
    setCacheState("");
  };

  return (
    <Section
      title="🔬 Cache Inspector"
      description="View and manipulate the query cache"
      code={`const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: taskKeys.all });
queryClient.clear();`}
    >
      <div className="flex gap-3 mb-4">
        <button
          onClick={inspectCache}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
        >
          Inspect Cache
        </button>
        <button
          onClick={invalidateAll}
          className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg transition"
        >
          Invalidate All Tasks
        </button>
        <button
          onClick={clearCache}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition"
        >
          Clear Cache
        </button>
      </div>

      {cacheState && (
        <pre className="bg-zinc-900 rounded-lg p-4 overflow-auto max-h-64 text-xs text-zinc-300">
          {cacheState}
        </pre>
      )}
    </Section>
  );
}

// =============================================================================
// UI Components
// =============================================================================

function Section({
  title,
  description,
  code,
  children,
}: {
  title: string;
  description: string;
  code: string;
  children: React.ReactNode;
}) {
  const [showCode, setShowCode] = useState(false);

  return (
    <section className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm text-zinc-500">{description}</p>
        </div>
        <button
          onClick={() => setShowCode(!showCode)}
          className="text-xs text-violet-400 hover:text-violet-300"
        >
          {showCode ? "Hide Code" : "Show Code"}
        </button>
      </div>

      {showCode && (
        <pre className="bg-zinc-950 rounded-lg p-4 mb-4 overflow-auto text-xs text-zinc-300 border border-zinc-800">
          {code}
        </pre>
      )}

      {children}
    </section>
  );
}

function TaskCard({ task, compact }: { task: Task; compact?: boolean }) {
  if (compact) {
    return (
      <div className="bg-zinc-800 rounded-lg p-3">
        <p className="font-medium truncate text-sm">{task.title}</p>
        <div className="flex gap-2 mt-2">
          <StatusBadge status={task.status} small />
          <PriorityBadge priority={task.priority} small />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-800 rounded-lg p-4 flex items-center justify-between">
      <div>
        <p className="font-medium">{task.title}</p>
        <div className="flex gap-2 mt-1">
          <StatusBadge status={task.status} small />
          <PriorityBadge priority={task.priority} small />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
  small,
}: {
  status: Task["status"];
  small?: boolean;
}) {
  const colors = {
    pending: "bg-yellow-500/20 text-yellow-400",
    in_progress: "bg-blue-500/20 text-blue-400",
    completed: "bg-green-500/20 text-green-400",
  };

  const labels = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
  };

  return (
    <span
      className={`${colors[status]} ${
        small ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"
      } rounded-full`}
    >
      {labels[status]}
    </span>
  );
}

function PriorityBadge({
  priority,
  small,
}: {
  priority: Task["priority"];
  small?: boolean;
}) {
  const colors = {
    low: "bg-zinc-500/20 text-zinc-400",
    medium: "bg-orange-500/20 text-orange-400",
    high: "bg-red-500/20 text-red-400",
  };

  return (
    <span
      className={`${colors[priority]} ${
        small ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"
      } rounded-full capitalize`}
    >
      {priority}
    </span>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "violet" | "yellow" | "blue" | "green";
}) {
  const colors = {
    violet: "from-violet-500/20 to-transparent border-violet-500/30",
    yellow: "from-yellow-500/20 to-transparent border-yellow-500/30",
    blue: "from-blue-500/20 to-transparent border-blue-500/30",
    green: "from-green-500/20 to-transparent border-green-500/30",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-4`}
    >
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-zinc-400">{label}</p>
    </div>
  );
}

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm transition ${
        active
          ? "bg-violet-600 text-white"
          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
      }`}
    >
      {children}
    </button>
  );
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`bg-zinc-800 animate-pulse rounded-lg ${className ?? "h-12"}`}
    />
  );
}

function TaskListSkeleton({ count }: { count: number }) {
  return (
    <div className="space-y-2">
      {[...Array(count)].map((_, i) => (
        <Skeleton key={i} className="h-16" />
      ))}
    </div>
  );
}

function ErrorDisplay({ error }: { error: Error }) {
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
      <p className="font-medium">Error</p>
      <p className="text-sm">{error.message}</p>
    </div>
  );
}




