# TanStack Query Guide

> Data fetching, caching, and synchronization for React components.

## Quick Start

```tsx
import { useQuery, useMutation, queryKeys, useQueryClient } from "@/lib/query";

// Fetch data
const { data, isLoading, error } = useQuery({
  queryKey: queryKeys.user.detail(userId),
  queryFn: () => fetch(`/api/user/${userId}`).then(res => res.json()),
});

// Mutate data
const mutation = useMutation({
  mutationFn: (data) => fetch('/api/user', { method: 'POST', body: JSON.stringify(data) }),
});
```

---

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Query Keys](#query-keys)
3. [Fetching Data](#fetching-data)
4. [Mutations](#mutations)
5. [Cache Invalidation](#cache-invalidation)
6. [Loading & Error States](#loading--error-states)
7. [Optimistic Updates](#optimistic-updates)
8. [Pagination & Infinite Scroll](#pagination--infinite-scroll)
9. [Prefetching](#prefetching)
10. [Best Practices](#best-practices)
11. [Developer Guide: Adding New Features](#developer-guide-adding-new-features)
12. [Common Patterns](#common-patterns)
13. [Troubleshooting](#troubleshooting)

---

## Core Concepts

### What TanStack Query Handles

| Concern | How It Helps |
|---------|--------------|
| **Caching** | Stores fetched data, prevents duplicate requests |
| **Deduplication** | Multiple components requesting same data = 1 request |
| **Background Updates** | Refetches stale data automatically |
| **Loading States** | Built-in `isLoading`, `isFetching`, `isError` |
| **Error Handling** | Automatic retries, error boundaries support |

### When to Use

✅ **Use TanStack Query for:**
- API calls to fetch server data
- Data that multiple components share
- Data that needs caching and synchronization
- Paginated or infinite lists

❌ **Don't use for:**
- Local UI state (use `useState`)
- Form state (use form libraries)
- Global client state (use Zustand/Context)

---

## Query Keys

Query keys uniquely identify cached data. Use our factory pattern for consistency.

### Import

```tsx
import { queryKeys } from "@/lib/query";
```

### Available Keys

```tsx
// User
queryKeys.user.all                    // ['user']
queryKeys.user.detail(id)             // ['user', id]
queryKeys.user.credits(id)            // ['user', id, 'credits']
queryKeys.user.preferences(id)        // ['user', id, 'preferences']
queryKeys.user.subscription(id)       // ['user', id, 'subscription']

// Images
queryKeys.images.all                  // ['images']
queryKeys.images.list(filters)        // ['images', 'list', filters]
queryKeys.images.detail(id)           // ['images', id]
queryKeys.images.history(userId, page)// ['images', 'history', userId, page]

// Videos
queryKeys.videos.all                  // ['videos']
queryKeys.videos.list(filters)        // ['videos', 'list', filters]
queryKeys.videos.detail(id)           // ['videos', id]
queryKeys.videos.history(userId, page)// ['videos', 'history', userId, page]

// Models
queryKeys.models.all                  // ['models']
queryKeys.models.list(type)           // ['models', 'list', type]
queryKeys.models.detail(id)           // ['models', id]

// Explore
queryKeys.explore.all                 // ['explore']
queryKeys.explore.featured()          // ['explore', 'featured']
queryKeys.explore.list(filters)       // ['explore', 'list', filters]

// Credits
queryKeys.credits.all                 // ['credits']
queryKeys.credits.balance(userId)     // ['credits', 'balance', userId]
queryKeys.credits.transactions(userId, filters) // ['credits', 'transactions', userId, filters]
```

### Adding New Keys

Edit `lib/query/query-keys.ts`:

```tsx
export const newEntityKeys = {
  all: ["newEntity"] as const,
  detail: (id: string) => ["newEntity", id] as const,
  list: (filters?: Filters) => ["newEntity", "list", filters ?? {}] as const,
};

// Add to unified object
export const queryKeys = {
  // ... existing
  newEntity: newEntityKeys,
} as const;
```

---

## Fetching Data

### Basic Query

```tsx
import { useQuery, queryKeys } from "@/lib/query";

function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.user.detail(userId),
    queryFn: async () => {
      const res = await fetch(`/api/user/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;
  return <div>{data.name}</div>;
}
```

### Query with Custom Options

```tsx
import { useQuery, queryKeys, STALE_TIME_LONG } from "@/lib/query";

const { data } = useQuery({
  queryKey: queryKeys.models.list("image"),
  queryFn: fetchImageModels,
  staleTime: STALE_TIME_LONG,     // 5 minutes
  enabled: !!userId,              // Only fetch when userId exists
  select: (data) => data.models,  // Transform response
});
```

### Available Stale Times

```tsx
import { 
  STALE_TIME_SHORT,    // 30 seconds
  STALE_TIME_DEFAULT,  // 1 minute
  STALE_TIME_LONG,     // 5 minutes
  STALE_TIME_EXTENDED, // 30 minutes
  STALE_TIME_INFINITE, // Never stale
} from "@/lib/query";
```

### Reusable Query Options

Define in `hooks/queries/index.ts`:

```tsx
import { queryOptions } from "@tanstack/react-query";

export function userQueryOptions(userId: string) {
  return queryOptions({
    queryKey: queryKeys.user.detail(userId),
    queryFn: () => fetchUser(userId),
    staleTime: STALE_TIME_LONG,
  });
}

// Usage
const { data } = useQuery(userQueryOptions(userId));
```

---

## Mutations

### Basic Mutation

```tsx
import { useMutation, useQueryClient, queryKeys } from "@/lib/query";

function CreateImage() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: CreateImageParams) => {
      const res = await fetch("/api/images", {
        method: "POST",
        body: JSON.stringify(params),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.images.all });
    },
  });

  return (
    <button 
      onClick={() => mutation.mutate({ prompt: "A sunset" })}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? "Creating..." : "Create"}
    </button>
  );
}
```

### Mutation States

```tsx
const mutation = useMutation({ mutationFn });

mutation.isPending  // Currently executing
mutation.isSuccess  // Completed successfully
mutation.isError    // Failed
mutation.error      // Error object
mutation.data       // Success response
mutation.reset()    // Reset state
```

---

## Cache Invalidation

### Invalidate Queries

```tsx
const queryClient = useQueryClient();

// Invalidate all user queries
queryClient.invalidateQueries({ queryKey: queryKeys.user.all });

// Invalidate specific user
queryClient.invalidateQueries({ queryKey: queryKeys.user.detail(userId) });

// Invalidate with exact match only
queryClient.invalidateQueries({ 
  queryKey: queryKeys.images.list({ status: "completed" }),
  exact: true,
});
```

### Invalidation Hierarchy

```
queryKeys.user.all          → Invalidates ALL user queries
  └─ queryKeys.user.detail(id)  → Only this user
      └─ queryKeys.user.credits(id)  → Only this user's credits
```

### Manual Cache Updates

```tsx
// Set data directly (useful after mutations)
queryClient.setQueryData(
  queryKeys.user.detail(userId),
  (old) => ({ ...old, name: newName })
);

// Remove from cache
queryClient.removeQueries({ queryKey: queryKeys.user.detail(userId) });
```

---

## Loading & Error States

### All Available States

```tsx
const {
  data,           // The fetched data
  error,          // Error object if failed
  isLoading,      // First load, no cached data
  isFetching,     // Any fetch in progress (including background)
  isError,        // Query is in error state
  isSuccess,      // Query completed successfully
  isPending,      // No data yet (similar to isLoading)
  isStale,        // Data is stale
  refetch,        // Function to manually refetch
  status,         // 'pending' | 'error' | 'success'
  fetchStatus,    // 'fetching' | 'paused' | 'idle'
} = useQuery({ queryKey, queryFn });
```

### Recommended Pattern

```tsx
function Component() {
  const { data, isLoading, error } = useQuery(options);

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  
  return <DataDisplay data={data} />;
}
```

### Background Updates Indicator

```tsx
function List() {
  const { data, isFetching } = useQuery(options);

  return (
    <div>
      {isFetching && <RefreshingIndicator />}
      <Items data={data} />
    </div>
  );
}
```

---

## Optimistic Updates

Update UI immediately, rollback on error.

```tsx
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: updateUser,
  
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: queryKeys.user.detail(userId) });
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(queryKeys.user.detail(userId));
    
    // Optimistically update
    queryClient.setQueryData(queryKeys.user.detail(userId), (old) => ({
      ...old,
      ...newData,
    }));
    
    // Return context for rollback
    return { previous };
  },
  
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(queryKeys.user.detail(userId), context?.previous);
  },
  
  onSettled: () => {
    // Always refetch to ensure consistency
    queryClient.invalidateQueries({ queryKey: queryKeys.user.detail(userId) });
  },
});
```

---

## Pagination & Infinite Scroll

### Basic Pagination

```tsx
import { useQuery, queryKeys } from "@/lib/query";

