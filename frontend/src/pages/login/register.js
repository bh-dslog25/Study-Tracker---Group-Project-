document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Chặn load lại trang

    const usernameInput = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value;

    if (usernameInput === "" || passwordInput === "") {
        alert("Please fulfill your information !");
        return;
    }

    // 1. Lấy danh sách tài khoản đã có về (nếu chưa có thì khởi tạo mảng rỗng)
    let accounts = JSON.parse(localStorage.getItem('accounts')) || [];

    // 2. Kiểm tra xem tài khoản này đã có ai đăng ký chưa
    const isExist = accounts.some(acc => acc.username === usernameInput);
    if (isExist) {
        alert("This account exists. Please choose another username");
        return;
    }

    // 3. Thêm tài khoản mới vào mảng
    accounts.push({
        username: usernameInput,
        password: passwordInput // Lưu ý: Làm thực tế sẽ cần mã hóa, ở đây làm local để hiểu logic trước nhé
    });

    // 4. Lưu mảng tài khoản mới ngược lại vào localStorage
    localStorage.setItem('accounts', JSON.stringify(accounts));

    alert("Register successfully...");
    
    // 5. Chuyển người dùng về trang login để họ đăng nhập
    window.location.href = "login.html"; 
});