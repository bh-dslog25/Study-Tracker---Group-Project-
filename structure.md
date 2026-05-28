study-tracker/
│
├── backend/                  <-- "Nhà bếp & Bồi bàn" (Nơi xử lý dữ liệu)
│   ├── src/
│   │   ├── config/           <-- Cấu hình hệ thống
│   │   │   └── db.js         <-- Code kết nối Node.js với MySQL
│   │   ├── controllers/      <-- Não bộ xử lý logic
│   │   │   └── authController.js <-- Xử lý đúng/sai khi đăng nhập
│   │   ├── models/           <-- Giao tiếp trực tiếp với MySQL
│   │   │   └── userModel.js  <-- Chứa các câu lệnh SQL (SELECT, INSERT)
│   │   ├── routes/           <-- Cửa nhận yêu cầu từ Frontend
│   │   │   └── authRoutes.js <-- Định nghĩa các đường dẫn như /api/login
│   │   ├── server.js         <-- File gốc khởi động toàn bộ Backend
│   ├── .env                  <-- Nơi giấu mật khẩu MySQL (Không push lên GitHub)
│   └── package.json          <-- Khai báo thư viện Backend
│
├── frontend/                 <-- "Phòng ăn" (Giao diện bạn đã làm)
│   ├── css/                  <-- Thư mục chứa style
│   │   └── style.css
│   ├── js/                   <-- Logic giao diện và gọi API
│   │   ├── login.js
│   │   └── calendar.js
│   ├── views/                <-- Chứa các file HTML
│   │   ├── login.html
│   │   ├── index.html
│   │   └── register.html
│   └── assets/               <-- Hình ảnh, icon, logo
│       └── logo.png
│
└── README.md