function ImageList({ page }: { page: number }) {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.images.list({ page, limit: 20 }),
    queryFn: () => fetchImages({ page, limit: 20 }),
  });

  return <Grid images={data?.images} />;
}
```

### Infinite Scroll

```tsx
import { useInfiniteQuery, queryKeys } from "@/lib/query";

function InfiniteImageList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: queryKeys.images.all,
    queryFn: ({ pageParam = 1 }) => fetchImages({ page: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
    initialPageParam: 1,
  });

  const allImages = data?.pages.flatMap(page => page.images) ?? [];

  return (
    <>
      <Grid images={allImages} />
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? "Loading..." : "Load More"}
        </button>
      )}
    </>
  );
}
```

---

## Prefetching

### In Event Handlers

```tsx
const queryClient = useQueryClient();

const handleHover = () => {
  queryClient.prefetchQuery({
    queryKey: queryKeys.user.detail(userId),
    queryFn: () => fetchUser(userId),
  });
};

<Link onMouseEnter={handleHover} href={`/user/${userId}`}>
  View Profile
</Link>
```

### In Server Components (Next.js)

```tsx
// app/user/[id]/page.tsx
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, queryKeys } from "@/lib/query";

export default async function UserPage({ params }: { params: { id: string } }) {
  const queryClient = getQueryClient();
  
  await queryClient.prefetchQuery({
    queryKey: queryKeys.user.detail(params.id),
    queryFn: () => fetchUser(params.id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserProfile userId={params.id} />
    </HydrationBoundary>
  );
}
```

---

## Best Practices

### ✅ Do

1. **Use query keys factory** - Always use `queryKeys.*` for consistency
2. **Set staleTime > 0** - Prevents unnecessary refetches
3. **Handle all states** - Loading, error, success
4. **Invalidate after mutations** - Keep cache in sync
5. **Use enabled option** - Prevent queries until ready
6. **Use select** - Transform data at query level, not component

### ❌ Don't

1. **Don't use inline query keys** - Use the factory pattern
2. **Don't ignore errors** - Always handle error state
3. **Don't mutate query data directly** - Use setQueryData
4. **Don't over-invalidate** - Be specific with invalidation
5. **Don't fetch in useEffect** - Use useQuery instead

### Code Organization

```
hooks/
  queries/
    index.ts          # Re-exports all hooks
    use-user.ts       # User-related queries
    use-images.ts     # Image-related queries
    use-videos.ts     # Video-related queries
```

### Example Custom Hook

```tsx
// hooks/queries/use-user.ts
import { useQuery, useMutation, useQueryClient, queryKeys } from "@/lib/query";

export function useUser(userId: string) {
  return useQuery({
    queryKey: queryKeys.user.detail(userId),
    queryFn: () => fetchUser(userId),
    enabled: !!userId,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUser,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.detail(variables.id) });
    },
  });
}
```

---

## Developer Guide: Adding New Features

Step-by-step guides for common development tasks.

### Adding New Query Keys

When you need to fetch a new entity type (e.g., "projects").

**Step 1: Define the keys factory** in `lib/query/query-keys.ts`

```tsx
// 1. Define filter types if needed
export interface ProjectFilters {
  status?: "active" | "archived" | "draft";
  userId?: string;
  page?: number;
  limit?: number;
}

