# `@campus/api` SDK Usage Guide

This package provides a strongly-typed, auto-generated Axios-based API client for the Campus and Clubs backend, generated using `@hey-api/openapi-ts`.

## 1. Client Configuration

The SDK exports a default singleton `client` and a `createClient` factory function from the `@campus/api/client` path.

### Default Singleton Client (Recommended)
You can configure the globally shared client instance early in your application lifecycle (e.g., in a settings or bootstrap file).

```typescript
import { client } from '@campus/api';

// Configure the base URL and the authorization resolver
client.setConfig({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  // Automatically injects `Authorization: Bearer <token>` for secured endpoints
  auth: async () => {
    // Retrieve token from your storage (e.g., cookies or Zustand)
    return getAccessTokenFromStorage(); 
  }
});
```

### Custom Client Instance
If you need multiple distinct clients, you can create them manually:

```typescript
import { createClient } from '@campus/api/client';

export const customClient = createClient({
  baseURL: 'https://api.example.com',
  headers: {
    'X-Custom-Header': 'MyValue'
  }
});
```

## 2. Using SDK Functions

Instead of making manual Axios calls (`axios.post('/url', data)`), you should use the named SDK functions exported from `@campus/api`. These functions handle the URL, HTTP method, and types automatically.

### Basic GET Request
```typescript
import { usersMeRetrieve } from '@campus/api';

async function fetchProfile() {
  try {
    // The default configured `client` is automatically used
    const response = await usersMeRetrieve();
    
    // response.data is fully typed (e.g., UserProfile type)
    console.log(response.data.first_name); 
  } catch (error) {
    console.error('Failed to fetch profile', error);
  }
}
```

### POST/PUT Requests with Data Payload (DTOs)
For requests that require a body, pass the data under the `body` property.

```typescript
import { loginCreate, type CustomTokenObtainPairWritable } from '@campus/api';

async function performLogin(credentials: CustomTokenObtainPairWritable) {
  // loginCreate expects { body: CustomTokenObtainPairWritable }
  const response = await loginCreate({
    body: credentials
  });
  
  // Typed response containing access and refresh tokens
  const { access, refresh } = response.data;
  return { access, refresh };
}
```

## 3. Working with Types

The SDK generates TypeScript types for all models and request/response payloads defined in the OpenAPI schema. Import them directly from `@campus/api`.

### DTOs and Inputs
Use the generated `*Data` or `*Writable` types for function inputs.

```typescript
import type { RegisterWritable, RegisterCreateData } from '@campus/api';

// Use RegisterWritable to type a form state or parameter
const formData: RegisterWritable = {
  email: "test@example.com",
  password: "securepassword",
  first_name: "John",
  last_name: "Doe"
};

// Use it in the API call
import { registerCreate } from '@campus/api';
await registerCreate({ body: formData });
```

### Response Types
Use the `*Response` or `*Responses` types to type the return value.

```typescript
import type { LoginCreateResponse, JwtRefreshCreateResponse } from '@campus/api';

async function handleLogin(): Promise<LoginCreateResponse> {
  const res = await loginCreate({ /* ... */ });
  return res.data; 
}
```

## 4. Interceptors (Axios)

Because the SDK is powered by Axios, you can access the underlying Axios instance to configure interceptors. This is particularly useful for handling `401 Unauthorized` responses and triggering token refreshes.

```typescript
import { client } from '@campus/api';
import { authClient } from '@/features/auth/api/auth.client'; // Your custom wrapper
import { storage } from '@/settings/storage';

// 1. Request Interceptors (Optional)
// Note: You usually don't need this if you configured `client.setConfig({ auth: ... })`
// as Hey-API handles injecting the auth token.

// 2. Response Interceptors (For handling Token Refresh on 401s)
client.instance.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  async (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    const originalRequest = error.config;
    
    // Check if it's an authorization error and we haven't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = storage.token.getRefreshToken();
        if (!refreshToken) throw new Error("No refresh token");

        // Use the SDK to refresh the token
        const refreshResponse = await jwtRefreshCreate({
          body: { refresh: refreshToken }
        });
        
        // Save new tokens
        storage.token.setAccessToken(refreshResponse.data.access);
        storage.token.setRefreshToken(refreshResponse.data.refresh);
        
        // Retry the original request
        // The auth resolver we set in client.setConfig will automatically fetch the new token
        return client.instance(originalRequest);
        
      } catch (refreshError) {
        // Refresh failed (token expired/invalid), logout user
        storage.token.removeAccessToken();
        storage.token.removeRefreshToken();
        // Redirect to login...
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

## 5. Overriding the Client per Request

If you need to bypass the default client for a specific request (e.g., using a custom timeout or a different base URL), you can pass a custom client instance inside the options object:

```typescript
import { createClient } from '@campus/api/client';
import { usersMeRetrieve } from '@campus/api';

