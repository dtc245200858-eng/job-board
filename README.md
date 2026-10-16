# Job Board

Website tuyển dụng được triển khai bằng Docker Compose.

Hệ thống cho phép ứng viên xem việc làm, đăng ký tài khoản, đăng nhập, quên mật khẩu qua email, ứng tuyển bằng CV và theo dõi trạng thái hồ sơ. Quản trị viên có thể quản lý việc làm và hồ sơ ứng viên.

---

## 1. Công nghệ sử dụng

- Node.js
- Express.js
- MySQL 8
- phpMyAdmin
- Nginx Reverse Proxy
- Docker
- Docker Compose
- Prometheus
- Grafana
- Node Exporter
- cAdvisor
- Blackbox Exporter
- Loki
- Promtail
- UFW Firewall

---

## 2. Kiến trúc hệ thống

### 2.1 Website

```text
Client
  |
  | HTTP / HTTPS
  v
Nginx Reverse Proxy
  |
  v
Express Application
  |
  v
MySQL
```

phpMyAdmin được sử dụng để quản trị cơ sở dữ liệu MySQL.

### 2.2 Monitoring

```text
Node Exporter --------\
                       \
cAdvisor ---------------> Prometheus -----> Grafana
                       /
Blackbox Exporter -----/
```

### 2.3 Logging

```text
Docker Containers
       |
       v
    Promtail
       |
       v
      Loki
       |
       v
    Grafana
```

---

## 3. Chức năng chính

### 3.1 Candidate

Ứng viên có thể:

- Đăng ký tài khoản
- Đăng nhập
- Đăng xuất
- Quên mật khẩu qua email
- Đặt lại mật khẩu bằng token
- Xem danh sách việc làm
- Tìm kiếm việc làm
- Xem chi tiết việc làm
- Nộp CV
- Hỗ trợ CV định dạng PDF, DOC và DOCX
- Không cho ứng tuyển trùng một công việc
- Xem danh sách hồ sơ đã ứng tuyển
- Theo dõi trạng thái hồ sơ

### 3.2 Admin

Quản trị viên có thể:

- Đăng nhập quản trị
- Truy cập trang Admin
- Thêm việc làm
- Sửa việc làm
- Quản lý danh sách việc làm
- Xem danh sách ứng viên
- Xem hoặc tải CV
- Cập nhật trạng thái hồ sơ ứng tuyển
- Quản lý hoạt động tuyển dụng

---

## 4. Cấu trúc thư mục

```text
job-board/
├── app/
│   ├── public/
│   │   ├── css/
│   │   ├── js/
│   │   ├── index.html
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── forgot-password.html
│   │   ├── reset-password.html
│   │   ├── job-detail.html
│   │   ├── apply.html
│   │   ├── my-applications.html
│   │   ├── admin.html
│   │   ├── admin-jobs.html
│   │   ├── admin-add-job.html
│   │   ├── admin-edit-job.html
│   │   └── admin-applications.html
│   ├── scripts/
│   ├── src/
│   │   ├── db.js
│   │   ├── mailer.js
│   │   └── server.js
│   ├── uploads/
│   ├── Dockerfile
│   ├── package.json
│   └── package-lock.json
│
├── database/
│   └── init.sql
│
├── nginx/
│   ├── conf.d/
│   │   └── default.conf
│   └── ssl/
│
├── prometheus/
│   ├── prometheus.yml
│   └── blackbox.yml
│
├── grafana/
│   └── provisioning/
│       └── datasources/
│           └── prometheus.yml
│
├── loki/
│   └── loki-config.yml
│
├── promtail/
│   └── promtail-config.yml
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## 5. Cấu hình môi trường

Dự án sử dụng file `.env` để lưu thông tin cấu hình và dữ liệu nhạy cảm.

Tạo file `.env` từ file mẫu:

```bash
cp .env.example .env
```

Sau đó chỉnh sửa:

```bash
nano .env
```

Ví dụ:

```env
MYSQL_ROOT_PASSWORD=change_me
MYSQL_DATABASE=job_board
MYSQL_USER=jobuser
MYSQL_PASSWORD=change_me

SESSION_SECRET=change_me

DB_HOST=mysql
DB_PORT=3306
APP_PORT=3000

ADMIN_NAME=Job Board Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_me

APP_BASE_URL=https://YOUR_SERVER_IP

EMAIL_USER=your_email@gmail.com
EMAIL_APP_PASSWORD=your_google_app_password