// 2. Create the keys factory
export const projectKeys = {
  /** Base key - use for invalidating ALL project queries */
  all: ["projects"] as const,

  /** List with filters */
  list: (filters?: ProjectFilters) => ["projects", "list", filters ?? {}] as const,

  /** Single project */
  detail: (projectId: string) => ["projects", projectId] as const,

  /** Project members */
  members: (projectId: string) => ["projects", projectId, "members"] as const,

  /** Project by user */
  byUser: (userId: string) => ["projects", "user", userId] as const,
};

// 3. Add to unified queryKeys object
export const queryKeys = {
  user: userKeys,
  images: imageKeys,
  videos: videoKeys,
  models: modelKeys,
  explore: exploreKeys,
  credits: creditKeys,    // Built-in for credit system
  projects: projectKeys,  // ← Add here
} as const;

// 4. Export types
export type ProjectKeys = typeof projectKeys;
```

**Step 2: Export from index** in `lib/query/index.ts`

```tsx
export {
  queryKeys,
  // ... existing exports
  projectKeys,           // ← Add export
  type ProjectFilters,   // ← Add type export
  type ProjectKeys,      // ← Add type export
} from "./query-keys";
```

---

### Adding a New Query Hook

When you need to create a reusable hook for fetching data.

**Step 1: Create the hook file** `hooks/queries/use-projects.ts`

```tsx
import { useQuery, useQueryClient, queryKeys, STALE_TIME_LONG } from "@/lib/query";
import type { ProjectFilters } from "@/lib/query";

