const path = require("path");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config({
    path: path.join(
        __dirname,
        "../../.env"
    )
});

const db = require("../src/db");


async function createAdmin() {

    let connection;

    try {

        const fullName =
            process.env.ADMIN_NAME;

        const email =
            process.env.ADMIN_EMAIL;

        const password =
            process.env.ADMIN_PASSWORD;


        if (
            !fullName ||
            !email ||
            !password
        ) {

            throw new Error(
                "Thiếu ADMIN_NAME, ADMIN_EMAIL hoặc ADMIN_PASSWORD trong .env"
            );

        }


        connection =
            await db.getConnection();


        await connection.query(
            "SET NAMES utf8mb4"
        );


        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        const [users] =
            await connection.query(
                `
                SELECT id
                FROM users
                WHERE email = ?
                `,
                [email]
            );


        // Nếu tài khoản đã tồn tại
        if (users.length > 0) {

            await connection.query(
                `
                UPDATE users
                SET
                    full_name = ?,
                    password = ?,
                    role = 'admin'
                WHERE email = ?
                `,
                [
                    fullName,
                    hashedPassword,
                    email
                ]
            );


            console.log(
                "Đã cập nhật tài khoản Admin."
            );

        } else {

            await connection.query(
                `
                INSERT INTO users
                (
                    full_name,
                    email,
                    password,
                    role
                )
                VALUES
                (
                    ?,
                    ?,
                    ?,
                    'admin'
                )
                `,
                [
                    fullName,
                    email,
                    hashedPassword
                ]
            );


            console.log(
                "Tạo tài khoản Admin thành công."
            );

        }


    } catch (error) {

        console.error(
            "Lỗi tạo Admin:",
            error.message
        );


    } finally {

        if (connection) {

            connection.release();

        }

        process.exit();

    }

}


createAdmin();
