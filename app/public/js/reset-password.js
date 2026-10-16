const params =
    new URLSearchParams(
        window.location.search
    );


const token =
    params.get("token");


const form =
    document.getElementById(
        "reset-password-form"
    );


const message =
    document.getElementById(
        "reset-message"
    );


const newPasswordInput =
    document.getElementById(
        "new-password"
    );


const confirmPasswordInput =
    document.getElementById(
        "confirm-password"
    );


// ==========================================
// KIỂM TRA TOKEN TRONG URL
// ==========================================

if (!token) {

    message.textContent =
        "Liên kết đặt lại mật khẩu không hợp lệ.";


    message.classList.add(
        "error-message"
    );


    form.style.display =
        "none";

}


// ==========================================
// GỬI MẬT KHẨU MỚI
// ==========================================

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        if (!token) {
            return;
        }


        const newPassword =
            newPasswordInput.value;


        const confirmPassword =
            confirmPasswordInput.value;


        // ======================================
        // KIỂM TRA MẬT KHẨU
        // ======================================

        if (
            newPassword.length < 8
        ) {

            message.textContent =
                "Mật khẩu mới phải có ít nhất 8 ký tự.";


            message.classList.remove(
                "success-message"
            );


            message.classList.add(
                "error-message"
            );


            return;

        }


        if (
            newPassword !==
            confirmPassword
        ) {

            message.textContent =
                "Hai mật khẩu không khớp.";


            message.classList.remove(
                "success-message"
            );


            message.classList.add(
                "error-message"
            );


            return;

        }


        message.textContent =
            "⏳ Đang cập nhật mật khẩu...";


        message.classList.remove(
            "success-message",
            "error-message"
        );


        try {

            const response =
                await fetch(
                    "/api/reset-password",
                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                token,

                                new_password:
                                    newPassword,

                                confirm_password:
                                    confirmPassword

                            })

                    }
                );


            const data =
                await response.json();


            message.textContent =
                data.message;


            // ======================================
            // THÀNH CÔNG
            // ======================================

            if (response.ok) {

                message.classList.remove(
                    "error-message"
                );


                message.classList.add(
                    "success-message"
                );


                form.reset();


                // Sau 2 giây chuyển về đăng nhập
                setTimeout(
                    () => {

                        window.location.href =
                            "/login.html";

                    },
                    2000
                );

            }

            // ======================================
            // THẤT BẠI
            // ======================================

            else {

                message.classList.remove(
                    "success-message"
                );


                message.classList.add(
                    "error-message"
                );

            }


        } catch (error) {

            console.error(
                "Lỗi đặt lại mật khẩu:",
                error
            );


            message.textContent =
                "Không thể kết nối tới máy chủ.";


            message.classList.remove(
                "success-message"
            );


            message.classList.add(
                "error-message"
            );

        }

    }
);