RESET_TOKEN_MINUTES=15

GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=change_me
```

Không sử dụng mật khẩu mẫu khi triển khai thực tế.

Không commit file `.env` lên GitHub.

---

## 6. Khởi động hệ thống

### 6.1 Clone repository

```bash
git clone https://github.com/dtc245200858-eng/job-board.git
cd job-board
```

### 6.2 Tạo file môi trường

```bash
cp .env.example .env
nano .env
```

### 6.3 Build và chạy toàn bộ hệ thống

```bash
sudo docker compose up -d --build
```

### 6.4 Kiểm tra container

```bash
sudo docker compose ps
```

### 6.5 Xem log

```bash
sudo docker compose logs
```

Hoặc theo dõi log realtime:

```bash
sudo docker compose logs -f
```

### 6.6 Dừng hệ thống

```bash
sudo docker compose down
```

### 6.7 Khởi động lại

```bash
sudo docker compose up -d
```

---

## 7. Các dịch vụ

| Dịch vụ | Công dụng | Cổng |
|---|---|---:|
| Nginx | Reverse Proxy HTTP | 80 |
| Nginx | HTTPS | 443 |
| Express App | Website Job Board | 3000 nội bộ |
| MySQL | Database | 3306 |
| phpMyAdmin | Quản trị MySQL | 8081 |
| Prometheus | Thu thập metrics | 9090 |
| Grafana | Dashboard monitoring/logging | 3001 |
| Node Exporter | Host metrics | 9100 nội bộ |
| cAdvisor | Container metrics | 8080 nội bộ |
| Blackbox Exporter | Probe HTTP/TCP | 9115 nội bộ |
| Loki | Lưu trữ log | 3100 |
| Promtail | Thu thập Docker log | 9080 nội bộ |

---

## 8. Docker Network

Hệ thống phân tách các service thành nhiều Docker network.

```text
frontend-network
backend-network
monitoring-network
```

### frontend-network

Dùng cho các thành phần giao tiếp phía frontend.

Ví dụ:

```text
Nginx
App
```

### backend-network

Dùng cho các thành phần backend và database.

Ví dụ:

```text
App
MySQL
phpMyAdmin
```

### monitoring-network

Dùng cho hệ thống monitoring và logging.

Ví dụ:

```text
Prometheus
Grafana
Node Exporter
cAdvisor
Blackbox Exporter
Loki
Promtail
```

Việc tách network giúp giảm khả năng các container không liên quan truy cập trực tiếp lẫn nhau.

---

## 9. MySQL và phpMyAdmin

Database chính:

```text
job_board
```

Các bảng chính:

```text
users
companies
categories
jobs
applications
password_reset_tokens
```

MySQL sử dụng Docker volume để lưu dữ liệu lâu dài.

MySQL hiện bind ra host bằng địa chỉ loopback:

```text
127.0.0.1:3306
```

nên không mở trực tiếp cổng MySQL ra toàn bộ mạng LAN.

phpMyAdmin:

```text
http://SERVER_IP:8081
```

---

## 10. Nginx Reverse Proxy

Nginx là gateway chính của hệ thống.

Luồng request:

```text
Client
  |
  v
Nginx
  |
  v
Express App
```

HTTP sử dụng cổng:

```text
80
```

HTTPS sử dụng cổng:

```text
443
```

HTTP được chuyển hướng sang HTTPS.

---

## 11. HTTPS

Môi trường thực hành sử dụng chứng chỉ SSL self-signed.

Truy cập:

```text
https://SERVER_IP
```

Do sử dụng self-signed certificate nên trình duyệt có thể hiển thị cảnh báo chứng chỉ.

SSL private key không được commit lên GitHub.

---

## 12. Security Headers

Nginx được cấu hình các Security Header:

```text
X-Frame-Options
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
```

Kiểm tra bằng:

```bash
curl -k -I https://localhost
```

Hoặc:

```bash
curl -k -I https://localhost | \
grep -Ei 'X-Frame-Options|X-Content-Type-Options|Referrer-Policy|Permissions-Policy'
```

Ví dụ kết quả:

```text
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## 13. Prometheus Monitoring

Prometheus thu thập metrics của hệ thống.

Truy cập:

```text
http://SERVER_IP:9090
```

Trang kiểm tra Targets:

```text
http://SERVER_IP:9090/targets
```

Các target chính:

