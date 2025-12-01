---
name: api-reviewer
description: Review axios API layer, interceptors, and HTTP service patterns. Use PROACTIVELY when editing files importing axios or containing API/HTTP client code.
tools: Read, Grep, Glob
---

# API Layer Review

Apply when reviewing or editing API services and HTTP client configurations.

## When to Apply

- Files importing `axios` or creating axios instances
- Files with `*Api.ts`, `*Service.ts`, `*.api.ts`, `*.service.ts` naming
- Files configuring HTTP interceptors
- Any file making HTTP requests to backend APIs

## Checklist

### Axios Instances

- [ ] Base URL configured per environment (not hardcoded)
- [ ] Auth token injection via request interceptor (if applicable)
- [ ] Response interceptors handle common errors (401, 403, 500)
- [ ] Request cancellation supported (AbortController or CancelToken)
- [ ] Timeout configured appropriately

### API Services

- [ ] Consistent error handling pattern
- [ ] Types for request/response bodies (no `any`)
- [ ] Support for request cancellation on long-running requests
- [ ] No hardcoded URLs (use config, env vars, or constants)
- [ ] RESTful conventions followed

### Request Patterns

```ts
// GOOD: Typed request with cancellation (modern approach)
export const getItems = async (
  params: GetItemsParams,
  signal?: AbortSignal
): Promise<Item[]> => {
  const { data } = await api.get<Item[]>('/items', { params, signal });
  return data;
};

// GOOD: Typed request with CancelToken (legacy axios)
export const getItems = (
  params: GetItemsParams,
  cancelToken?: CancelToken
): Promise<Item[]> =>
  api.get('/items', { params, cancelToken }).then(r => r.data);

// BAD: No typing
export const getItems = (params: any) => api.get('/items', { params });

// BAD: Hardcoded URL
api.get('https://api.example.com/items');

// BAD: No error handling
const data = await api.get('/items'); // What if it fails?
```

### Security

- [ ] No sensitive data in URLs (use body/headers)
- [ ] Authorization header properly attached via interceptor
- [ ] Token refresh handling on 401 (if applicable)
- [ ] No credentials logged or exposed
- [ ] HTTPS enforced in production

### Error Handling

```ts
// GOOD: Centralized error handling in interceptor
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle unauthorized (logout, refresh token, etc.)
    }
    if (error.response?.status >= 500) {
      // Log server errors
    }
    return Promise.reject(error);
  }
);

// GOOD: Service-level error transformation
export const getItems = async (params: GetItemsParams): Promise<Item[]> => {
  try {
    const { data } = await api.get<Item[]>('/items', { params });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(error.response?.status, error.message);
    }
    throw error;
  }
};
```

### Anti-patterns to Flag

- Direct `fetch()` when project uses axios (consistency)
- Missing error handling
- Mixing async/await with `.then()` in same function
- Untyped responses (`as any`, missing generics)
- Missing cancellation support for list/search/autocomplete endpoints
- Credentials or tokens in URL query params
- Console.log of sensitive data (tokens, passwords)
