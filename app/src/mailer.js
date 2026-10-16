const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const path = require("path");


// Đọc biến môi trường từ file .env ở thư mục gốc project
dotenv.config({
    path: path.join(
        __dirname,
        "../../.env"
    )
});


function createTransporter() {

    return nodemailer.createTransport({

        service: "gmail",

        auth: {

            user:
                process.env.EMAIL_USER,

            pass:
                process.env.EMAIL_APP_PASSWORD

        }

    });

}


async function sendPasswordResetEmail(
    to,
    resetUrl
) {

    const transporter =
        createTransporter();


    await transporter.sendMail({

        from:
            `"Job Board" <${process.env.EMAIL_USER}>`,

        to,

        subject:
            "Đặt lại mật khẩu - Job Board",

        html: `
            <div
                style="
                    max-width: 600px;
                    margin: 20px auto;
                    padding: 30px;
                    font-family: Arial, sans-serif;
                    background: #f8fafc;
                    border-radius: 16px;
                    color: #334155;
                "
            >

                <h2
                    style="
                        margin-top: 0;
                        color: #6d28d9;
                    "
                >
                    🔐 Đặt lại mật khẩu Job Board
                </h2>


                <p>
                    Chúng tôi nhận được yêu cầu
                    đặt lại mật khẩu cho tài khoản
                    Job Board của bạn.
                </p>


                <p>
                    Nhấn vào nút bên dưới để
                    tạo mật khẩu mới:
                </p>


                <div
                    style="
                        text-align: center;
                        margin: 30px 0;
                    "
                >

                    <a
                        href="${resetUrl}"
                        style="
                            display: inline-block;
                            padding: 13px 24px;
                            border-radius: 9px;
                            background: linear-gradient(
                                135deg,
                                #2563eb,
                                #7c3aed
                            );
                            color: white;
                            text-decoration: none;
                            font-weight: bold;
                        "
                    >
                        ✨ Đặt lại mật khẩu
                    </a>

                </div>


                <p>
                    Liên kết này chỉ có hiệu lực
                    trong 15 phút.
                </p>


                <p
                    style="
                        color: #64748b;
                        font-size: 13px;
                    "
                >
                    Nếu bạn không yêu cầu thay đổi
                    mật khẩu, bạn có thể bỏ qua email này.
                </p>

            </div>
        `

    });

}


async function verifyEmailConnection() {

    const transporter =
        createTransporter();

    await transporter.verify();

}


module.exports = {

    sendPasswordResetEmail,

    verifyEmailConnection

};