const noTimeoutClient = createClient({
  baseURL: 'http://localhost:8000',
  timeout: 0 // No timeout
});

// Pass the custom client as part of the options
await usersMeRetrieve({
  client: noTimeoutClient
});
```






```
# Generated Client Usage Guide (hey-api + axios)

Covers: creating the client, setting the base URL, interceptors, and calling
SDK functions with full DTO/response typing. Examples use the **auth layer**
(JWT create/refresh/verify, login, register, logout, users/me).

---

## 1. Creating the client

`client.gen.ts` already instantiates a default client for you:

```ts
// client.gen.ts (generated)
export const client: Client = createClient(createConfig<ClientOptions2>());
```

Every SDK function (`loginCreate`, `usersMeRetrieve`, etc.) uses this shared
`client` unless you explicitly pass `{ client: someOtherClient }` in the
options. In most apps you don't touch `client.gen.ts` directly — instead you
configure the *existing* client at app startup, or override `createClientConfig`.

### Setting the base URL

```ts
import { client } from "./generated/client.gen";

client.setConfig({
  baseURL: "https://api.example.com",
});
```

**Next.js / SSR note:** if `baseURL` needs to vary per-request (server vs
browser), don't rely on the singleton `setConfig`. Implement
`createClientConfig` — hey-api will call it during client init:

```ts
// generated/client.gen.ts consumer override, e.g. app/hey-api.ts
import type { CreateClientConfig } from "./generated/client.gen";

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});
```

### Creating a second, isolated client (e.g. for a public/unauthenticated instance)

```ts
import { createClient, createConfig } from "./generated/client";

export const publicClient = createClient(
  createConfig({ baseURL: "https://api.example.com" }),
);
```

Pass it explicitly per call:

```ts
await loginCreate({ client: publicClient, body: { username_or_email, password } });
```

---

## 2. Interceptors

The generated client wraps a real `AxiosInstance`, exposed as `client.instance`.
Use standard Axios interceptors on it — hey-api doesn't reinvent this.

### Attaching the access token (request interceptor)

```ts
import { client } from "./generated/client.gen";

client.instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

> Note: the generated SDK already supports auth via the `security` array and
> `client.setConfig({ auth: () => token })` (see §4). Use **either** the
> built-in `auth` callback **or** a manual interceptor — not both, to avoid
> double-setting the header.

### Refreshing on 401 (response interceptor)

```ts
import { client } from "./generated/client.gen";
import { jwtRefreshCreate } from "./generated/sdk.gen";

client.instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      const refresh = localStorage.getItem("refresh_token");

      const { data, error: refreshError } = await jwtRefreshCreate({
        body: { refresh: refresh! },
      });

      if (!refreshError && data) {
        localStorage.setItem("access_token", data.access);
        error.config.headers.Authorization = `Bearer ${data.access}`;
        return client.instance.request(error.config);
      }
    }
    return Promise.reject(error);
  },
);
```

---

## 3. Using the built-in `auth` config (recommended over manual header injection)

`Config.auth` accepts a token or a callback; it's resolved automatically for
any endpoint whose generated call includes a matching `security` entry.

```ts
import { client } from "./generated/client.gen";

client.setConfig({
  auth: () => localStorage.getItem("access_token") ?? undefined,
});
```

This works because `sdk.gen.ts` already declares, per endpoint, what the
scheme is:

```ts
// from sdk.gen.ts — usersMeRetrieve
security: [
  { scheme: "bearer", type: "http" },
  { in: "cookie", name: "sessionid", type: "apiKey" },
],
```

`setAuthParams` (in `utils.gen.ts`) reads this array and injects the token as
a `Bearer` header, a cookie, or a query param — whichever the scheme says —
so you never hardcode `"Bearer " + token` yourself.

---

## 4. Calling SDK functions — auth layer walkthrough

Every generated function returns `{ data, error, response, request }` by
default (`ThrowOnError = false`). Types for the request body (`*Data.body`)
and success response (`*Responses[status]`) are inferred — you get
autocomplete and compile-time checks on both sides.

### 4.1 Register

```ts
import { registerCreate } from "./generated/sdk.gen";
import type { RegisterWritable, Register } from "./generated/types.gen";

async function register(input: RegisterWritable): Promise<Register> {
  const { data, error } = await registerCreate({ body: input });

  if (error) {
    throw new Error("Registration failed");
  }
  return data; // typed as Register: { id, username, email }
}

register({
  username: "asha",
  email: "asha@example.com",
  password: "s3cret!",
  re_password: "s3cret!",
});
```

`RegisterCreateData["body"]` is `RegisterWritable`; `RegisterCreateResponses[201]`
is `Register`. If you pass a body missing `re_password`, TypeScript errors
before the request is ever sent.

### 4.2 Login (custom session-style login)

```ts
import { loginCreate } from "./generated/sdk.gen";
import type { CustomTokenObtainPairWritable } from "./generated/types.gen";

