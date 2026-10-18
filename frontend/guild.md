

## MỤC LỤC
1. [Frontend là gì và Dự án này làm cái gì?](#1-frontend-la-gi-va-du-an-nay-lam-cai-gi)
2. [Sơ đồ luồng di chuyển trên website (Sitemap & Luồng người dùng)](#2-so-do-luong-di-chuyen-tren-website)
3. [Frontend gọi API như thế nào? (Cơ chế giao tiếp với Backend)](#3-frontend-goi-api-nhu-the-nao)
4. [Phân quyền hoạt động ra sao? (Ai được xem và làm gì?)](#4-phan-quyen-hoat-dong-ra-sao)
5. [Thông tin người dùng được lưu trữ ở đâu? (Bảo mật & Quản lý phiên)](#5-thong-tin-nguoi-dung-duoc-luu-tru-o-dau)
6. [Giải thích chi tiết từng màn hình & Tính năng](#6-giai-thich-chi-tiet-tung-man-hinh--tinh-nang)
7. [Tất tần tật các trường hợp Validate (Kiểm tra dữ liệu)](#7-tat-tan-tat-cac-truong-hop-validate)
8. [Cơ chế An toàn đặc biệt: Đếm ngược 5 giây khi xóa/khóa](#8-co-che-an-toan-dac-biet-dem-nguoc-5-giay)
9. [Hệ thống tự động thông báo (Toast)](#9-he-thong-tu-dong-thong-bao-toast)
10. [Bộ câu hỏi thường gặp khi bảo vệ đồ án / thuyết trình](#10-bo-cau-hoi-thuong-gap-khi-thuyet-trinh)

---

## 1. FRONTEND LÀ GÌ VÀ DỰ ÁN NÀY LÀM CÁI GÌ?

### 1.1. Khái niệm dễ hiểu
- **Frontend (Giao diện người dùng)**: Là tất cả những gì bạn nhìn thấy trên màn hình (nút bấm, form nhập họ tên, bảng danh sách thành viên, màu sắc xanh đen hiện đại, thông báo thành công hay thất bại).
- **Backend (Máy chủ)**: Là hệ thống xử lý ngầm, lưu cơ sở dữ liệu (Database).
- **Frontend trao đổi với Backend thế nào?**: Giống như khách vào nhà hàng: Frontend là **người phục vụ bàn** đưa thực đơn và ghi nhận yêu cầu từ khách hàng, sau đó chuyển yêu cầu vào **nhà bếp (Backend)**. Khi nhà bếp nấu xong, người phục vụ bê món ăn ra cho khách (hiển thị dữ liệu lên màn hình).

### 1.2. Dự án SportCenter này là gì?
Đây là hệ thống quản lý trung tâm thể thao đa năng (Gym, Yoga, Cầu lông, Pickleball, Bơi lội,...). Hệ thống phục vụ 2 nhóm đối tượng:
1. **Khách hàng vãng lai / Khách xem web**: Xem giới thiệu tiện ích, bảng giá, đăng ký dùng thử miễn phí, đăng ký tài khoản hội viên.
2. **Nội bộ trung tâm & Hội viên (Trang Dashboard quản trị)**: Quản lý hội viên, huấn luyện viên, gói tập, đăng ký lớp học, điểm danh vào/ra tại quầy, quản lý thanh toán hóa đơn.

---

## 2. SƠ ĐỒ LUỒNG DI CHUYỂN TRÊN WEBSITE

```
                                  [ KHÁCH TRUY CẬP ]
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
         [ Trang Chủ (Landing) ]                           [ Đăng ký Demo ]
                  │                                         (Modal popup)
      ┌───────────┴───────────┐
      ▼                       ▼
 [ Đăng nhập ]          [ Đăng ký ]
 (/login)               (/register)
      │                       │
      └───────────┬───────────┘
                  ▼
          [ TRANG NỘI BỘ ] (/app)
                  │
  ┌───────────────┼───────────────┬───────────────┬───────────────┐
  ▼               ▼               ▼               ▼               ▼
Tổng quan     Thành viên       Gói tập        Đăng ký gói      Thanh toán
(Overview)     (Users)       (Packages)    (Subscriptions)     (Payments)
  │
  ├─────────────── Lớp học & Lịch tập (Classes)
  ├─────────────── Điểm danh tại quầy (Attendance)
  └─────────────── Hồ sơ cá nhân (Profile)
```

---

## 3. FRONTEND GỌI API NHƯ THẾ NÀO? (CƠ CHẾ GIAO TIẾP VỚI BACKEND)

> **API là gì?**  
> Hãy tưởng tượng API giống như **"đường dây nóng thoại"** hoặc **"người đưa thư"** giữa giao diện website và máy chủ Backend. Mỗi khi bạn bấm nút "Đăng nhập", "Tạo gói tập" hay "Điểm danh", Frontend sẽ gửi một bức thư (yêu cầu HTTP) đến Backend để xin hoặc gửi dữ liệu.

Tất cả các lệnh gọi API của dự án đều được quản lý tập trung tại file: `src/services/api.js`.

### 3.1. Địa chỉ máy chủ (Endpoint)
- Mặc định hệ thống kết nối tới Backend tại địa chỉ: `http://localhost:8080/api`.
- Địa chỉ này có thể linh hoạt thay đổi qua biến môi trường file `.env` (`VITE_API_BASE_URL`).

### 3.2. Quy trình 4 bước gửi nhận 1 yêu cầu API:
```
[ Người dùng bấm nút ]
        │
        ▼ (1. Frontend gói dữ liệu dạng JSON)
[ Tự động đính kèm "Thẻ căn cước số" (Token JWT) vào Header ]
        │
        ▼ (2. Gửi qua đường truyền mạng tới Backend)
[ Máy chủ Spring Boot (Backend 8080) kiểm tra & xử lý ]
        │
        ▼ (3. Trả kết quả: Thành công hoặc Báo lỗi)
[ Frontend nhận kết quả ]
        │
        ├─ Thành công: Cập nhật dữ liệu lên bảng + Báo thông báo xanh (Toast Success)
        └─ Thất bại: Giữ nguyên màn hình + Báo thông báo đỏ (Toast Error)
```

### 3.3. Tự động gắn "Thẻ căn cước" (JWT Token):
- Sau khi bạn đăng nhập, Backend cấp cho bạn 1 chuỗi mã gọi là **JWT Token** (như tấm thẻ ra vào cổng).
- Mỗi lần Frontend gửi yêu cầu (ví dụ: xin xem danh sách hội viên, tạo lớp học), hàm `getHeaders()` trong `api.js` sẽ **tự động đính kèm tấm thẻ này** (`Authorization: Bearer <token>`).
- Nhờ vậy, Backend biết ngay bạn là ai và bạn có quyền làm việc đó hay không mà không cần hỏi lại mật khẩu.

### 3.4. Xử lý khi mất mạng hoặc sập Backend:
- Nếu Backend chưa bật hoặc đường truyền bị đứt, hàm `request()` tự động bắt lỗi và hiện thông báo rõ ràng bằng tiếng Việt:  
  *"Không thể kết nối đến máy chủ Backend (http://localhost:8080/api). Vui lòng kiểm tra dịch vụ Backend và Database."*  
  $\rightarrow$ Giúp người dùng hoặc tester biết ngay là do chưa bật máy chủ chứ không phải lỗi giao diện bị đơ.

---

## 4. PHÂN QUYỀN HOẠT ĐỘNG RA SAO? (AI ĐƯỢC XEM VÀ LÀM GÌ?)

Dự án có hệ thống phân quyền 4 cấp bậc rõ rệt: **MANAGER (Quản lý)**, **RECEPTIONIST (Lễ tân)**, **COACH (HLV)** và **MEMBER (Hội viên)**.

Cơ chế phân quyền này hoạt động theo mô hình **"2 tầng bảo vệ"**:

### Tầng 1: Phân quyền trực quan trên giao diện (Menu Sidebar & Nút bấm)
Thanh thực đơn bên trái (`Sidebar.jsx`) và các trang sẽ tự động ẩn/hiện dựa trên quyền hạn của tài khoản đang đăng nhập:

| Chức năng trên Menu | MANAGER | RECEPTIONIST | COACH | MEMBER | Giải thích giao diện hiển thị |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Tổng quan (Overview)** | ✅ Hiện | ✅ Hiện | ❌ Ẩn | ❌ Ẩn | Chỉ nhân sự vận hành mới cần theo dõi báo cáo doanh thu, số liệu tổng thể |
| **Quản lý Tài khoản / Hội viên** | ✅ Toàn bộ tài khoản | ✅ Chỉ xem Hội viên | ❌ Ẩn | ❌ Ẩn | Manager quản lý nhân viên + khách. Lễ tân chỉ quản lý khách hàng tại quầy |
| **Gói tập thể thao (Packages)** | ✅ Tạo / Sửa / Xóa | ❌ Ẩn | ❌ Ẩn | ✅ Chỉ xem & mua | Manager thiết lập giá bán. Member xem bảng giá để chọn mua |
| **Hợp đồng & Gia hạn (Subscriptions)**| ❌ Ẩn | ✅ Quản lý hợp đồng | ❌ Ẩn | ✅ Gói của tôi | Lễ tân lập hợp đồng cho khách. Hội viên theo dõi hạn gói của mình |
| **Lớp học & Lịch dạy (Classes)** | ✅ Toàn quyền quản lý | ✅ Đăng ký hộ khách | ✅ Lịch dạy cá nhân | ✅ Đăng ký học | Mỗi người thấy góc nhìn phù hợp với công việc của mình |
| **Điểm danh ra vào (Attendance)** | ❌ Ẩn | ✅ Trạm Check-in | ❌ Ẩn | ❌ Ẩn | Chỉ Lễ tân đứng quầy mới dùng chức năng bấm thẻ Check-in / Check-out |
| **Thu phí & Hóa đơn (Payments)** | ✅ Toàn bộ hóa đơn | ✅ Thu tiền tại quầy | ❌ Ẩn | ✅ Lịch sử nộp tiền | Quản lý kiểm soát dòng tiền, hội viên tra cứu hóa đơn đã trả |
| **Hồ sơ cá nhân (Profile)** | ✅ | ✅ | ✅ | ✅ | Tất cả mọi người đều có trang xem và sửa thông tin cá nhân |

### Tầng 2: Phân quyền hành vi trên từng nút bấm
- **Khóa vai trò khi tạo tài khoản**: Khi Lễ tân bấm thêm người mới, ô chọn quyền bị khóa cứng thành `Hội viên (MEMBER)` - không thể tự ý nâng quyền thành Manager hay Coach. Chỉ có Quản lý mới được mở menu chọn quyền.
- **Khóa thao tác sửa/xóa nhạy cảm**: Nút "Xóa tài khoản", "Khóa hoạt động", "Chỉnh sửa gói tập" chỉ xuất hiện ở màn hình của Quản lý.

---

## 5. THÔNG TIN NGƯỜI DÙNG ĐƯỢC LƯU TRỮ Ở ĐÂU?

Hệ thống lưu trữ dữ liệu người dùng ở **2 nơi song song** để vừa đảm bảo tốc độ mượt mà, vừa không bị mất dữ liệu khi tắt trình duyệt:

```
                  ┌───────────────────────────────────────────────┐
                  │          KHO LƯU TRỮ TRÌNH DUYỆT              │
                  │              (LocalStorage)                   │
                  │  - sportcenter_token : "eyJhbGciOi..."        │
                  │  - sportcenter_user  : {fullName, role, id}   │
                  │  - sportcenter_email : "manager@..."          │
                  │  - sportcenter_role  : "MANAGER"              │
                  └───────────────────────┬───────────────────────┘
                                          │ (Tự nạp lại khi bật web/F5)
                                          ▼
                  ┌───────────────────────────────────────────────┐
                  │             BỘ NHỚ TẠM THỜI                   │
                  │         (React State - AuthContext)           │
                  │  - user (Chứa toàn bộ thông tin)              │
                  │  - token                                      │
                  │  - isManager: true / false                    │
                  │  - isReceptionist: true / false               │
                  │  - isMember: true / false                     │
                  └───────────────────────────────────────────────┘
```

### 5.1. Bộ nhớ dài hạn trên trình duyệt (`LocalStorage`)
Nằm trong trình duyệt máy tính của bạn (bền vững kể cả khi tắt máy bật lại):
1. **`sportcenter_token`**: Chuỗi mã hóa bảo mật (JWT) dùng để Backend nhận diện danh tính.
2. **`sportcenter_user`**: Toàn bộ hồ sơ người dùng dạng JSON (ID, họ tên, email, vai trò, số điện thoại, ảnh đại diện...).
3. **`sportcenter_role`**: Vai trò hiện tại (`MANAGER`, `RECEPTIONIST`, `COACH`, `MEMBER`).

👉 **Tác dụng**: Giúp người dùng khi nhấn **F5 (Tải lại trang)** hoặc **mở tab mới** không bị văng ra trang đăng nhập, mà hệ thống tự động đọc lại phiên làm việc ngay lập tức.

### 5.2. Bộ nhớ tạm thời trong chương trình (`AuthContext` - Quản lý trạng thái)
Nằm trong bộ nhớ RAM khi trang web đang mở:
- Cung cấp sẵn các biến kiểm tra quyền cực kỳ tiện lợi: `isManager`, `isReceptionist`, `isMember`, `isAuthenticated`.
- Bất cứ màn hình nào cần kiểm tra "người này có phải quản lý không?" chỉ cần gọi biến `isManager` là xong.

### 5.3. Quy trình khi bấm "Đăng xuất" (Logout):
Khi người dùng bấm nút Đăng xuất đỏ ở góc trái:
1. Xóa sạch `sportcenter_token` và `sportcenter_user` trong bộ nhớ trình duyệt `localStorage`.
2. Đặt thông tin `user = null` trong bộ nhớ tạm.
3. Bật thông báo: *"Bạn đã đăng xuất khỏi hệ thống."*
4. Chuyển hướng người dùng về trang Đăng nhập (`/login`).  
$\rightarrow$ Đảm bảo an toàn tuyệt đối, người sau vào máy tính không thể xem được dữ liệu cũ.

---

## 6. GIẢI THÍCH CHI TIẾT TỪNG MÀN HÌNH & TÍNH NĂNG

### 6.1. Trang chủ (HomePage - `/`)
- **Mục đích**: Giới thiệu thương hiệu thể thao cao cấp, các bộ môn (Gym, Yoga, Bơi, Sân thể thao), đối tác công nghệ và khách hàng.
- **Tính năng nổi bật**:
  - Nút **"Đặt lịch Demo"**: Mở form đăng ký dùng thử 14 ngày.
  - Xem chi tiết từng tính năng nổi bật (Cổng xoay thông minh, chống trùng lịch sân,...).
  - Nút Hotline & Zalo trôi nổi ở góc màn hình để khách tiện bấm liên hệ ngay.

### 6.2. Màn hình Đăng nhập (LoginPage - `/login`)
- Người dùng nhập Email và Mật khẩu.
- Có chức năng **"Ghi nhớ đăng nhập"** (Remember me).
- Nếu đúng tài khoản: Hệ thống lưu phiên đăng nhập và tự chuyển hướng thẳng vào `/app`.

### 6.3. Màn hình Đăng ký (RegisterPage - `/register`)
- Dành cho khách muốn tự tạo tài khoản Hội viên (Member).
- Nhập: Họ tên, Email, Số điện thoại, Mật khẩu, Xác nhận lại mật khẩu.

### 6.4. Màn hình Bảng tin tổng quan (Overview - `/app`)
- Hiển thị các chỉ số kinh doanh quan trọng: Tổng số hội viên hoạt động, tổng doanh thu tháng, số lượt khách đang có mặt trong ngày, các lớp học sắp diễn ra.
- Biểu đồ tăng trưởng giúp Quản lý nắm bắt tình hình tức thì.

### 6.5. Quản lý Người dùng (Users - `/app/users`)
- **Quản lý (Manager)**: Thấy danh sách toàn bộ nhân viên, lễ tân, HLV và hội viên. Có nút Thêm người dùng mới, Sửa thông tin, Khóa/Mở khóa tài khoản, Vô hiệu hóa (xóa mềm).
- **Lễ tân (Receptionist)**: Chỉ thấy danh sách Hội viên để tiện tra cứu số điện thoại, đăng ký thành viên mới tại quầy.

### 6.6. Quản lý Gói tập (Packages - `/app/packages`)
- Danh sách gói: Gói ngày, gói tháng, gói VIP, gói kèm HLV cá nhân (PT).
- Hiển thị giá tiền, số ngày sử dụng, số buổi tập được phép, các đặc quyền đi kèm.
- Quản lý có thể tạo mới gói tập hoặc tạm dừng kinh doanh gói cũ.

### 6.7. Quản lý Đăng ký gói (Subscriptions - `/app/subscriptions`)
- Lưu lịch sử đăng ký của từng khách: Khách A mua gói VIP 3 tháng, ngày bắt đầu, ngày hết hạn.
- Trạng thái gói: Đang hoạt động (ACTIVE), Chờ thanh toán (PENDING), Hết hạn (EXPIRED), Đã hủy (CANCELLED).

### 6.8. Quản lý Thanh toán (Payments - `/app/payments`)
- Nhật ký dòng tiền: Khách thanh toán bao nhiêu tiền, bằng phương thức gì (Tiền mặt, Chuyển khoản ngân hàng, Quẹt thẻ POS).
- Có nút xuất xem **Hóa đơn điện tử** (Invoice Modal) để in hoặc chụp gửi khách hàng.

### 6.9. Lớp học & Lịch tập (Classes - `/app/classes`)
- Quản lý các bộ môn, phòng tập (sức chứa, tầng), danh mục lớp học (Yoga cơ bản, Boxing nâng cao,...).
- Đặt lịch học theo thứ trong tuần, khung giờ từ mấy giờ đến mấy giờ.
- Hội viên có thể bấm "Đăng ký tham gia" hoặc vào "Danh sách chờ" (Waitlist) nếu lớp đã đủ người.

### 6.10. Điểm danh tại quầy (Attendance - `/app/attendance`)
- Trạm tiếp đón của Lễ tân:
  - Chọn tên hoặc quét ID khách hàng.
  - Hệ thống tự kiểm tra xem khách này còn hạn gói tập hay không.
  - Nút **"Check-in"**: Ghi nhận khách bắt đầu vào phòng tập.
  - Nút **"Check-out"**: Ghi nhận khách ra về.
  - Xem danh sách những ai đang có mặt trong trung tâm theo thời gian thực.

### 6.11. Hồ sơ cá nhân (Profile - `/app/profile`)
- Xem và chỉnh sửa thông tin bản thân (Họ tên, SĐT, ngày sinh, giới tính, đổi mật khẩu).

---

## 7. TẤT TẦN TẬT CÁC TRƯỜNG HỢP VALIDATE (KIỂM TRA DỮ LIỆU)

> **Validate là gì?**  
> Là các luật bắt buộc mà người dùng phải tuân theo khi nhập liệu. Nếu vi phạm, hệ thống sẽ **chặn lại ngay tại màn hình** và hiện thông báo đỏ cảnh báo, không cho gửi dữ liệu sai về máy chủ.

Dưới đây là chi tiết từng trường hợp kiểm tra trên toàn bộ ứng dụng:

### 7.1. Form Đăng nhập (`LoginPage`)
1. **Bắt buộc nhập Email**: Không được để trống. Phải có định dạng đúng của email (chứa ký tự `@` và tên miền như `.com`, `.vn`).
2. **Bắt buộc nhập Mật khẩu**: Không được để trống.
3. **Email hoặc mật khẩu sai**: Nếu thông tin không khớp trên hệ thống, hiện khung báo động đỏ: *"Email hoặc mật khẩu không chính xác"*.
4. **Trạng thái bấm nút**: Khi bấm "Đăng nhập", nút chuyển sang *"Đang xử lý..."* và bị vô hiệu hóa để người dùng không bấm liên tục nhiều lần.

### 7.2. Form Đăng ký tài khoản (`RegisterPage`)
1. **Họ và tên**: Không được để trống.
2. **Email**: Bắt buộc đúng cú pháp email.
3. **Số điện thoại**: Bắt buộc nhập, phải là định dạng số điện thoại liên lạc.
4. **Độ dài Mật khẩu**: Phải có **tối thiểu 6 ký tự**. Nếu nhập ít hơn 6 ký tự -> Hiện lỗi: *"Mật khẩu phải có ít nhất 6 ký tự!"*.
5. **Khớp mật khẩu xác nhận**: Mật khẩu và ô Xác nhận mật khẩu phải giống hệt nhau. Nếu gõ khác nhau -> Chặn lại và hiện lỗi: *"Mật khẩu xác nhận không khớp!"*.

### 7.3. Form Đặt lịch tư vấn Demo (`DemoModal`)
1. **Họ tên người liên hệ**: Bắt buộc (`required`).
2. **Số điện thoại (Zalo)**: Bắt buộc (`required`). Nếu không điền, trình duyệt sẽ báo lỗi cần điền trường này.
3. **Mô hình trung tâm**: Phải chọn đúng một trong các mô hình có sẵn trong menu xổ xuống (Tổ hợp, Cụm sân, Gym, Bóng đá, Hồ bơi).

### 7.4. Form Thêm người dùng mới (`UserCreateModal`)
1. **Họ tên**: Bắt buộc.
2. **Email**: Bắt buộc, kiểm tra trùng lặp (Backend sẽ báo nếu email đã tồn tại).
3. **Số điện thoại**: Bắt buộc.
4. **Mật khẩu khởi tạo**: Bắt buộc nhập để cấp tài khoản ban đầu cho người dùng.
5. **Phân quyền vai trò**:
   - Quản lý (Manager): Được quyền chọn cấp các vai trò `MEMBER`, `RECEPTIONIST`, `COACH`, `MANAGER`.
   - Lễ tân (Receptionist): Ô phân quyền bị khóa cứng, chỉ được tạo tài khoản loại `Hội viên (MEMBER)`.

### 7.5. Form Điểm danh Check-in (`CheckInPanel` & `AttendancePage`)
1. **Kiểm tra trạng thái đang có mặt**:
   - Nếu khách hàng đã check-in rồi mà chưa check-out, hệ thống sẽ cảnh báo khách **"ĐANG CÓ MẶT TRONG CƠ SỞ"**.
   - Không cho phép check-in lần 2 nếu khách chưa thực hiện check-out lượt trước.
2. **Kiểm tra gói tập còn hiệu lực**:
   - Hệ thống quét danh sách gói tập của hội viên.
   - Nếu hội viên chưa mua gói nào hoặc gói đã hết hạn (EXPIRED), hệ thống hiển thị cảnh báo đỏ và nhắc nhở lễ tân hướng dẫn khách gia hạn trước khi cho vào tập.

### 7.6. Form Đăng ký & Xếp lịch lớp học (`ClassesPage`)
1. **Sức chứa tối đa (Max Capacity)**: Số lượng học viên trong một lớp phải là số dương lớn hơn 0.
2. **Khung giờ học**:
   - Giờ bắt đầu (`startTime`) và giờ kết thúc (`endTime`) phải hợp lệ theo định dạng giờ `HH:mm`.
   - Giờ kết thúc phải sau giờ bắt đầu.
3. **Sĩ số lớp đầy**: Nếu lớp đã đạt giới hạn tối đa (ví dụ 20/20 người), hội viên đăng ký mới sẽ được chuyển vào chế độ **Danh sách chờ (Waitlist)** thay vì đăng ký chính thức.
4. **Hạng thẻ tối thiểu (Tier Level)**: Một số lớp nâng cao yêu cầu hạng thẻ VIP, hội viên phải có cấp thẻ đủ tiêu chuẩn mới được đăng ký.

### 7.7. Form Tạo gói tập (`PackageFormModal`)
1. **Tên gói**: Bắt buộc (Ví dụ: Gói Thể thao Vàng 3 tháng).
2. **Giá tiền**: Phải là số dương, lớn hơn hoặc bằng 0đ.
3. **Thời hạn (Ngày)**: Phải là số ngày dương hợp lệ (ví dụ: 30 ngày, 90 ngày, 365 ngày).
4. **Số lượt tập**: Phải là số nguyên (hoặc tích chọn Không giới hạn).

---

## 8. CƠ CHẾ AN TOÀN ĐẶC BIỆT: ĐẾM NGƯỢC 5 GIÂY (COUNTDOWN CONFIRM MODAL)

Trong các hệ thống quản trị thông thường, nếu người dùng lỡ tay bấm nhầm nút "Xóa" hoặc "Khóa tài khoản", dữ liệu có thể bị mất hoặc gián đoạn hoạt động của khách hàng.

SportCenter đã thiết kế một linh kiện an toàn: **`CountdownConfirmModal`**:
- **Nguyên lý hoạt động**:
  1. Khi người quản lý bấm nút Khóa tài khoản, Vô hiệu hóa hoặc Xóa dữ liệu nhạy cảm, một bảng cảnh báo sẽ hiện lên.
  2. Nút "Xác nhận" sẽ **bị vô hiệu hóa (mờ đi và không thể click) trong 5 giây**.
  3. Màn hình hiển thị đồng hồ đếm ngược: `Chờ 5s...` -> `4s...` -> `3s...` -> `2s...` -> `1s...` -> `Sẵn sàng`.
  4. Chỉ sau khi hết 5 giây suy nghĩ, nút bấm mới sáng lên cho phép thực hiện.
- **Ý nghĩa**: Ngăn chặn 100% việc click nhầm do thói quen bấm chuột quá nhanh của người dùng.

---

## 9. HỆ THỐNG TỰ ĐỘNG THÔNG BÁO (TOAST)

Mọi thao tác của người dùng đều nhận được phản hồi trực quan ngay lập tức ở góc trên màn hình:
- **Màu xanh lá cây (Success)**: Thao tác thành công (Ví dụ: *"Đăng nhập thành công!"*, *"Tạo gói tập thành công!"*).
- **Màu đỏ (Error)**: Thao tác thất bại hoặc dữ liệu sai (Ví dụ: *"Mật khẩu xác nhận không khớp!"*, *"Email này đã được sử dụng"*).
- **Màu xanh dương / Xám (Info)**: Thông báo trạng thái (Ví dụ: *"Bạn đã đăng xuất khỏi hệ thống"*).
- **Tự động biến mất**: Thông báo sẽ tự mờ dần và biến mất sau 3 đến 4 giây, không làm vướng mắt người dùng.

---

## 10. BỘ CÂU HỎI THƯỜNG GẶP KHI THUYẾT TRÌNH / BẢO VỆ ĐỒ ÁN

### Câu 1: Làm thế nào Frontend biết được người dùng hiện tại là Quản lý hay Lễ tân để hiển thị chức năng?
> **Trả lời**: Sau khi đăng nhập thành công, Backend gửi về thông tin tài khoản kèm trường `role` (ví dụ `MANAGER` hoặc `RECEPTIONIST`). Frontend lưu trường này vào bộ nhớ `AuthContext` và `localStorage`. Tại thanh menu (`Sidebar.jsx`), các mục menu được cài điều kiện lọc: mục nào dành cho Staff mới hiện, mục nào chỉ Manager mới có, đảm bảo mỗi vai trò chỉ thấy đúng nghiệp vụ của mình.

### Câu 2: Frontend lưu mật khẩu của người dùng ở đâu? Có an toàn không?
> **Trả lời**: Frontend **tuyệt đối không bao giờ lưu mật khẩu** của người dùng trong trình duyệt. Frontend chỉ nhận mật khẩu khi người dùng gõ vào form đăng nhập để gửi ngay sang Backend kiểm tra. Sau khi đăng nhập thành công, Frontend chỉ lưu chuỗi mã bảo mật `JWT Token` và thông tin cơ bản (họ tên, email, vai trò). Mật khẩu hoàn toàn không tồn tại trên bộ nhớ máy tính.

### Câu 3: Frontend gọi API sang Backend như thế nào?
> **Trả lời**: Toàn bộ các lời gọi API được gom chung về một cổng quản lý duy nhất tại `src/services/api.js`. Tại đây sử dụng cơ chế `fetch` chuẩn của trình duyệt. Trước khi gửi đi, hàm sẽ tự động lấy `JWT Token` đính vào phần Header (`Authorization: Bearer <token>`) để Backend nhận diện. Khi Backend phản hồi về, nếu thành công sẽ trả dữ liệu ra màn hình, nếu lỗi hoặc rớt mạng sẽ tự động bắt lỗi và hiện thông báo tiếng Việt cho người dùng.

### Câu 4: Khi người dùng điền sai thông tin, hệ thống xử lý ở phía người dùng (Frontend) hay gửi về máy chủ (Backend) mới báo lỗi?
> **Trả lời**: Hệ thống kết hợp cả hai lớp bảo vệ:
> 1. **Lớp 1 (Tại Frontend)**: Kiểm tra ngay các lỗi cơ bản như: ô trống, email sai định dạng, mật khẩu ngắn dưới 6 ký tự, 2 lần nhập mật khẩu không khớp. Giúp phản hồi ngay lập tức mà không cần tốn thời gian gửi lên máy chủ.
> 2. **Lớp 2 (Tại Backend)**: Kiểm tra các dữ liệu cần đối chiếu cơ sở dữ liệu như email đã bị ai khác đăng ký trước đó chưa, gói tập có còn chỉ tiêu hay không. Nếu backend trả về lỗi, Frontend sẽ hứng lấy và hiển thị câu thông báo thân thiện cho người dùng.

### Câu 5: Tại sao lại chọn tông màu nền tối (Dark mode) kết hợp màu xanh lục (Emerald)?
> **Trả lời**: Tông màu tối kết hợp xanh ngọc lục bảo (Emerald Green) là xu hướng thiết kế giao diện hiện đại của các ứng dụng thể thao công nghệ cao. Nó tạo cảm giác mạnh mẽ, thể thao, bảo vệ mắt cho nhân viên khi phải nhìn màn hình làm việc cả ngày, đồng thời làm nổi bật các trạng thái như Đang hoạt động, Đã thanh toán.

---
*Tài liệu được tổng hợp và biên soạn dành riêng cho dự án SportCenter SWP Frontend.*
