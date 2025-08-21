# Database Seeding Instructions

## Để chạy seed data:

### Cách 1: Sử dụng Prisma seed command (Khuyên dùng)

```bash
npm run seed
```

### Cách 2: Chạy trực tiếp file seed

```bash
npm run seed:run
```

## Dữ liệu được seed:

### Departments (Phòng ban):

- Phòng Hỗ trợ khách hàng
- Phòng Kinh doanh
- Phòng Kế Toán
- Phòng Marketing
- Phòng Nhân sự
- Ban Giám đốc
- Phòng Phát triển sản phẩm
- Phòng Product & Design
- Phòng QA & DevOps
- Phòng R&D (AI/Data)

### Positions (Chức vụ):

- Trưởng Phòng
- Phó Trưởng Phòng
- Chuyên Viên
- Nhân Viên
- Thực Tập Sinh

### Employees (Nhân viên):

10 nhân viên mẫu với đầy đủ thông tin:

- Thông tin cá nhân (họ tên, ngày sinh, giới tính, v.v.)
- Thông tin liên hệ (email, điện thoại, địa chỉ)
- ảnh là https://i.pravatar.cc/150?img=3 ((đổi số 3 → từ 1 đến 70))
- Thông tin công việc (phòng ban, chức vụ, loại hợp đồng)

## Lưu ý:

- Script sẽ tự động bỏ qua các bản ghi đã tồn tại
- Database phải được tạo và migration phải được chạy trước khi seed
- Nếu có lỗi, hãy kiểm tra kết nối database và đảm bảo schema đã được update