// Types
interface Project {
  id: string;
  name: string;
  status: "active" | "archived" | "draft";
  userId: string;
  createdAt: string;
}

interface ProjectsResponse {
  projects: Project[];
  total: number;
  page: number;
  hasMore: boolean;
}

// API functions (keep private to this file)
async function fetchProjects(filters?: ProjectFilters): Promise<ProjectsResponse> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.page) params.set("page", String(filters.page));
  if (filters?.limit) params.set("limit", String(filters.limit));

  const res = await fetch(`/api/projects?${params}`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

async function fetchProject(projectId: string): Promise<Project> {
  const res = await fetch(`/api/projects/${projectId}`);
  if (!res.ok) throw new Error("Failed to fetch project");
  return res.json();
}

// Query Hooks
export function useProjects(filters?: ProjectFilters) {
  return useQuery({
    queryKey: queryKeys.projects.list(filters),
    queryFn: () => fetchProjects(filters),
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => fetchProject(projectId),
    enabled: !!projectId,
    staleTime: STALE_TIME_LONG,
  });
}

// Prefetch helper (for hover/navigation optimization)
export function usePrefetchProject() {
  const queryClient = useQueryClient();

  return (projectId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.projects.detail(projectId),
      queryFn: () => fetchProject(projectId),
    });
  };
}
```

**Step 2: Export from index** `hooks/queries/index.ts`

```tsx
// ... existing exports
export * from "./use-projects";
```

### Credit Hooks (Built-in)

The project includes credit hooks for balance and transaction history:

```tsx
import { 
  useUserCredits,        // Fetch user's credit balance
  useTransactionHistory, // Fetch transaction history with pagination
  useCreditsCheck,       // Simple hasEnough(amount) helper
  useInvalidateCredits,  // Invalidate cache after credit changes
} from "@/hooks/queries";

// Display balance
const { data, isLoading } = useUserCredits(userId);
console.log(data?.credits);

// Check before expensive operation
const { hasEnough, balance } = useCreditsCheck(userId);
if (!hasEnough(requiredCredits)) {
  showUpgradeModal();
}

// Invalidate after process starts/completes
const invalidateCredits = useInvalidateCredits();
invalidateCredits(userId);
```

**Step 3: Use in components**

```tsx
import { useProjects, useProject } from "@/hooks/queries";

function ProjectList() {
  const { data, isLoading } = useProjects({ status: "active" });
  // ...
}