const credentials: CustomTokenObtainPairWritable = {
  username_or_email: "asha@example.com",
  password: "s3cret!",
};

const { data, error } = await loginCreate({ body: credentials });
// data: CustomTokenObtainPair -> { username_or_email: string }
```

### 4.3 JWT create / refresh / verify

```ts
import { jwtCreateCreate, jwtRefreshCreate, jwtVerifyCreate } from "./generated/sdk.gen";
import type { TokenObtainPair, TokenRefresh, TokenVerify } from "./generated/types.gen";

// Obtain access + refresh tokens
const { data: tokens } = await jwtCreateCreate({
  body: { username: "asha", password: "s3cret!" },
});
// tokens: TokenObtainPair -> { username, password, access, refresh }

if (tokens) {
  localStorage.setItem("access_token", tokens.access);
  localStorage.setItem("refresh_token", tokens.refresh);
}

// Refresh
const { data: refreshed } = await jwtRefreshCreate({
  body: { refresh: localStorage.getItem("refresh_token")! },
});
// refreshed: TokenRefresh -> { access, refresh }

// Verify
const { data: verified, error: verifyError } = await jwtVerifyCreate({
  body: { token: localStorage.getItem("access_token")! },
});
if (verifyError) {
  // token invalid/expired
}
```

### 4.4 Current user (`/users/me/`)

```ts
import { usersMeRetrieve, usersMePartialUpdate } from "./generated/sdk.gen";
import type { User, PatchedUserWritable } from "./generated/types.gen";

async function getCurrentUser(): Promise<User | undefined> {
  const { data, error } = await usersMeRetrieve();
  if (error) return undefined;
  return data;
}

async function updateBio(bio: string) {
  const patch: PatchedUserWritable = { bio };
  const { data } = await usersMePartialUpdate({ body: patch });
  return data; // User
}
```

Note `usersMeRetrieve()` takes **no required argument** — its generated
`Options<UsersMeRetrieveData>` type has `body?: never; path?: never; query?: never`,
so the function signature makes `options` itself optional.

### 4.5 Logout

```ts
import { logoutCreate } from "./generated/sdk.gen";

async function logout() {
  await logoutCreate();
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}
```

### 4.6 Throwing instead of returning `error`

Pass `throwOnError: true` per call when you'd rather use try/catch:

```ts
try {
  const response = await usersMeRetrieve({ throwOnError: true });
  console.log(response.data); // User — response.data is never undefined here
} catch (err) {
  // AxiosError
}
```

---

## 5. Quick reference — auth endpoints

| Function | Method | Path | Body type | Success response |
|---|---|---|---|---|
| `registerCreate` | POST | `/api/v1/accounts/auth/register/` | `RegisterWritable` | `Register` (201) |
| `loginCreate` | POST | `/api/v1/accounts/auth/login/` | `CustomTokenObtainPairWritable` | `CustomTokenObtainPair` |
| `logoutCreate` | POST | `/api/v1/accounts/auth/logout/` | — | `unknown` (200, no body) |
| `jwtCreateCreate` | POST | `/api/v1/accounts/auth/jwt/create/` | `TokenObtainPair` (username/password) | `TokenObtainPair` |
| `jwtRefreshCreate` | POST | `/api/v1/accounts/auth/jwt/refresh/` | `TokenRefreshWritable` | `TokenRefresh` |
| `jwtVerifyCreate` | POST | `/api/v1/accounts/auth/jwt/verify/` | `TokenVerify` | `TokenVerify` |
| `usersMeRetrieve` | GET | `/api/v1/accounts/auth/users/me/` | — | `User` |
| `usersMePartialUpdate` | PATCH | `/api/v1/accounts/auth/users/me/` | `PatchedUserWritable` | `User` |
| `usersMeUpdate` | PUT | `/api/v1/accounts/auth/users/me/` | `UserWritable` | `User` |
| `usersMeDestroy` | DELETE | `/api/v1/accounts/auth/users/me/` | — | `void` (204) |
| `usersResetPasswordCreate` | POST | `/api/v1/accounts/auth/users/reset_password/` | `SendEmailReset` | `SendEmailReset` |
| `usersResetPasswordConfirmCreate` | POST | `/api/v1/accounts/auth/users/reset_password_confirm/` | `PasswordResetConfirmRetype` | `PasswordResetConfirmRetype` |
| `usersSetPasswordCreate` | POST | `/api/v1/accounts/auth/users/set_password/` | `SetPassword` | `SetPassword` |

---

**Open question for the next section:** do you want the same treatment
(client → base URL → interceptors → typed calls) next for the **users/clubs
layer** (`usersList`, `usersRetrieve`, `usersUserRetrieve`, `usersActivityRetrieve`,
`usersClubsRetrieve`), or do you want to fix the critiques first (e.g. adding
Zod validation, restructuring the SDK into namespaced classes) before
documenting more surface area?

```