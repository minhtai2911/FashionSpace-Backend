# FashionSpace-Backend

RESTful API backend cho hệ thống thương mại điện tử thời trang **FashionSpace** — hỗ trợ đầy đủ các nghiệp vụ như quản lý người dùng, danh mục sản phẩm, sản phẩm, đơn hàng, đánh giá, giỏ hàng, thanh toán trực tuyến và thống kê. Tích hợp chatbot Dialogflow và hệ thống khuyến nghị sản phẩm cá nhân hóa dựa trên hành vi của người dùng. Đồng thời cung cấp hệ thống phân tích đánh giá tiêu cực/tích cực giúp quản trị viên hiểu rõ hơn về mức độ hài lòng và xu hướng phản hồi khách hàng.

---

## Mục lục

* [Giới thiệu](#giới-thiệu)
* [Tính năng chính](#tính-năng-chính)
* [Công nghệ sử dụng](#công-nghệ-sử-dụng)
* [Cài đặt & Chạy dự án](#cài-đặt--chạy-dự-án)
* [Tài liệu API (Swagger)](#tài-liệu-api-swagger)

---

## Giới thiệu

**FashionSpace‑Backend** là hệ thống RESTful API hỗ trợ toàn bộ hoạt động của nền tảng thương mại điện tử thời trang. Dự án được xây dựng nhằm mục đích:

* Hỗ trợ hai vai trò chính: **Admin** và **Khách hàng**. Ngoài ra còn có tài khoản **Nhân viên** hỗ trợ quản lý đơn hàng và phản hồi đánh giá người dùng.
* Đáp ứng các chức năng từ quản lý sản phẩm, danh mục sản phẩm, đơn hàng, đánh giá, giỏ hàng, thanh toán trực tuyến đến thống kê doanh thu.
* Cung cấp API rõ ràng, dễ test thông qua Swagger UI.

---

## Tính năng chính

### Khách hàng

* Đăng ký/Đăng nhập, quên mật khẩu, đổi mật khẩu, cập nhật thông tin cá nhân.
* Xem danh sách sản phẩm, tìm kiếm theo tên/danh mục, bộ lọc theo đánh giá, giá cả.
* Quản lý giỏ hàng, tạo và theo dõi đơn hàng.
* Đánh giá sản phẩm.
* Nhận tư vấn thông qua chatbot

### Quản trị viên (Admin)

* Thêm/sửa/lưu trữ sản phẩm và danh mục.
* Quản lý người dùng toàn hệ thống.
* Thống kê doanh thu theo thời gian.

### Nhân viên

* Quản lý đơn hàng.
* Quản lý đánh giá.

---

## Công nghệ sử dụng

* **Node.js** + **Express.js**: Xây dựng RESTful API.
* **MongoDB** + **Mongoose**: Lưu trữ dữ liệu NoSQL.
* **JWT (JSON Web Token)** + **OAuth2**: Xác thực và phân quyền.
* **Dialogflow**: Chatbot tư vấn.
* **Tensorflow**: Hệ thống khuyến nghị sản phẩm.
* **Hugging Face**: Phân tích đánh giá bình luận tiêu cực/tích cực.
* **Redis**: Cache dữ liệu.
* **Swagger UI**: Tài liệu hóa API.
* **Dotenv**: Quản lý biến môi trường.
* **Multer & Cloudinary**: Upload và lưu trữ ảnh sản phẩm.

---

## Cài đặt & Chạy dự án

### 1. Clone dự án:

```bash
git clone https://github.com/minhtai2911/FashionSpace-Backend.git
cd FashionSpace-Backend
```

### 2. Cài dependencies:

```bash
npm install
```

### 3. Tạo file `.env` từ mẫu:

```bash
cp .env.example .env
```

> Điền các giá trị: `PORT`, `DB_URL`, `ACCESS_TOKEN_SECRET`, `CLOUDINARY_API_KEY`,...

### 4. Khởi chạy:

```bash
npm run dev        # chế độ development
npm start          # chế độ production
```

---

## Tài liệu API (Swagger)

* Truy cập: `http://localhost:8000/api-docs`
* Tài liệu rõ ràng theo từng nhóm chức năng.
