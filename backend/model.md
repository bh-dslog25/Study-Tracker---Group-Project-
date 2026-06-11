# 📦 Study Tracker — Tổng quan Models

> Tài liệu mô tả chức năng, nghiệp vụ và quan hệ của 9 models trong hệ thống.

---

## Phân loại theo vai trò

| Nhóm | Models | Ai dùng |
|---|---|---|
| Xác thực & phân quyền | `User` | Cả hai |
| Tự quản lý cá nhân | `Goal`, `Task`, `TimeLog` | Student (và Teacher) |
| Quản lý lớp học | `Class` | Teacher tạo |
| Phụ thuộc lớp học | `ClassMember`, `ClassTask`, `ClassSchedule`, `StudentProgress` | Hệ thống tự tạo / cả hai dùng |

---

## 1. User

**File:** `src/models/User.js`

**Chức năng:** Đại diện người dùng trong hệ thống. Là trung tâm của toàn bộ quan hệ.

**Nghiệp vụ:**
- Đăng ký với `role: 'student'` (mặc định) hoặc `'teacher'`
- Đăng nhập trả về `accessToken` (7 ngày) + `refreshToken` (30 ngày)
- Mật khẩu được **bcrypt hash tự động** qua hook `beforeCreate` và `beforeUpdate`
- `toJSON()` tự động loại bỏ `password` và `refreshToken` khỏi response

**Fields quan trọng:**

| Field | Kiểu | Mô tả |
|---|---|---|
| `role` | ENUM | `student` hoặc `teacher` — quyết định toàn bộ phân quyền |
| `password` | STRING | Luôn lưu dạng hash, không bao giờ plain text |
| `refreshToken` | TEXT | Lưu token hiện tại, set `null` khi logout |
| `isActive` | BOOLEAN | `false` = tài khoản bị khoá, không đăng nhập được |
| `lastLogin` | DATE | Cập nhật mỗi lần đăng nhập thành công |

**Hooks:**
```
beforeCreate  → hash password
beforeUpdate  → re-hash nếu password thay đổi
```

---

## 2. Goal

**File:** `src/models/Goal.js`

**Chức năng:** Mục tiêu học tập cá nhân — student (và teacher) tự đặt ra để theo dõi tiến độ.

**Nghiệp vụ:**
- Student đặt mục tiêu giờ học cho một khoảng thời gian (ngày/tuần/tháng)
- Hệ thống so sánh `achievedHours` với `targetHours` để tính % hoàn thành
- Hỗ trợ `isAutoRenew` để tự động tạo lại mục tiêu sau khi hết hạn
- Trạng thái tự chuyển: `active` → `completed` khi đủ giờ, `failed` khi quá hạn chưa đạt

**Fields quan trọng:**

| Field | Kiểu | Mô tả |
|---|---|---|
| `type` | ENUM | `daily`, `weekly`, `monthly`, `custom` |
| `targetHours` | DECIMAL | Số giờ cần đạt |
| `achievedHours` | DECIMAL | Số giờ đã học thực tế (cộng dồn từ TimeLog) |
| `status` | ENUM | `active`, `completed`, `failed`, `cancelled` |
| `startDate` / `endDate` | DATEONLY | Khoảng thời gian mục tiêu |

---

## 3. Task

**File:** `src/models/Task.js`

**Chức năng:** Nhiệm vụ / bài tập cá nhân — student tự tạo để quản lý việc học.

**Nghiệp vụ:**
- Student tạo task với mức ưu tiên và deadline riêng
- Khi chuyển `status` sang `'completed'`, hook tự ghi `completedAt = new Date()`
- Có thể gắn `tags` (JSON array) để phân loại

**Fields quan trọng:**

| Field | Kiểu | Mô tả |
|---|---|---|
| `priority` | ENUM | `low`, `medium`, `high`, `urgent` |
| `status` | ENUM | `todo`, `in_progress`, `completed`, `cancelled` |
| `dueDate` | DATEONLY | Deadline tự đặt |
| `completedAt` | DATE | Tự động ghi khi hoàn thành |
| `estimatedMinutes` | INTEGER | Ước tính thời gian cần làm |

