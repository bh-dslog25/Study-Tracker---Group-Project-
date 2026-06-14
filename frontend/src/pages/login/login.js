document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const usernameInput = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value;

    // 1. Lấy danh sách tài khoản từ localStorage về để kiểm tra
    let accounts = JSON.parse(localStorage.getItem('accounts')) || [];

    // Giả lập kiểm tra đăng nhập (Sau này bạn có thể kết nối API/Backend ở đây)
    if (usernameInput.trim() === "" || passwordInput.trim() === "") {
        alert("Please fulfill your information");
        return;
    }

    // 2. Tìm xem có tài khoản nào khớp cả username và password không
    const userFound = accounts.find(acc => acc.username === usernameInput && acc.password === passwordInput);

    if (userFound) {
        // Nếu tìm thấy: Lưu trạng thái đăng nhập hiện tại
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', usernameInput);

        alert("Login successfully !");
        // Chuyển hướng sang trang chính
        window.location.href = "../timetracker/index.html";
    } else {
        // Nếu không khớp
        alert("Username or password is wrong or no exists !");
    }
});



























