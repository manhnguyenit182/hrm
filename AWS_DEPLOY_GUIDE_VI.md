# Hướng Dẫn Từng Bước Triển Khai Next.js lên AWS (Dành Cho Người Mới)

Tài liệu này hướng dẫn bạn cách thiết lập hệ thống chuẩn Enterprise trên AWS cho ứng dụng Next.js (Dự án HRM). Hệ thống này tách biệt **Backend** (xử lý logic) và **Frontend** (xử lý file tĩnh, hình ảnh) để tối ưu tốc độ và chi phí.

---

## MỤC LỤC
1. [Phần 1: Thiết lập Tên Miền (Route 53)](#phần-1-thiết-lập-tên-miền-route-53)
2. [Phần 2: Xin Chứng Chỉ SSL Miễn Phí (ACM)](#phần-2-xin-chứng-chỉ-ssl-miễn-phí-acm)
3. [Phần 3: Lưu Trữ Frontend - Tốc Độ Ánh Sáng (S3 & CloudFront)](#phần-3-lưu-trữ-frontend---tốc-độ-ánh-sáng-s3--cloudfront)
4. [Phần 4: Bảo Mật Giao Tiếp GitHub & AWS (IAM OIDC)](#phần-4-bảo-mật-giao-tiếp-github--aws-iam-oidc)
5. [Phần 5: Chạy Backend App (ECR, ALB & ECS Fargate)](#phần-5-chạy-backend-app-ecr-alb--ecs-fargate)
6. [Phần 6: Cấu Hình Tự Động Hóa (GitHub Actions)](#phần-6-cấu-hình-tự-động-hóa-github-actions)

---

## Phần 1: Thiết lập Tên Miền (Route 53)
Bạn đã mua tên miền `ndinmah.xyz`, giờ chúng ta cần mang nó vào AWS để quản lý.

1. Đăng nhập vào AWS Console. Trên thanh tìm kiếm (trên cùng), gõ **Route 53** và nhấn Enter.
2. Ở menu bên trái, chọn **Hosted zones**.
3. Nhấn nút cam **Create hosted zone**.
   - **Domain name:** Gõ `ndinmah.xyz`.
   - **Type:** Để mặc định là `Public hosted zone`.
   - Nhấn **Create hosted zone** ở dưới cùng.
4. Sau khi tạo xong, bạn sẽ thấy danh sách các bản ghi (Records). Hãy chú ý đến bản ghi loại **NS (Name server)**. Nó có 4 dòng, ví dụ: `ns-123.awsdns-xx.com`, `ns-456...`.
5. Mở tab mới, đăng nhập vào nơi bạn đã mua tên miền (ví dụ: Namecheap, GoDaddy, Hostinger...).
   - Tìm mục **Quản lý DNS (DNS Management)** hoặc **Nameservers**.
   - Chọn chế độ **Custom DNS**.
   - Copy 4 dòng NS từ AWS và dán vào đó. Lưu lại. (Việc này có thể mất từ vài phút đến vài giờ để Internet cập nhật).

---

## Phần 2: Xin Chứng Chỉ SSL Miễn Phí (ACM)
Chứng chỉ SSL giúp web của bạn có ổ khóa bảo mật (HTTPS).

### 2.1 Tạo SSL cho CloudFront (BẮT BUỘC ở vùng N. Virginia)
1. Ở góc phải trên cùng của AWS Console, nhấp vào tên khu vực hiện tại (ví dụ: Singapore) và đổi sang **US East (N. Virginia) us-east-1**. *Đây là bắt buộc vì CloudFront chỉ dùng SSL ở khu vực này.*
2. Tìm kiếm dịch vụ **Certificate Manager (ACM)**.
3. Chọn **Request a certificate** -> **Request a public certificate** -> Nhấn Next.
4. **Fully qualified domain name:** 
   - Nhập `ndinmah.xyz`.
   - Nhấn **Add another name to this certificate**, nhập `*.ndinmah.xyz`.
5. **Validation method:** Chọn `DNS validation`. Nhấn **Request**.
6. Refresh lại trang, bấm vào ID của chứng chỉ vừa tạo (Đang ở trạng thái *Pending validation*).
7. Ở phần Domains, nhấn nút **Create records in Route 53** -> Chọn **Create records**. 
8. Chờ vài phút, trạng thái sẽ chuyển thành nút xanh **Issued**.

### 2.2 Tạo SSL cho Backend (Khu vực của bạn)
1. Chuyển lại khu vực AWS về nơi bạn muốn máy chủ chạy (Ví dụ: **ap-southeast-1 - Singapore**).
2. Lặp lại y hệt các bước từ 2 đến 8 như trên để có thêm một chứng chỉ SSL ở khu vực Singapore.

---

## Phần 3: Lưu Trữ Frontend - Tốc Độ Ánh Sáng (S3 & CloudFront)
Chúng ta sẽ dùng S3 làm ổ cứng chứa hình ảnh/CSS/JS, và CloudFront để phân phối nhanh toàn cầu.

### 3.1 S3 Bucket (Ổ cứng)
1. Tìm dịch vụ **S3**. Chọn **Create bucket**.
2. **Bucket name:** Gõ `hrm-static-assets-ndinmah`.
3. **AWS Region:** Chọn Singapore (`ap-southeast-1`).
4. Kéo xuống phần **Block Public Access settings for this bucket**:
   - **BỎ TÍCH** ô "Block all public access" (Để web ai cũng truy cập được hình ảnh).
   - Tích vào dòng cảnh báo "I acknowledge that...".
5. Nhấn **Create bucket**.
6. Bấm vào Bucket vừa tạo -> Qua tab **Permissions**. Kéo xuống phần **Bucket policy**, nhấn **Edit**.
7. Copy đoạn code sau dán vào và nhấn **Save changes**:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::hrm-static-assets-ndinmah/*"
        }
    ]
}
```

### 3.2 CloudFront (Mạng phân phối CDN)
1. Tìm dịch vụ **CloudFront**. Chọn **Create a CloudFront distribution**.
2. **Origin domain:** Bấm vào ô này và chọn Bucket S3 vừa tạo (`hrm-static-assets-ndinmah...`).
3. Kéo xuống phần **Default cache behavior**:
   - **Viewer protocol policy:** Chọn `Redirect HTTP to HTTPS`.
4. Kéo xuống phần **Settings**:
   - **Alternate domain name (CNAME):** Nhấn Add item, gõ `cdn.ndinmah.xyz`.
   - **Custom SSL certificate:** Chọn chứng chỉ bạn đã tạo ở khu vực N. Virginia.
5. Nhấn **Create distribution**.
6. Lưu lại mã **Distribution ID** (ví dụ `E1XXXXXXXXXX`) để lát nữa đưa vào file cấu hình GitHub.
7. Vào lại **Route 53** -> **Hosted zones** -> Chọn `ndinmah.xyz`.
   - Nhấn **Create record**.
   - Record name: gõ `cdn`.
   - Bật công tắc **Alias** (thành màu cam).
   - Route traffic to: Chọn `Alias to CloudFront distribution`.
   - Ô bên dưới: Chọn Distribution bạn vừa tạo.
   - Nhấn **Create records**.

---

## Phần 4: Bảo Mật Giao Tiếp GitHub & AWS (IAM OIDC)
Bước này để GitHub có thể tự động tải code lên AWS mà không bị lộ mật khẩu.

1. Tìm dịch vụ **IAM**. Chọn menu **Identity providers** ở bên trái.
2. Nhấn **Add provider**.
3. Chọn **OpenID Connect**.
   - **Provider URL:** `https://token.actions.githubusercontent.com` (Gõ xong nhấn nút Get thumbprint).
   - **Audience:** `sts.amazonaws.com`
   - Nhấn **Add provider**.
4. Chuyển sang menu **Roles** ở bên trái. Nhấn **Create role**.
5. Chọn **Web identity**.
   - **Identity provider:** Chọn `token.actions.githubusercontent...`.
   - **Audience:** `sts.amazonaws.com`.
   - **GitHub organization:** Tên tài khoản GitHub của bạn (vd: `manhnguyenit182`).
   - **GitHub repository:** Tên kho lưu trữ (vd: `hrm`).
   - **GitHub branch:** `main`.
   - Nhấn Next.
6. Ở ô tìm kiếm quyền, hãy tìm và TÍCH VÀO các quyền sau (4 cái):
   - `AmazonS3FullAccess`
   - `AmazonEC2ContainerRegistryFullAccess`
   - `AmazonECS_FullAccess`
   - `CloudFrontFullAccess`
   *(Nhấn Next)*
7. **Role name:** Đặt là `GitHubActionsRole`. Kéo xuống cuối nhấn **Create role**.
8. Bấm vào Role `GitHubActionsRole` vừa tạo, copy đoạn **ARN** (nó trông giống vầy: `arn:aws:iam::123456789012:role/GitHubActionsRole`).

---

## Phần 5: Chạy Backend App (ECR, ALB & ECS Fargate)

### 5.1 Kho chứa Docker (ECR)
1. Tìm dịch vụ **Elastic Container Registry (ECR)**.
2. Nhấn **Create repository**.
3. Chọn **Private**. Tên kho: `hrm-app`.
4. Nhấn **Create repository**.

### 5.2 Application Load Balancer (ALB)
ALB làm nhiệm vụ đón khách từ cổng chính (HTTPS) và dẫn vào Backend.
1. Tìm dịch vụ **EC2**. Nhìn menu bên trái kéo tuốt xuống dưới chọn **Load Balancers**.
2. Nhấn **Create load balancer** -> Ở phần Application Load Balancer nhấn **Create**.
3. **Load balancer name:** `hrm-alb`.
4. **Scheme:** Internet-facing.
5. **Network mapping:** Chọn VPC mặc định. Tích chọn TẤT CẢ các vùng (Subnets) có trong danh sách (thường là 3 cái).
6. **Security groups:** 
   - Nhấn link *Create new security group* ở tab mới. 
   - Tên: `hrm-alb-sg`. 
   - Inbound rules: Thêm 2 rule (HTTP cổng 80 - Anywhere IPv4) và (HTTPS cổng 443 - Anywhere IPv4). 
   - Quay lại tab tạo ALB, bấm refresh và chọn `hrm-alb-sg`.
7. **Listeners and routing:**
   - Cổng 80: Nhấn Create target group -> Choose a target type: **IP addresses** -> Tên: `hrm-tg` -> Next -> Create target group. Quay lại tab ALB, refresh và chọn `hrm-tg`.
   - Nhấn Add listener: Cổng 443 (HTTPS) -> Forward to `hrm-tg`.
   - Kéo xuống phần Secure listener settings: Chọn chứng chỉ ACM (ở khu vực Singapore) bạn đã tạo.
8. Nhấn **Create load balancer**.

### 5.3 Cấu hình chạy Backend (ECS)
1. Tìm dịch vụ **Elastic Container Service (ECS)**.
2. Tạo Cụm máy chủ: Chọn **Clusters** -> **Create cluster** -> Tên: `hrm-cluster` -> Infrastructure: AWS Fargate -> Create.
3. Tạo Định nghĩa công việc: Chọn **Task definitions** (menu trái) -> **Create new task definition**.
   - Tên: `hrm-task`. Launch type: AWS Fargate.
   - Task size: 1 vCPU, 2 GB RAM.
   - Container - Name: `hrm-container`. 
   - Image URI: Điền URI của ECR bạn vừa tạo (Bấm qua tab ECR để copy, vd: `123456.dkr.ecr.ap-southeast-1.amazonaws.com/hrm-app:latest`).
   - Port mappings: Container port: `3000`, Protocol: `TCP`.
   - Môi trường (Kéo xuống dưới): Thêm Environment variable -> Tên: `DATABASE_URL` -> Value: Chuỗi kết nối Database Neon/Supabase của bạn.
   - Nhấn **Create**.
4. Mở lại Cluster `hrm-cluster` vừa tạo. Kéo xuống tab **Services** -> Nhấn **Create**.
   - Compute configuration: Launch type (Fargate).
   - Deployment configuration: Family chọn `hrm-task`. Tên service: `hrm-service`. Desired tasks: 1.
   - Networking: Chọn VPC mặc định. Security group -> Create new -> Tên `hrm-ecs-sg` -> Mở cổng 3000 cho Anywhere. Bật ô `Auto-assign public IP`.
   - Load balancing: Chọn Application Load Balancer -> Use an existing -> Chọn `hrm-alb`.
   - Listener: Use an existing listener (Cổng 443 HTTPS).
   - Target group: Use an existing (Chọn `hrm-tg`).
   - Nhấn **Create**.

### 5.4 Gắn Domain Backend
1. Trở lại **Route 53** -> **Hosted zones** -> Chọn `ndinmah.xyz`.
2. Nhấn **Create record**.
   - Record name: Để trống (nếu muốn vào `ndinmah.xyz`) hoặc gõ `www`.
   - Bật **Alias** (màu cam).
   - Route traffic to: `Alias to Application and Classic Load Balancer`.
   - Chọn Region của bạn (Singapore).
   - Chọn `hrm-alb`.
   - Nhấn **Create records**.

---

## Phần 6: Cấu Hình Tự Động Hóa (GitHub Actions)

1. Mở code trên máy của bạn, vào file `.github/workflows/deploy-aws.yml`.
2. Sửa lại các thông số ở phần `env:` (dòng 10-18):
   - `AWS_REGION`: Khu vực bạn dùng (vd: `ap-southeast-1`).
   - `CLOUDFRONT_DIST_ID`: ID của CloudFront đã lưu ở phần 3.
3. Thay thế dòng `role-to-assume:` (dòng 30) bằng cái Role ARN bạn đã copy ở cuối Phần 4.
4. Lưu tất cả file lại.
5. Truy cập kho code GitHub của bạn trên trình duyệt -> **Settings** -> **Secrets and variables** -> **Actions** -> Nút **New repository secret**.
   - Name: `DATABASE_URL`
   - Secret: Nhập link kết nối CSDL của bạn (PostgreSQL url).
6. Ở máy tính, mở terminal chạy lệnh:
   ```bash
   git add .
   git commit -m "Deploy to AWS"
   git push origin main
   ```
7. Vào tab **Actions** trên GitHub để xem hệ thống tự động làm mọi thứ từ A đến Z!

*Chúc bạn thành công! Nếu gặp bất kỳ chữ đỏ báo lỗi nào ở bước nào, hãy chụp hoặc copy cho tôi, tôi sẽ hướng dẫn bạn fix ngay lập tức.*
