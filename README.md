# 🏢 HRM System - Hệ thống Quản lý Nhân sự

> **Ứng dụng web toàn diện** cho việc quản trị nhân sự doanh nghiệp, từ tuyển dụng đến chấm công, nghỉ phép và tổ chức bộ máy. Được phát triển bằng **Next.js 15**, **Prisma ORM**, **PostgreSQL** và **NextAuth** với hệ thống phân quyền chi tiết.

## 🎯 Tổng quan dự án

**HRM System** là giải pháp quản lý nhân sự hiện đại, tích hợp đầy đủ các chức năng cần thiết:

- 👥 **Quản lý toàn diện nhân viên** - Hồ sơ, tài liệu, phân công phòng ban & chức vụ
- ⏰ **Hệ thống chấm công thông minh** - Clock-in/out theo thời gian thực, báo cáo tự động
- 📋 **Quy trình nghỉ phép số hóa** - Gửi đơn, phê duyệt đa cấp, theo dõi trạng thái
- 🏗️ **Biểu đồ tổ chức tương tác** - Hiển thị cây phân cấp với `react-d3-tree`
- 🔐 **Phân quyền chi tiết** - 4 cấp độ quyền với hơn 50 permission cụ thể
- 📊 **Dashboard & báo cáo** - Thống kê theo thời gian thực cho từng phòng ban

## ✨ Các module chức năng

### 🏢 **Quản lý Tổ chức**

- **Departments (Phòng ban)**: CRUD phòng ban, xem danh sách nhân viên, thống kê
- **Jobs (Công việc)**: Tạo job description, phân loại công việc, gán lương cơ bản
- **Positions (Chức vụ)**: Quản lý cấp bậc, liên kết với hệ thống phân quyền

### 👥 **Quản lý Nhân viên**

- **Employees**: CRUD hồ sơ nhân viên với tìm kiếm thông minh (họ tên, SĐT, email)
- **Document Management**: Upload/quản lý tài liệu PDF qua Cloudinary
- **Employee Profiles**: Xem chi tiết, chỉnh sửa thông tin, đổi mật khẩu

### ⏰ **Chấm công & Lịch sử**

- **Attendance**: Xem tổng quan chấm công toàn công ty với filter
- **History**: Clock-in/clock-out theo phòng ban, hiển thị trạng thái real-time
- **Báo cáo**: Thống kê giờ làm việc, tình trạng đi muộn/vắng mặt

### 📅 **Nghỉ phép & Lịch**

- **Leaves**: Nhân viên tạo đơn nghỉ phép cá nhân, xem lịch sử
- **Manage Leaves**: Quản lý phê duyệt đơn nghỉ theo phòng ban
- **Holidays**: Thiết lập ngày nghỉ lễ toàn công ty

### 💰 **Bảng lương** (Chuẩn bị)

- **Payroll**: Module tính lương dựa trên chấm công và hệ số

## 🛠️ Công nghệ & Kiến trúc

### **Frontend & UI**

- **Next.js 15** (App Router) - Server Actions, RSC, Middleware route protection
- **TypeScript** - Type safety toàn bộ codebase
- **PrimeReact** - Component library với 40+ components được sử dụng
- **Tailwind CSS** - Utility-first styling với custom design system
- **React Hook Form** - Form validation và state management
- **Lucide Icons** - Modern icon system

### **Backend & Database**

- **Prisma ORM** - Type-safe database client với PostgreSQL
- **PostgreSQL** - Production-ready database với full-text search
- **NextAuth.js** - Authentication với JWT strategy
- **Server Actions** - API-less data mutations với validation

### **Cloud & Storage**

- **Cloudinary** - Document storage (PDF) với transformation API
- **Vercel** (recommended) - Serverless deployment platform

### **DevX & Security**

- **ESLint** - Code linting với Next.js rules
- **Middleware Protection** - Route-based authentication
- **Permission System** - Granular RBAC với 50+ permissions
- **Password Hashing** - bcryptjs với salt rounds

## 📁 Cấu trúc thư mục chính

```text
src/
	app/
		(layout)/          # Các module có layout chính: employees, attendance, leaves...
		(without-layout)/  # Trang không dùng layout chung (login, 404)
		api/               # Route handler (auth, upload)
	components/          # Dashboard, Sidebar, PermissionGuard, FileUpload...
	constants/           # Định nghĩa nhóm permission
	hooks/               # Hook useAuth, usePermission
	lib/                 # Cấu hình NextAuth, helper middleware
db/
	prisma/              # Prisma Client được generate
prisma/
	schema.prisma        # Định nghĩa schema database
	seed.ts              # Script seed dữ liệu mẫu quy mô lớn
scripts/
	create-admin.ts      # Tạo tài khoản admin thủ công
```

