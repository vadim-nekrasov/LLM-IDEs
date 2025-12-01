---
name: api-reviewer
description: Reviews HTTP client code, API services, and data fetching patterns. Use PROACTIVELY when editing files with fetch, axios, React Query, SWR, API calls, or data fetching hooks. Triggers on *Api.ts, *Service.ts, *.api.ts patterns.
tools: Read, Grep, Glob
---

# HTTP Client & API Review

Apply when reviewing or editing API services and HTTP client code.

## When to Apply

- Files making HTTP requests (fetch, axios, ky, got, etc.)
- Files with `*Api.ts`, `*Service.ts`, `*.api.ts`, `*.service.ts` naming
- Files using data fetching libraries (React Query, SWR, Apollo, etc.)
- Files configuring HTTP interceptors or middleware

## Universal Checklist

### HTTP Client Configuration

- [ ] Base URL configured per environment (not hardcoded)
- [ ] Timeout configured appropriately
- [ ] Request/response interceptors or middleware for common concerns
- [ ] Error handling strategy defined

### API Services

- [ ] Consistent error handling pattern across services
- [ ] Types for request/response bodies (no `any`)
- [ ] No hardcoded URLs (use config, env vars, or constants)
- [ ] RESTful or GraphQL conventions followed consistently

### Request Cancellation

- [ ] Long-running requests support cancellation (AbortController)
- [ ] Search/autocomplete requests cancel previous on new input
- [ ] Component unmount cancels pending requests

### Patterns by Client Type

#### Native Fetch
```ts
// GOOD: Typed with cancellation
export const getItems = async (
  params: GetItemsParams,
  signal?: AbortSignal
): Promise<Item[]> => {
  const url = new URL('/api/items', BASE_URL);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  const response = await fetch(url, { signal });
  if (!response.ok) throw new ApiError(response.status);
  return response.json();
};
```

#### Axios
```ts
// GOOD: Typed request with signal
export const getItems = async (
  params: GetItemsParams,
  signal?: AbortSignal
): Promise<Item[]> => {
  const { data } = await api.get<Item[]>('/items', { params, signal });
  return data;
};
```

#### React Query / TanStack Query
```ts
// GOOD: Query with proper key and types
export const useItems = (params: GetItemsParams) =>
  useQuery({
    queryKey: ['items', params],
    queryFn: ({ signal }) => getItems(params, signal),
  });
```

#### SWR
```ts
// GOOD: SWR with fetcher
export const useItems = (params: GetItemsParams) =>
  useSWR(['items', params], ([, params]) => getItems(params));
```

### Security

- [ ] No sensitive data in URLs (use body/headers)
- [ ] Authorization header properly attached
- [ ] Token refresh handling on 401 (if applicable)
- [ ] No credentials logged or exposed
- [ ] HTTPS enforced in production

### Error Handling

```ts
// GOOD: Centralized error transformation
class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
  }
}

// GOOD: Error boundary for API errors
const handleApiError = (error: unknown): never => {
  if (error instanceof ApiError) throw error;
  if (error instanceof Error) {
    throw new ApiError(500, error.message);
  }
  throw new ApiError(500, 'Unknown error');
};
```

### Anti-patterns to Flag

- Missing error handling
- Mixing different HTTP clients without reason
- Untyped responses (`as any`, missing generics)
- Missing cancellation support for search/autocomplete
- Credentials or tokens in URL query params
- Console.log of sensitive data (tokens, passwords)
- Hardcoded API URLs
- No loading/error states in UI layer
