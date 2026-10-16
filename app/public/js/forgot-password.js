const form =
    document.getElementById(
        "forgot-password-form"
    );


const message =
    document.getElementById(
        "forgot-message"
    );


form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const email =
            document
                .getElementById("email")
                .value
                .trim();


        if (!email) {

            message.textContent =
                "Vui lòng nhập email.";

            return;

        }


        message.textContent =
            "⏳ Đang gửi email khôi phục...";


        try {

            const response =
                await fetch(
                    "/api/forgot-password",
                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({
                                email
                            })

                    }
                );


            const data =
                await response.json();


            message.textContent =
                data.message;


            if (response.ok) {

                message.classList.remove(
                    "error-message"
                );

                message.classList.add(
                    "success-message"
                );

            } else {

                message.classList.remove(
                    "success-message"
                );

                message.classList.add(
                    "error-message"
                );

            }


        } catch (error) {

            console.error(
                "Lỗi gửi yêu cầu quên mật khẩu:",
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