**Hooks:**
```
beforeSave → nếu status = 'completed' thì completedAt = now()
```

---

## 4. TimeLog

**File:** `src/models/TimeLog.js`

**Chức năng:** Ghi lại phiên học thực tế — student bấm Start/Stop để đo thời gian học.

**Nghiệp vụ:**
- Gọi `POST /timelogs/start` → tạo TimeLog với `status: 'ongoing'`, `startTime = now()`
- Gọi `PUT /timelogs/:id/stop` → ghi `endTime`, hook tự tính `durationMinutes`
- Chỉ được có 1 phiên `ongoing` cùng lúc (service kiểm tra trước khi tạo)
- Sau khi kết thúc, `durationMinutes` được cộng vào `Goal.achievedHours`

**Fields quan trọng:**

| Field | Kiểu | Mô tả |
|---|---|---|
| `status` | ENUM | `ongoing`, `completed`, `paused` |
| `startTime` | DATE | Bắt đầu học |
| `endTime` | DATE | Kết thúc học |
| `durationMinutes` | INTEGER | Tự tính = endTime − startTime |
| `rating` | TINYINT | 1–5 sao đánh giá buổi học |
| `focusScore` | TINYINT | 1–10 điểm tập trung |

**Hooks:**
```
beforeSave → durationMinutes = round((endTime - startTime) / 60000)
```

---

## 5. Class

**File:** `src/models/Class.js`

**Chức năng:** Lớp học — teacher tạo và quản lý, student tham gia bằng mã mời.

**Nghiệp vụ:**
- Teacher tạo lớp → hệ thống **tự sinh `inviteCode` 6 ký tự** ngẫu nhiên, đảm bảo không trùng
- Student dùng `inviteCode` để tham gia lớp (`POST /classes/join`)
- Teacher có thể set `isActive: false` để khoá lớp (student không join được nữa)
- Giới hạn `maxStudents` — service kiểm tra trước khi cho join

**Fields quan trọng:**

| Field | Kiểu | Mô tả |
|---|---|---|
| `teacherId` | FK → User | Giáo viên sở hữu lớp |
| `inviteCode` | STRING(10) | Mã mời, unique, tự sinh |
| `isActive` | BOOLEAN | `false` = đóng lớp |
| `maxStudents` | INTEGER | Giới hạn số học viên (mặc định 50) |

---

## 6. ClassMember

**File:** `src/models/ClassMember.js`

**Chức năng:** Bảng trung gian N:N giữa Class và User (student) — **hệ thống tự tạo**, không có API tạo thủ công.

**Nghiệp vụ:**
- Được tạo tự động khi student gọi `POST /classes/join` với `inviteCode` hợp lệ
- `status: 'removed'` khi teacher kick student hoặc student tự rời lớp — **không xoá record** để giữ lịch sử
- Nếu student join lại lớp cũ, chỉ update `status` về `'active'` thay vì tạo bản ghi mới

**Fields quan trọng:**

| Field | Kiểu | Mô tả |
|---|---|---|
| `classId` | FK → Class | Lớp học |
| `studentId` | FK → User | Học viên |
| `status` | ENUM | `active`, `removed` |
| `joinedAt` | DATE | Thời điểm tham gia |

---

## 7. ClassTask

**File:** `src/models/ClassTask.js`

**Chức năng:** Nhiệm vụ / bài tập do teacher tạo và giao cho toàn bộ học viên trong lớp.

**Nghiệp vụ:**
- Teacher tạo ClassTask → service **tự động `bulkCreate` StudentProgress** cho mọi thành viên lớp
- Mỗi student sẽ thấy task này trong danh sách và có thể cập nhật tiến độ của mình
- Khác với `Task` (cá nhân): ClassTask là nhiệm vụ chung, teacher theo dõi được

**Fields quan trọng:**

| Field | Kiểu | Mô tả |
|---|---|---|
| `classId` | FK → Class | Lớp được giao |
| `createdBy` | FK → User | Teacher tạo |
| `priority` | ENUM | `low`, `medium`, `high` |
| `dueDate` | DATEONLY | Hạn nộp |
| `attachmentUrl` | STRING | Link tài liệu đính kèm |

