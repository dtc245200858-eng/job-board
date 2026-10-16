const form =
    document.getElementById(
        "login-form"
    );


const message =
    document.getElementById(
        "login-message"
    );


form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


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


        try {

            const response =
                await fetch(
                    "/api/login",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                email,
                                password
                            })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                message.textContent =
                    data.message ||
                    "Đăng nhập thất bại.";

                return;

            }


            message.textContent =
                "Đăng nhập thành công!";


            setTimeout(
                () => {

                    window.location.href =
                        "/";

                },
                800
            );


        } catch (error) {

            console.error(error);


            message.textContent =
                "Không thể kết nối tới máy chủ.";

        }

    }
);