```text
prometheus
node-exporter
cadvisor
blackbox-web
blackbox-mysql
```

Trạng thái mong muốn:

```text
UP
```

---

## 14. Node Exporter

Node Exporter theo dõi tài nguyên Ubuntu host:

- CPU
- RAM
- Disk
- Network
- Load
- Filesystem
- Uptime

Prometheus scrape:

```text
node-exporter:9100
```

---

## 15. cAdvisor

cAdvisor cung cấp metrics của Docker container.

Theo dõi:

- CPU container
- RAM container
- Network
- Filesystem
- Container runtime metrics

Một số PromQL:

```promql
container_memory_working_set_bytes
```

```promql
rate(container_cpu_usage_seconds_total[5m])
```

```promql
rate(container_network_receive_bytes_total[5m])
```

---

## 16. Blackbox Exporter

Blackbox Exporter kiểm tra availability của các service.

### Kiểm tra Website HTTPS

```promql
probe_success{job="blackbox-web"}
```

Kết quả:

```text
1
```

nghĩa là website hoạt động.

### Kiểm tra MySQL

```promql
probe_success{job="blackbox-mysql"}
```

Kết quả:

```text
1
```

nghĩa là MySQL TCP hoạt động.

---

## 17. Một số PromQL đã sử dụng

Kiểm tra toàn bộ target:

```promql
up
```

Kiểm tra website:

```promql
probe_success{job="blackbox-web"}
```

Kiểm tra MySQL:

```promql
probe_success{job="blackbox-mysql"}
```

Theo dõi RAM container:

```promql
container_memory_working_set_bytes
```

Theo dõi CPU container:

```promql
rate(container_cpu_usage_seconds_total[5m])
```

---

## 18. Grafana

Grafana được sử dụng để trực quan hóa dữ liệu từ Prometheus và Loki.

Truy cập:

```text
http://SERVER_IP:3001
```

Datasource Prometheus:

```text
http://prometheus:9090
```

Datasource Loki:

```text
http://loki:3100
```

---

## 19. Node Exporter Full Dashboard

Dashboard được sử dụng:

```text
Node Exporter Full
```

Grafana Dashboard ID:

```text
1860
```

Dashboard hiển thị:

- CPU
- RAM
- Disk
- Network
- Load
- Filesystem
- SWAP
- Uptime

---

## 20. Loki

Loki được sử dụng để lưu trữ và truy vấn log.

Kiểm tra Loki:

```bash
curl http://localhost:3100/ready
```

Kết quả mong muốn:

```text
ready
```

---

## 21. Promtail

Promtail thực hiện Docker service discovery và thu thập log container.

Promtail gửi log tới:

```text
http://loki:3100/loki/api/v1/push
```

Promtail được cấu hình chỉ thu thập container thuộc Docker Compose project Job Board để tránh lấy log cũ từ các project khác.

---

## 22. LogQL

Grafana Explore sử dụng Loki datasource để chạy LogQL.

### Log Nginx

```logql
{service="nginx"}
```

### Log Express App

```logql
{service="app"}
```

### Log MySQL

```logql
{service="mysql"}
```

### Chỉ lấy request GET của Nginx

```logql
{service="nginx"} |= "GET"
```

### Lọc lỗi ứng dụng

```logql
{service="app"} |= "error"
```

### Lọc lỗi kết nối MySQL

```logql
{service="app"} |= "ECONNREFUSED"
```

---

## 23. Hardening

Hệ thống áp dụng các biện pháp hardening cơ bản.

### 23.1 Non-root Container

Express App chạy bằng user `node`.

Kiểm tra:

```bash
sudo docker exec jobboard_app id
```

Kết quả:

```text
uid=1000(node) gid=1000(node) groups=1000(node)
```

Điều này giúp giảm rủi ro khi ứng dụng bị khai thác.

### 23.2 Network Isolation

Các service được phân chia vào:

```text
frontend-network
backend-network
monitoring-network
```

MySQL chủ yếu nằm trong backend network.

Monitoring service nằm trong monitoring network.

### 23.3 Environment Variables

Password và secret được đặt trong:

```text
.env
```

File `.env` được khai báo trong `.gitignore`.

### 23.4 SSL Private Key

SSL private key không được commit lên repository.

Kiểm tra:

```bash
git check-ignore nginx/ssl/jobboard.key
```

### 23.5 Security Headers

Nginx thiết lập:

```text
X-Frame-Options
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
```

### 23.6 UFW Firewall

UFW được bật với:

```text
Default incoming: deny
Default outgoing: allow
```

HTTP và HTTPS được cho phép:

```text
80/tcp
443/tcp
```

Các cổng quản trị chỉ cho phép từ mạng VMware:

```text
192.168.146.0/24
```

Bao gồm:

```text
22/tcp
3001/tcp
8081/tcp
9090/tcp
```

Kiểm tra:

```bash
sudo ufw status numbered
```

---

## 24. Kiểm tra bảo mật Git

Kiểm tra `.env`:

```bash
git check-ignore .env
```

Kiểm tra SSL key:

```bash
git check-ignore nginx/ssl/jobboard.key
```

Không được commit:

```text
.env
*.key
*.crt
node_modules/
uploads/*
```

---

## 25. Kiểm tra toàn bộ container

```bash
sudo docker compose ps
```

Các service chính:

```text
app
mysql
phpmyadmin
nginx
prometheus
grafana
node-exporter
cadvisor
blackbox-exporter
loki
promtail
```

---

## 26. Kiểm tra Website

HTTP:

```text
http://SERVER_IP
```

HTTPS:

```text
https://SERVER_IP
```

HTTP được chuyển hướng sang HTTPS.

---

## 27. Kiểm tra Prometheus

```text
http://SERVER_IP:9090
```

Query:

```promql
up
```

Các target hoạt động phải có giá trị:

```text
1
```

---

## 28. Kiểm tra Grafana

```text
http://SERVER_IP:3001
```

Kiểm tra:

- Prometheus datasource
- Loki datasource
- Node Exporter Full Dashboard
- Explore Prometheus
- Explore Loki

---

## 29. Kiểm tra phpMyAdmin

```text
http://SERVER_IP:8081
```

Đăng nhập bằng tài khoản MySQL được khai báo trong `.env`.

---

## 30. Git Workflow

Dự án được chia thành 3 commit triển khai chính.

### Commit 1

Nội dung:

```text
Docker hóa Job Board
Express
MySQL
phpMyAdmin
Nginx Reverse Proxy
HTTPS
Security Headers
```

Commit:

```text
feat: dockerize job board with nginx https and security headers
```

### Commit 2

Nội dung:

```text
Prometheus
Grafana
Node Exporter
cAdvisor
Blackbox Exporter
```

Commit:

```text
feat: add prometheus and grafana monitoring
```

### Commit 3

Nội dung:

```text
Loki
Promtail
LogQL
Non-root App
UFW Firewall
Hardening
README
```

Commit đề xuất:

```text
feat: add centralized logging and security hardening
```

---

## 31. Lệnh kiểm tra nhanh

Kiểm tra Docker:

```bash
sudo docker compose ps
```

Kiểm tra MySQL:

```bash
sudo docker compose ps mysql
```

Kiểm tra Nginx:

```bash
curl -k -I https://localhost
```

Kiểm tra Prometheus:

```bash
curl http://localhost:9090/-/healthy
```

Kiểm tra Loki:

```bash
curl http://localhost:3100/ready
```

Kiểm tra App non-root:

```bash
sudo docker exec jobboard_app id
```

Kiểm tra Firewall:

```bash
sudo ufw status numbered
```

---

## 32. Khởi động lại sau khi bật Ubuntu

Sau khi mở lại Ubuntu VM:

```bash
cd ~/job-board
```

Kiểm tra:

```bash
sudo docker compose ps
```

Nếu container chưa chạy:

```bash
sudo docker compose up -d
```

Sau đó truy cập:

```text
https://SERVER_IP
```

---

## 33. Lưu ý bảo mật

Không chia sẻ hoặc commit công khai:

- MySQL Root Password
- MySQL User Password
- Gmail App Password
- Session Secret
- GitHub Personal Access Token
- Grafana Admin Password
- SSL Private Key

Không đưa các giá trị thật vào README.

Luôn sử dụng `.env.example` để mô tả tên biến môi trường và sử dụng `.env` để lưu giá trị thật.

---

## 34. Tác giả

Đề tài:

```text
Website Tuyển dụng / Job Board
```

Mục tiêu:

```text
Triển khai website bằng Docker Compose,
Nginx Reverse Proxy,
HTTPS,
Prometheus + Grafana,
Loki + Promtail,
LogQL
và Hardening hệ thống.
```