---

## 8. ClassSchedule

**File:** `src/models/ClassSchedule.js`

**Chức năng:** Lịch học / lịch thi do teacher tạo cho lớp — student xem để biết thời gian học.

**Nghiệp vụ:**
- Teacher tạo lịch với `startTime` và `endTime` cụ thể
- Hỗ trợ cả học online (`meetingUrl`) và offline (`location`)
- Student trong lớp thấy lịch này qua `GET /classes/:classId/schedules`

**Fields quan trọng:**

| Field | Kiểu | Mô tả |
|---|---|---|
| `classId` | FK → Class | Lớp học |
| `createdBy` | FK → User | Teacher tạo |
| `type` | ENUM | `lesson`, `exam`, `review`, `other` |
| `startTime` / `endTime` | DATE | Thời gian buổi học |
| `meetingUrl` | STRING | Link Google Meet / Zoom (online) |
| `location` | STRING | Phòng học / địa điểm (offline) |

---

## 9. StudentProgress

**File:** `src/models/StudentProgress.js`

**Chức năng:** Theo dõi tiến độ từng student với từng ClassTask — **hệ thống tự tạo**, teacher chỉ đọc.

**Nghiệp vụ:**
- Được `bulkCreate` tự động khi teacher tạo một `ClassTask` mới
- Mỗi bản ghi = 1 student × 1 ClassTask × 1 Class
- Student cập nhật `status` của mình qua `PATCH /progress/:id`
- Teacher xem toàn bộ tiến độ lớp qua `GET /classes/:classId/progress`
- Hook tự ghi `completedAt` khi `status` chuyển sang `'completed'`

**Fields quan trọng:**

| Field | Kiểu | Mô tả |
|---|---|---|
| `classTaskId` | FK → ClassTask | Nhiệm vụ được giao |
| `studentId` | FK → User | Học viên |
| `classId` | FK → Class | Lớp (để query nhanh) |
| `status` | ENUM | `assigned`, `in_progress`, `completed`, `late` |
| `completedAt` | DATE | Tự ghi khi hoàn thành |
| `note` | TEXT | Ghi chú của student |

**Hooks:**
```
beforeSave → nếu status = 'completed' và chưa có completedAt thì completedAt = now()
```

---

## Quan hệ giữa các Models (Associations)

```
User (student)  ──1:N──  Goal
User (student)  ──1:N──  Task
User (student)  ──1:N──  TimeLog

User (teacher)  ──1:N──  Class

Class           ──N:N──  User (student)   qua  ClassMember
Class           ──1:N──  ClassTask
Class           ──1:N──  ClassSchedule

ClassTask       ──1:N──  StudentProgress
User (student)  ──1:N──  StudentProgress
```

---

## Luồng nghiệp vụ chính

### Teacher
```
Tạo Class  →  Chia sẻ inviteCode  →  Tạo ClassTask  →  Tạo ClassSchedule
                                            ↓
                              StudentProgress tự sinh cho toàn bộ thành viên
                                            ↓
                              Teacher theo dõi tiến độ qua GET /progress
```

### Student
```
Nhập inviteCode  →  Tham gia Class  →  Thấy ClassTask + ClassSchedule
                                              ↓
                              Cập nhật status progress của bản thân
                                              ↓
                              Tự quản lý: Goal + Task + TimeLog cá nhân
```
bac
---

## Hành vi tự động tổng hợp

| Model | Trigger | Hành vi |
|---|---|---|
| `User` | `beforeCreate` / `beforeUpdate` | Bcrypt hash password |
| `TimeLog` | `beforeSave` | Tính `durationMinutes` từ startTime/endTime |
| `Task` | `beforeSave` | Ghi `completedAt` khi `status = completed` |
| `StudentProgress` | `beforeSave` | Ghi `completedAt` khi `status = completed` |
| `ClassTask` | Sau `create` trong service | `bulkCreate` StudentProgress cho mọi thành viên |
| `ClassMember` | Tự tạo trong service | Sinh khi student join lớp bằng inviteCode |