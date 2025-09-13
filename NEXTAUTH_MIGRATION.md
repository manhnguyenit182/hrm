# NextAuth Migration Guide

Hệ thống auth đã được chuyển đổi từ custom JWT sang NextAuth.js. Dưới đây là những thay đổi chính:

## Thay đổi chính

### 1. Cấu hình NextAuth

- File cấu hình: `src/lib/auth-config.ts`
- API routes: `src/app/api/auth/[...nextauth]/route.ts`
- Type definitions: `src/types/next-auth.d.ts`

### 2. Environment Variables

Thêm vào file `.env.local`:

```bash
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here"
```

### 3. Providers được sử dụng

- **CredentialsProvider**: Đăng nhập bằng email/password thông qua database

### 4. Session Management

- Strategy: JWT
- MaxAge: 24 giờ
- Custom session và JWT callbacks để persist user data

## Sử dụng

### Client-side

```tsx
import { useAuth } from "@/hooks/useAuth";

function Component() {
  const { user, loading, login, logout } = useAuth();

  // login, logout hoạt động như cũ
  await login(email, password);
  await logout();
}
```

### Server-side

```tsx
import { verifyAuth, requireAuth } from "@/lib/auth";

// Trong server components
const { isValid, user } = await verifyAuth();

// Require authentication (throws error if not authenticated)
const user = await requireAuth();
```

### Middleware

Middleware được cập nhật để sử dụng NextAuth middleware với custom logic.

## API Routes cũ đã bị xóa

- `/api/auth/login` - Thay thế bằng NextAuth
- `/api/auth/logout` - Thay thế bằng NextAuth
- `/api/auth/me` - Thay thế bằng NextAuth session
- `/api/auth/clear-token` - Không cần thiết với NextAuth

## Backward Compatibility

- Hook `useAuth` vẫn hoạt động như cũ
- AuthGuard component đã được cập nhật
- Không cần thay đổi code trong các components hiện tại

## Testing

1. Khởi chạy ứng dụng: `npm run dev`
2. Truy cập http://localhost:3000
3. Nếu chưa đăng nhập, sẽ redirect tới `/login`
4. Đăng nhập bằng credentials trong database
5. Sau khi đăng nhập thành công, redirect về dashboard