## ⚙️ Yêu cầu hệ thống

- Node.js **>= 18.18**
- PostgreSQL 14+ (hoặc dịch vụ tương thích)
- Tài khoản Cloudinary (nếu sử dụng tính năng upload tài liệu)

## 🚀 Khởi chạy nhanh

1. Cài đặt phụ thuộc:

   ```cmd
   npm install
   ```

2. Sao chép file `.env.example` (tự tạo) thành `.env` và điền các biến môi trường bên dưới.
3. Khởi tạo schema và dữ liệu mẫu:

   ```cmd
   npx prisma migrate dev
   npm run seed
   ```

   > Có thể dùng `npm run seed:run` nếu muốn chạy script seed trực tiếp bằng `ts-node`.

4. (Tuỳ chọn) Tạo tài khoản quản trị viên mới:

   ```cmd
   npm run create-admin
   ```

5. Chạy ứng dụng ở chế độ phát triển:

   ```cmd
   npm run dev
   ```

6. Mở [http://localhost:3000](http://localhost:3000) để truy cập.

## 🔐 Biến môi trường

Tạo file `.env` trong thư mục gốc:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/hrm_db"
SHADOW_DATABASE_URL="postgresql://username:password@localhost:5432/hrm_shadow" # Optional

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here"
JWT_SECRET="fallback-jwt-secret" # Fallback nếu không có NEXTAUTH_SECRET

# Cloudinary (cho upload tài liệu)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

| Biến              | Mô tả                          | Bắt buộc                 |
| ----------------- | ------------------------------ | ------------------------ |
| `DATABASE_URL`    | Connection string PostgreSQL   | ✅                       |
| `NEXTAUTH_URL`    | URL gốc ứng dụng               | ✅                       |
| `NEXTAUTH_SECRET` | Secret key cho JWT signing     | ✅                       |
| `CLOUDINARY_*`    | Thông tin tài khoản Cloudinary | ⚠️ (chỉ khi dùng upload) |

## 🗄️ Migration & dữ liệu mẫu

- `npm run seed` hoặc `npm run seed:run` tạo dữ liệu thực tế: phòng ban, vị trí, nhân sự (kèm avatar), lịch sử chấm công, nghỉ phép và ngày nghỉ lễ.
- Sau khi seed, tất cả nhân viên đều có tài khoản đăng nhập với mật khẩu mặc định **`123456`**.
- Có thể chạy lại seed nhiều lần; script đã xử lý trùng lặp dữ liệu.

## 👥 Hệ thống phân quyền & Tài khoản mẫu

### **4 Cấp độ quyền chính:**

| Role                   | Permissions                      | Mô tả                             |
| ---------------------- | -------------------------------- | --------------------------------- |
| **SUPER_ADMIN**        | Toàn bộ 50+ permissions          | CEO/Admin - Full access           |
| **HR_MANAGER**         | Employee, Department, Reports    | Quản lý HR - Tuyển dụng, báo cáo  |
| **DEPARTMENT_MANAGER** | Team management, Leave approval  | Trưởng phòng - Quản lý nhóm       |
| **EMPLOYEE**           | Personal profile, Leave requests | Nhân viên - Xem/sửa hồ sơ cá nhân |

### **Tài khoản demo có sẵn:**

| Email                        | Role               | Department     | Mật khẩu |
| ---------------------------- | ------------------ | -------------- | -------- |
| `ceo@company.com`            | SUPER_ADMIN        | Ban Giám Đốc   | `123456` |
| `cto@company.com`            | SUPER_ADMIN        | Ban Giám Đốc   | `123456` |
| `truongphong.kt@company.com` | DEPARTMENT_MANAGER | Phòng Kỹ Thuật | `123456` |
| `developer1@company.com`     | EMPLOYEE           | Phòng Kỹ Thuật | `123456` |
| `hr.manager@company.com`     | HR_MANAGER         | Phòng Nhân Sự  | `123456` |

> 🔒 **Bảo mật**: Đổi mật khẩu ngay sau lần đăng nhập đầu tiên!

## 🧪 Scripts npm

| Lệnh                   | Mô tả                                              |
| ---------------------- | -------------------------------------------------- |
| `npm run dev`          | Khởi động môi trường phát triển (Turbopack)        |
| `npm run build`        | Generate Prisma Client và build Next.js production |
| `npm run start`        | Chạy server production sau khi build               |
| `npm run lint`         | Kiểm tra linting bằng ESLint                       |
| `npm run seed`         | Seed database qua Prisma CLI                       |
| `npm run seed:run`     | Chạy script seed TypeScript trực tiếp              |
| `npm run create-admin` | Tạo nhanh một tài khoản admin mới                  |

## � Bảo mật & Phân quyền chi tiết

### **Permission System Architecture:**

- **50+ granular permissions** được định nghĩa trong `src/constants/permissions.ts`
- **4 permission groups** (SUPER_ADMIN, HR_MANAGER, DEPARTMENT_MANAGER, EMPLOYEE)
- **Role-based access control** qua `Positions.roleName` mapping

### **Security Layers:**

1. **Route Protection**: Middleware tự động redirect `/login` cho unauthenticated users
2. **Component Guards**: `PermissionGuard`, `withPermission()` HOCs
3. **API Protection**: Server Actions với permission validation
4. **Password Security**: bcryptjs hashing với salt rounds
5. **JWT Security**: Secure token với configurable expiration

### **Permission Examples:**

```typescript
// employees:view, employees:create, employees:update, employees:delete
// departments:view, departments:create, departments:assign_employees
// attendance:view, attendance:view_own, attendance:approve
// leaves:view, leaves:create_own, leaves:approve, leaves:reject
// payroll:view, payroll:view_own, payroll:process
// system:admin, system:manage_users, system:manage_roles
```

## 📊 Database Schema & Luồng dữ liệu

### **Core Models:**

```
Users ←→ Employees ←→ Departments
  ↓         ↓              ↓
Permissions ↓         Jobs (salary)
           ↓
    Attendance ← LeaveRequests
           ↓
  EmployeeDocuments (Cloudinary)
```

### **Luồng hoạt động chính:**

1. **Authentication Flow:**

   ```
   Login → NextAuth JWT → Middleware Check → Dashboard Access
   ```

2. **Employee Management:**

   ```
   Create Employee → Auto-create User Account → Assign Department/Job → Upload Documents
   ```

3. **Attendance Flow:**

   ```
   Clock In/Out → Record to Attendance table → Real-time Status Update → Daily Reports
   ```

4. **Leave Management:**

   ```
   Employee Request → LeaveRequests table → Manager Approval → Status Update → Notification
   ```

5. **Permission System:**
   ```
   User Role → Position.roleName → PERMISSION_GROUPS → Granular Access Control
   ```

## � Triển khai Production

### **Build & Deploy:**

```bash
# 1. Chuẩn bị database production
npx prisma migrate deploy

# 2. Build application
npm run build

# 3. Start production server
npm run start
```

### **Recommended Deployment Platforms:**

- **Vercel** (Recommended) - Zero-config Next.js deployment
- **Railway** - PostgreSQL + Next.js hosting
- **DigitalOcean** - VPS với Docker deployment
- **AWS/GCP** - Enterprise-grade với RDS

### **Production Checklist:**

- ✅ Set secure `NEXTAUTH_SECRET` (32+ characters)
- ✅ Configure PostgreSQL với SSL
- ✅ Setup Cloudinary production account
- ✅ Configure domain cho `NEXTAUTH_URL`
- ✅ Enable database connection pooling
- ✅ Setup monitoring & logging

## 📈 Roadmap & Tính năng mở rộng

### **Phase 2 (Q1 2025):**

- 💰 **Payroll System** - Tính lương tự động theo chấm công
- 📊 **Advanced Analytics** - Dashboard với charts & KPIs
- 📱 **Mobile App** - React Native cho clock-in/out
- 🔔 **Notification System** - Real-time alerts

### **Phase 3 (Q2 2025):**

- 🤖 **AI Integration** - Chatbot HR support
- 📝 **Performance Reviews** - 360-degree feedback system
- 🎯 **Goal Tracking** - OKRs & KPI management
- 📧 **Email Integration** - Automated workflows

## 🤝 Đóng góp & Hỗ trợ

### **Contributions Welcome:**

- 🐛 **Bug Reports** - Tạo Issue với reproduction steps
- ✨ **Feature Requests** - Đề xuất tính năng mới
- 📖 **Documentation** - Cải thiện docs & tutorials
- 🧪 **Testing** - Unit tests & E2E testing
- 🌐 **Translations** - i18n cho multiple languages

### **Development Guidelines:**

- Follow TypeScript strict mode
- Use Conventional Commits format
- Add JSDoc comments cho public APIs
- Test trước khi PR với seed data

---

**📧 Contact:** [manhnguyenit182@gmail.com](mailto:manhnguyenit182@gmail.com)  
**🔗 Repository:** [github.com/manhnguyenit182/hrm](https://github.com/manhnguyenit182/hrm)

> 💡 _Dự án được phát triển với ❤️ bằng Next.js & TypeScript_
