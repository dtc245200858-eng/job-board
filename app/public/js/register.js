const form =
    document.getElementById(
        "register-form"
    );


const message =
    document.getElementById(
        "register-message"
    );


form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const fullName =
            document
                .getElementById(
                    "full-name"
                )
                .value
                .trim();


        const email =
            document
                .getElementById(
                    "email"
                )
                .value
                .trim();


        const password =
            document
                .getElementById(
                    "password"
                )
                .value;


        const confirmPassword =
            document
                .getElementById(
                    "confirm-password"
                )
                .value;


        if (
            password !==
            confirmPassword
        ) {

            message.textContent =
                "Mật khẩu nhập lại không khớp.";

            return;

        }


        try {

            const response =
                await fetch(
                    "/api/register",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                full_name:
                                    fullName,

                                email:
                                    email,

                                password:
                                    password

                            })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                message.textContent =
                    data.message ||
                    "Đăng ký thất bại.";

                return;

            }


            message.textContent =
                "Đăng ký thành công!";


            setTimeout(
                () => {

                    window.location.href =
                        "/login.html";

                },
                1200
            );


        } catch (error) {

            console.error(error);


            message.textContent =
                "Không thể kết nối tới máy chủ.";

        }

    }
);