function ProjectDetail({ id }: { id: string }) {
  const { data: project } = useProject(id);
  // ...
}
```

---

### Adding a New Mutation Hook

When you need to create, update, or delete data.

**Step 1: Add to your hooks file** `hooks/queries/use-projects.ts`

```tsx
import { useMutation, useQueryClient, queryKeys } from "@/lib/query";

// Types
interface CreateProjectInput {
  name: string;
  description?: string;
}

interface UpdateProjectInput {
  id: string;
  name?: string;
  status?: "active" | "archived" | "draft";
}

// API functions
async function createProject(input: CreateProjectInput): Promise<Project> {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create project");
  return res.json();
}

async function updateProject(input: UpdateProjectInput): Promise<Project> {
  const res = await fetch(`/api/projects/${input.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to update project");
  return res.json();
}

async function deleteProject(projectId: string): Promise<void> {
  const res = await fetch(`/api/projects/${projectId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete project");
}

// Mutation Hooks

/**
 * Create a new project
 * Invalidates the projects list after success
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      // Invalidate all project lists to show the new project
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
    onError: (error) => {
      console.error("Failed to create project:", error);
    },
  });
}

/**
 * Update an existing project
 * Invalidates both the specific project and lists
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProject,
    onSuccess: (data, variables) => {
      // Update the cache immediately with returned data
      queryClient.setQueryData(
        queryKeys.projects.detail(variables.id),
        data
      );
      // Invalidate lists (in case status changed, affecting filters)
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.list(),
        exact: false,
      });
    },
  });
}

/**
 * Delete a project
 * Removes from cache and invalidates lists
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: (_, projectId) => {
      // Remove the specific project from cache
      queryClient.removeQueries({
        queryKey: queryKeys.projects.detail(projectId),
      });
      // Invalidate all lists
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
}
```

**Step 2: Use in components**

```tsx
import { useCreateProject, useUpdateProject, useDeleteProject } from "@/hooks/queries";

function CreateProjectForm() {
  const createProject = useCreateProject();

  const handleSubmit = (data: CreateProjectInput) => {
    createProject.mutate(data, {
      onSuccess: (newProject) => {
        toast.success("Project created!");
        router.push(`/projects/${newProject.id}`);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={createProject.isPending}>
        {createProject.isPending ? "Creating..." : "Create Project"}
      </button>
    </form>
  );
}
```

---

### Adding Optimistic Updates to a Mutation

When you want instant UI feedback before the server responds.

**When to use:**
- Toggle actions (like/unlike, follow/unfollow)
- Updates where the result is predictable
- Better UX for frequently used actions

**Step 1: Modify your mutation hook**

```tsx
export function useToggleProjectStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "active" | "archived" }) => {
      const res = await fetch(`/api/projects/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },

    // Called BEFORE mutationFn
    onMutate: async ({ id, status }) => {
      // 1. Cancel any outgoing refetches (prevents overwriting optimistic update)
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.detail(id) });

      // 2. Snapshot the previous value (for rollback)
      const previousProject = queryClient.getQueryData<Project>(
        queryKeys.projects.detail(id)
      );

      // 3. Optimistically update the cache
      if (previousProject) {
        queryClient.setQueryData(queryKeys.projects.detail(id), {
          ...previousProject,
          status,
        });
      }

      // 4. Return context with snapshot
      return { previousProject };
    },

    // Called on error - rollback
    onError: (err, variables, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(
          queryKeys.projects.detail(variables.id),
          context.previousProject
        );
      }
      toast.error("Failed to update status");
    },

    // Called on success OR error - sync with server
    onSettled: (data, error, variables) => {
      // Always refetch to ensure cache matches server
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(variables.id),
      });
    },
  });
}
```

---

### Setting Up Invalidation Strategy

**Principle: Invalidate the minimum necessary to keep data fresh.**

**Invalidation Decision Tree:**

```
Did you CREATE something?
  → Invalidate LIST queries (new item needs to appear)
  
Did you UPDATE something?
  → Update specific item cache with setQueryData
  → Invalidate lists IF the update affects filtering/sorting

Did you DELETE something?
  → Remove item with removeQueries
  → Invalidate LIST queries (item needs to disappear)
```

**Invalidation Patterns by Operation:**

```tsx
const queryClient = useQueryClient();

// CREATE - invalidate lists only
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
}

// UPDATE - update specific, optionally invalidate lists
onSuccess: (updatedProject) => {
  // Directly update cache (instant)
  queryClient.setQueryData(
    queryKeys.projects.detail(updatedProject.id),
    updatedProject
  );
  
  // Only invalidate lists if status/filters might have changed
  if (statusChanged) {
    queryClient.invalidateQueries({
      queryKey: queryKeys.projects.list(),
      exact: false, // Matches all list variations
    });
  }
}

// DELETE - remove and invalidate lists
onSuccess: (_, deletedId) => {
  queryClient.removeQueries({
    queryKey: queryKeys.projects.detail(deletedId),
  });
  queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
}
```

**Cross-Entity Invalidation:**

When one mutation affects multiple entities:

```tsx
// Creating a project might affect user stats
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: (newProject) => {
      // Invalidate project lists
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      
      // Also invalidate user's project count/stats
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.detail(newProject.userId),
      });
    },
  });
}
```

---

### Adding Server-Side Prefetching (SSR)

When you want data ready on initial page load.

**Step 1: Create the server component wrapper**

```tsx
// app/projects/[id]/page.tsx
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient, queryKeys } from "@/lib/query";
import { ProjectDetail } from "./project-detail";

// Server Component
export default async function ProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const queryClient = getQueryClient();

  // Prefetch on server
  await queryClient.prefetchQuery({
    queryKey: queryKeys.projects.detail(params.id),
    queryFn: () => fetchProject(params.id), // Your server-side fetch
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProjectDetail projectId={params.id} />
    </HydrationBoundary>
  );
}
```

**Step 2: Use normally in client component**

```tsx
// app/projects/[id]/project-detail.tsx
"use client";

import { useProject } from "@/hooks/queries";

export function ProjectDetail({ projectId }: { projectId: string }) {
  // Data is already in cache from SSR - no loading state on initial render
  const { data: project, isLoading } = useProject(projectId);

  if (isLoading) return <Skeleton />;  // Only shows on client-side navigation
  return <div>{project.name}</div>;
}
```

---

### Adding a New Stale Time Configuration

When default stale times don't fit your use case.

**Step 1: Add to constants** `constants/query.ts`

```tsx
/**
 * Real-time stale time - for data that changes frequently
 * Use for: live status, notifications, activity feeds
 */
export const STALE_TIME_REALTIME = 10 * 1000; // 10 seconds

/**
 * Static stale time - for data that rarely changes
 * Use for: configuration, feature flags, static content
 */
export const STALE_TIME_STATIC = 60 * 60 * 1000; // 1 hour
```

**Step 2: Export from lib/query** `lib/query/index.ts`

```tsx
export {
  // ... existing
  STALE_TIME_REALTIME,
  STALE_TIME_STATIC,
} from "@/constants/query";
```

**Step 3: Use in queries**

```tsx
import { STALE_TIME_REALTIME, STALE_TIME_STATIC } from "@/lib/query";

// Live data - refetch frequently
const { data: status } = useQuery({
  queryKey: ["job", jobId, "status"],
  queryFn: fetchJobStatus,
  staleTime: STALE_TIME_REALTIME,
});

// Static config - cache for long time
const { data: config } = useQuery({
  queryKey: ["app", "config"],
  queryFn: fetchAppConfig,
  staleTime: STALE_TIME_STATIC,
});
```

---

### Checklist: Adding a New Feature

Use this checklist when adding new TanStack Query functionality:

- [ ] **Query Keys**: Added to `lib/query/query-keys.ts`
- [ ] **Types**: Defined filter/response types
- [ ] **Exports**: Added to `lib/query/index.ts`
- [ ] **Hook File**: Created in `hooks/queries/`
- [ ] **Query Hooks**: `useEntity()`, `useEntities(filters)` 
- [ ] **Mutation Hooks**: `useCreateEntity()`, `useUpdateEntity()`, `useDeleteEntity()`
- [ ] **Invalidation**: Proper keys invalidated after mutations
- [ ] **Error Handling**: Errors handled in hooks or components
- [ ] **Loading States**: Loading/error states handled in UI
- [ ] **Hook Export**: Added to `hooks/queries/index.ts`
- [ ] **SSR**: Prefetching added for pages that need it

---

## Common Patterns

### Conditional Fetching

```tsx
const { data } = useQuery({
  queryKey: queryKeys.user.detail(userId),
  queryFn: fetchUser,
  enabled: !!userId && isAuthenticated, // Only fetch when conditions met
});
```

### Dependent Queries

```tsx
// First query
const { data: user } = useQuery({
  queryKey: queryKeys.user.detail(userId),
  queryFn: () => fetchUser(userId),
});

// Depends on first query
const { data: posts } = useQuery({
  queryKey: ["posts", user?.id],
  queryFn: () => fetchUserPosts(user!.id),
  enabled: !!user?.id, // Only runs after user is fetched
});
```

### Parallel Queries

```tsx
import { useQueries, queryKeys } from "@/lib/query";

const results = useQueries({
  queries: [
    { queryKey: queryKeys.user.detail(userId), queryFn: fetchUser },
    { queryKey: queryKeys.user.credits(userId), queryFn: fetchCredits },
  ],
});

const [userResult, creditsResult] = results;
```

### Polling

```tsx
const { data } = useQuery({
  queryKey: queryKeys.images.detail(imageId),
  queryFn: () => fetchImage(imageId),
  refetchInterval: (query) => {
    // Poll while processing, stop when done
    return query.state.data?.status === "processing" ? 2000 : false;
  },
});
```

---

## Troubleshooting

### Query not refetching

Check:
- `staleTime` - Data might still be fresh
- `enabled` - Query might be disabled
- Query key - Ensure it changes when params change

### Duplicate requests

Check:
- Multiple components with different instances
- Query key inconsistency (use factory!)
- Missing `staleTime`

### Cache not updating after mutation

Ensure you're invalidating the correct keys:

```tsx
// ❌ Won't work - wrong key structure
queryClient.invalidateQueries({ queryKey: ["user"] });

// ✅ Correct - use factory
queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
```

### DevTools

Open React Query DevTools (bottom-right in dev) to:
- Inspect query cache
- See query status
- Manually invalidate/refetch
- Debug timing issues

---

## Project Configuration

### Default Settings

| Setting | Value | Location |
|---------|-------|----------|
| `staleTime` | 1 minute | `constants/query.ts` |
| `gcTime` | 5 minutes | `constants/query.ts` |
| `retry` | 4 | `constants/query.ts` |
| `refetchOnWindowFocus` | false | `constants/query.ts` |

### Files Reference

| File | Purpose |
|------|---------|
| `lib/query/index.ts` | Main exports |
| `lib/query/query-client.ts` | QueryClient factory |
| `lib/query/query-provider.tsx` | Provider component |
| `lib/query/query-keys.ts` | Query key factory |
| `constants/query.ts` | Configuration constants |
| `hooks/queries/index.ts` | Custom query hooks |
| `hooks/queries/use-credits.ts` | Credit balance & transaction hooks |
| `hooks/queries/use-process.ts` | Process status + Ably hooks |

---

## Quick Reference

```tsx
// Import everything you need
import { 
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  queryKeys,
  STALE_TIME_LONG,
} from "@/lib/query";

// Basic fetch
useQuery({ queryKey: queryKeys.x.y, queryFn: fetchFn })

// Mutation with invalidation
const qc = useQueryClient();
useMutation({ 
  mutationFn, 
  onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.x.all }) 
})

// Invalidate cache
queryClient.invalidateQueries({ queryKey: queryKeys.x.all })

// Set cache directly
queryClient.setQueryData(queryKeys.x.y, newData)
```

