const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const multer = require("multer");
const fs = require("fs");
const crypto = require("crypto");

const {
    sendPasswordResetEmail
} = require("./mailer");

dotenv.config({
    path: path.join(__dirname, "../../.env")
});

const db = require("./db");

const app = express();

const PORT =
    Number(process.env.APP_PORT) || 3000;


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);
// ==========================================
// SESSION
// ==========================================

app.use(
    session({
        secret:
            process.env.SESSION_SECRET ||
            "jobboard_secret",

        resave: false,

        saveUninitialized: false,

        cookie: {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge:
                1000 * 60 * 60 * 2
        }
    })
);
// ==========================================
// KIỂM TRA NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP
// ==========================================

function requireLogin(req, res, next) {

    if (!req.session.user) {

        return res.status(401).json({
            message:
                "Bạn phải đăng nhập trước khi nộp CV."
        });

    }

    next();
}
// ==========================================
// KIỂM TRA QUYỀN ADMIN
// ==========================================

function requireAdmin(req, res, next) {

    if (!req.session.user) {

        return res.status(401).json({
            message:
                "Bạn chưa đăng nhập."
        });

    }


    if (
        req.session.user.role !==
        "admin"
    ) {

        return res.status(403).json({
            message:
                "Bạn không có quyền Admin."
        });

    }


    next();
}

// ==========================================
// CẤU HÌNH UPLOAD CV
// ==========================================

const uploadDirectory =
    path.join(
        __dirname,
        "../uploads"
    );


if (!fs.existsSync(uploadDirectory)) {

    fs.mkdirSync(
        uploadDirectory,
        {
            recursive: true
        }
    );

}


const storage =
    multer.diskStorage({

        destination:
            function (
                req,
                file,
                cb
            ) {

                cb(
                    null,
                    uploadDirectory
                );

            },

        filename:
            function (
                req,
                file,
                cb
            ) {

                const extension =
                    path.extname(
                        file.originalname
                    )
                    .toLowerCase();


                const uniqueName =
                    Date.now()
                    + "-"
                    + Math.round(
                        Math.random()
                        * 1E9
                    )
                    + extension;


                cb(
                    null,
                    uniqueName
                );

            }

    });


const upload =
    multer({

        storage: storage,

        limits: {
            fileSize:
                5 * 1024 * 1024
        },

        fileFilter:
            function (
                req,
                file,
                cb
            ) {

                const allowedExtensions = [
                    ".pdf",
                    ".doc",
                    ".docx"
                ];


                const extension =
                    path.extname(
                        file.originalname
                    )
                    .toLowerCase();


                if (
                    !allowedExtensions
                        .includes(extension)
                ) {

                    return cb(
                        new Error(
                            "Chỉ chấp nhận file PDF, DOC hoặc DOCX."
                        )
                    );

                }


                cb(
                    null,
                    true
                );

            }

    });
// ==========================================
// STATIC FILES
// ==========================================

app.use(
    express.static(
        path.join(
            __dirname,
            "../public"
        )
    )
);


// ==========================================
// TRANG CHỦ
// ==========================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "../public/index.html"
        )
    );

});


// ==========================================
// API DANH SÁCH VIỆC LÀM
// ==========================================

app.get("/api/jobs", async (req, res) => {

    let connection;

    try {

        connection =
            await db.getConnection();


        await connection.query(
            "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        );


        const sql = `
            SELECT
                jobs.id,
                jobs.title,
                jobs.location,
                jobs.salary,
                jobs.description,
                jobs.deadline,
                jobs.status,

                companies.name AS company_name,

                categories.name AS category_name

            FROM jobs

            INNER JOIN companies
                ON jobs.company_id = companies.id

            INNER JOIN categories
                ON jobs.category_id = categories.id

            WHERE jobs.status = 'active'

            ORDER BY jobs.id DESC
        `;


        const [rows] =
            await connection.query(sql);


        res
            .type("application/json; charset=utf-8")
            .json(rows);


    } catch (error) {

        console.error(
            "Lỗi lấy danh sách việc làm:",
            error
        );


        res.status(500).json({
            message:
                "Không thể lấy danh sách việc làm."
        });


    } finally {

        if (connection) {

            connection.release();

        }

    }

});
// ==========================================
// API CHI TIẾT MỘT VIỆC LÀM
// ==========================================

app.get("/api/jobs/:id", async (req, res) => {

    let connection;

    try {

        const jobId =
            req.params.id;


        connection =
            await db.getConnection();


        await connection.query(
            "SET NAMES utf8mb4"
        );


        const sql = `
            SELECT
                jobs.id,
                jobs.title,
                jobs.location,
                jobs.salary,
                jobs.description,
                jobs.deadline,
                jobs.status,

                companies.id
                    AS company_id,

                companies.name
                    AS company_name,

                companies.description
                    AS company_description,

                companies.address
                    AS company_address,

                categories.name
                    AS category_name

            FROM jobs

            INNER JOIN companies
                ON jobs.company_id =
                   companies.id

            INNER JOIN categories
                ON jobs.category_id =
                   categories.id

            WHERE jobs.id = ?
        `;


        const [rows] =
            await connection.query(
                sql,
                [jobId]
            );


        if (rows.length === 0) {

            return res
                .status(404)
                .json({
                    message:
                        "Không tìm thấy việc làm."
                });

        }


        res.json(rows[0]);


    } catch (error) {

        console.error(
            "Lỗi lấy chi tiết việc làm:",
            error
        );


        res.status(500).json({
            message:
                "Không thể lấy thông tin việc làm."
        });


    } finally {

        if (connection) {

            connection.release();

        }

    }

});
// ==========================================
// API ĐĂNG KÝ ỨNG VIÊN
// ==========================================

app.post("/api/register", async (req, res) => {

    let connection;

    try {

        const {
            full_name,
            email,
            password
        } = req.body;


        // Kiểm tra dữ liệu
        if (
            !full_name ||
            !email ||
            !password
        ) {

            return res.status(400).json({
                message:
                    "Vui lòng nhập đầy đủ thông tin."
            });

        }


        if (password.length < 6) {

            return res.status(400).json({
                message:
                    "Mật khẩu phải có ít nhất 6 ký tự."
            });

        }


        connection =
            await db.getConnection();


        await connection.query(
            "SET NAMES utf8mb4"
        );


        // Kiểm tra email đã tồn tại
        const [existingUsers] =
            await connection.query(
                `
                SELECT id
                FROM users
                WHERE email = ?
                `,
                [email]
            );


        if (existingUsers.length > 0) {

            return res.status(409).json({
                message:
                    "Email này đã được đăng ký."
            });

        }


        // Mã hóa mật khẩu
        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // Thêm ứng viên
        const [result] =
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
                    'candidate'
                )
                `,
                [
                    full_name,
                    email,
                    hashedPassword
                ]
            );


        res.status(201).json({

            message:
                "Đăng ký tài khoản thành công.",

            user: {
                id:
                    result.insertId,

                full_name:
                    full_name,

                email:
                    email,

                role:
                    "candidate"
            }

        });


    } catch (error) {

        console.error(
            "Lỗi đăng ký:",
            error
        );


        res.status(500).json({
            message:
                "Không thể đăng ký tài khoản."
        });


    } finally {

        if (connection) {

            connection.release();

        }

    }

});
// ==========================================
// API ĐĂNG NHẬP
// ==========================================

app.post("/api/login", async (req, res) => {

    let connection;

    try {

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({
                message:
                    "Vui lòng nhập email và mật khẩu."
            });

        }


        connection =
            await db.getConnection();


        await connection.query(
            "SET NAMES utf8mb4"
        );


        const [users] =
            await connection.query(
                `
                SELECT
                    id,
                    full_name,
                    email,
                    password,
                    role

                FROM users

                WHERE email = ?
                `,
                [email]
            );


        if (users.length === 0) {

            return res.status(401).json({
                message:
                    "Email hoặc mật khẩu không đúng."
            });

        }


        const user =
            users[0];


        const passwordCorrect =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordCorrect) {

            return res.status(401).json({
                message:
                    "Email hoặc mật khẩu không đúng."
            });

        }


        req.session.user = {
            id:
                user.id,

            full_name:
                user.full_name,

            email:
                user.email,

            role:
                user.role
        };


        res.json({
            message:
                "Đăng nhập thành công.",

            user:
                req.session.user
        });


    } catch (error) {

        console.error(
            "Lỗi đăng nhập:",
            error
        );


        res.status(500).json({
            message:
                "Không thể đăng nhập."
        });


    } finally {

        if (connection) {

            connection.release();

        }

    }

});
// ==========================================
// API THÔNG TIN NGƯỜI ĐANG ĐĂNG NHẬP
// ==========================================

app.get("/api/me", (req, res) => {

    if (!req.session.user) {

        return res.status(401).json({
            loggedIn: false
        });

    }


    res.json({
        loggedIn: true,
        user:
            req.session.user
    });

});
// ==========================================
// API ĐĂNG XUẤT
// ==========================================

app.post("/api/logout", (req, res) => {

    req.session.destroy(
        (error) => {

            if (error) {

                return res.status(500).json({
                    message:
                        "Không thể đăng xuất."
                });

            }


            res.clearCookie(
                "connect.sid"
            );


            res.json({
                message:
                    "Đăng xuất thành công."
            });

        }
    );

});
// ==========================================
// API NỘP HỒ SƠ ỨNG TUYỂN
// ==========================================

app.post(
    "/api/applications",
    requireLogin,
    upload.single("cv"),
    async (req, res) => {

        let connection;

        try {

            const userId =
                req.session.user.id;


            const jobId =
                req.body.job_id;


            if (!jobId) {

                if (req.file) {

                    fs.unlinkSync(
                        req.file.path
                    );

                }


                return res
                    .status(400)
                    .json({
                        message:
                            "Thiếu mã việc làm."
                    });

            }


            if (!req.file) {

                return res
                    .status(400)
                    .json({
                        message:
                            "Vui lòng chọn file CV."
                    });

            }


            connection =
                await db.getConnection();


            await connection.query(
                "SET NAMES utf8mb4"
            );


            // Kiểm tra việc làm tồn tại
            const [jobs] =
                await connection.query(
                    `
                    SELECT id
                    FROM jobs
                    WHERE id = ?
                    AND status = 'active'
                    `,
                    [jobId]
                );


            if (jobs.length === 0) {

                fs.unlinkSync(
                    req.file.path
                );


                return res
                    .status(404)
                    .json({
                        message:
                            "Tin tuyển dụng không tồn tại hoặc đã đóng."
                    });

            }


            // Kiểm tra đã ứng tuyển chưa
            const [applications] =
                await connection.query(
                    `
                    SELECT id
                    FROM applications
                    WHERE user_id = ?
                    AND job_id = ?
                    `,
                    [
                        userId,
                        jobId
                    ]
                );


            if (
                applications.length > 0
            ) {

                fs.unlinkSync(
                    req.file.path
                );


                return res
                    .status(409)
                    .json({
                        message:
                            "Bạn đã ứng tuyển công việc này rồi."
                    });

            }


            // Lưu hồ sơ
            const [result] =
                await connection.query(
                    `
                    INSERT INTO applications
                    (
                        user_id,
                        job_id,
                        cv_file,
                        status
                    )

                    VALUES
                    (
                        ?,
                        ?,
                        ?,
                        'pending'
                    )
                    `,
                    [
                        userId,
                        jobId,
                        req.file.filename
                    ]
                );


            res.status(201).json({

                message:
                    "Nộp CV thành công.",

                application_id:
                    result.insertId

            });


        } catch (error) {

            console.error(
                "Lỗi nộp CV:",
                error
            );


            if (
                req.file &&
                fs.existsSync(
                    req.file.path
                )
            ) {

                fs.unlinkSync(
                    req.file.path
                );

            }


            res.status(500).json({
                message:
                    "Không thể nộp hồ sơ."
            });


        } finally {

            if (connection) {

                connection.release();

            }

        }

    }
);
// ==========================================
// XỬ LÝ LỖI UPLOAD
// ==========================================

app.use(
    (error, req, res, next) => {

        if (
            error instanceof
            multer.MulterError
        ) {

            if (
                error.code ===
                "LIMIT_FILE_SIZE"
            ) {

                return res
                    .status(400)
                    .json({
                        message:
                            "File CV không được vượt quá 5 MB."
                    });

            }

        }


        if (error) {

            return res
                .status(400)
                .json({
                    message:
                        error.message
                });

        }


        next();

    }
);
// ==========================================
// API HỒ SƠ ĐÃ ỨNG TUYỂN CỦA TÔI
// ==========================================

app.get(
    "/api/my-applications",
    requireLogin,
    async (req, res) => {

        let connection;

        try {

            const userId =
                req.session.user.id;


            connection =
                await db.getConnection();


            await connection.query(
                "SET NAMES utf8mb4"
            );


            const sql = `
                SELECT
                    applications.id,
                    applications.cv_file,
                    applications.status,
                    applications.created_at,

                    jobs.id AS job_id,
                    jobs.title,
                    jobs.location,
                    jobs.salary,

                    companies.name AS company_name

                FROM applications

                INNER JOIN jobs
                    ON applications.job_id = jobs.id

                INNER JOIN companies
                    ON jobs.company_id = companies.id

                WHERE applications.user_id = ?

                ORDER BY applications.created_at DESC
            `;


            const [rows] =
                await connection.query(
                    sql,
                    [userId]
                );


            res.json(rows);


        } catch (error) {

            console.error(
                "Lỗi lấy hồ sơ ứng tuyển:",
                error
            );


            res.status(500).json({
                message:
                    "Không thể lấy danh sách hồ sơ."
            });


        } finally {

            if (connection) {
                connection.release();
            }

        }

    }
);
// ==========================================
// API KIỂM TRA ADMIN
// ==========================================

app.get(
    "/api/admin/check",
    requireAdmin,
    (req, res) => {

        res.json({
            message:
                "Quyền Admin hợp lệ.",

            user:
                req.session.user
        });

    }
);
// ==================================================
// ADMIN - LẤY TOÀN BỘ TIN TUYỂN DỤNG
// ==================================================

app.get(
    "/api/admin/jobs",
    requireAdmin,
    async (req, res) => {

        try {

            const [rows] =
                await db.query(
                    `
                    SELECT
                        jobs.id,
                        jobs.title,
                        jobs.location,
                        jobs.salary,
                        jobs.description,
                        jobs.deadline,
                        jobs.status,
                        jobs.created_at,

                        companies.id AS company_id,
                        companies.name AS company_name,

                        categories.id AS category_id,
                        categories.name AS category_name

                    FROM jobs

                    INNER JOIN companies
                        ON jobs.company_id = companies.id

                    INNER JOIN categories
                        ON jobs.category_id = categories.id

                    ORDER BY jobs.id DESC
                    `
                );


            res.json(rows);

        } catch (error) {

            console.error(
                "Lỗi lấy danh sách tin Admin:",
                error
            );


            res.status(500).json({
                message:
                    "Không thể lấy danh sách tin tuyển dụng."
            });

        }

    }
);


// ==================================================
// ADMIN - LẤY CÔNG TY + DANH MỤC
// ==================================================

app.get(
    "/api/admin/job-options",
    requireAdmin,
    async (req, res) => {

        try {

            const [companies] =
                await db.query(
                    `
                    SELECT id, name
                    FROM companies
                    ORDER BY name
                    `
                );


            const [categories] =
                await db.query(
                    `
                    SELECT id, name
                    FROM categories
                    ORDER BY name
                    `
                );


            res.json({
                companies,
                categories
            });

        } catch (error) {

            console.error(
                "Lỗi lấy dữ liệu lựa chọn:",
                error
            );


            res.status(500).json({
                message:
                    "Không thể lấy dữ liệu công ty và danh mục."
            });

        }

    }
);


// ==================================================
// ADMIN - LẤY CHI TIẾT 1 TIN
// ==================================================

app.get(
    "/api/admin/jobs/:id",
    requireAdmin,
    async (req, res) => {

        try {

            const jobId =
                Number(req.params.id);


            if (!Number.isInteger(jobId)) {

                return res.status(400).json({
                    message:
                        "Mã tin tuyển dụng không hợp lệ."
                });

            }


            const [rows] =
                await db.query(
                    `
                    SELECT
                        id,
                        company_id,
                        category_id,
                        title,
                        location,
                        salary,
                        description,
                        deadline,
                        status

                    FROM jobs

                    WHERE id = ?
                    `,
                    [jobId]
                );


            if (rows.length === 0) {

                return res.status(404).json({
                    message:
                        "Không tìm thấy tin tuyển dụng."
                });

            }


            res.json(rows[0]);

        } catch (error) {

            console.error(
                "Lỗi lấy chi tiết tin Admin:",
                error
            );


            res.status(500).json({
                message:
                    "Không thể lấy thông tin tin tuyển dụng."
            });

        }

    }
);


// ==================================================
// ADMIN - THÊM TIN TUYỂN DỤNG
// ==================================================

app.post(
    "/api/admin/jobs",
    requireAdmin,
    async (req, res) => {

        try {

            const {
                title,
                company_id,
                category_id,
                location,
                salary,
                description,
                deadline
            } = req.body;


            if (
                !title ||
                !company_id ||
                !category_id ||
                !location ||
                !description ||
                !deadline
            ) {

                return res.status(400).json({
                    message:
                        "Vui lòng nhập đầy đủ thông tin bắt buộc."
                });

            }


            const [result] =
                await db.query(
                    `
                    INSERT INTO jobs
                    (
                        company_id,
                        category_id,
                        title,
                        location,
                        salary,
                        description,
                        deadline,
                        status
                    )

                    VALUES
                    (
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        ?,
                        'active'
                    )
                    `,
                    [
                        company_id,
                        category_id,
                        title.trim(),
                        location.trim(),
                        salary
                            ? salary.trim()
                            : null,
                        description.trim(),
                        deadline
                    ]
                );


            res.status(201).json({

                message:
                    "Thêm tin tuyển dụng thành công.",

                job_id:
                    result.insertId

            });

        } catch (error) {

            console.error(
                "Lỗi thêm tin:",
                error
            );


            res.status(500).json({
                message:
                    "Không thể thêm tin tuyển dụng."
            });

        }

    }
);


// ==================================================
// ADMIN - CẬP NHẬT TIN TUYỂN DỤNG
// ==================================================

app.put(
    "/api/admin/jobs/:id",
    requireAdmin,
    async (req, res) => {

        try {

            const jobId =
                Number(req.params.id);


            const {
                title,
                company_id,
                category_id,
                location,
                salary,
                description,
                deadline,
                status
            } = req.body;


            if (
                !Number.isInteger(jobId) ||
                !title ||
                !company_id ||
                !category_id ||
                !location ||
                !description ||
                !deadline ||
                !["active", "closed"].includes(status)
            ) {

                return res.status(400).json({
                    message:
                        "Thông tin cập nhật không hợp lệ."
                });

            }


            const [result] =
                await db.query(
                    `
                    UPDATE jobs

                    SET
                        company_id = ?,
                        category_id = ?,
                        title = ?,
                        location = ?,
                        salary = ?,
                        description = ?,
                        deadline = ?,
                        status = ?

                    WHERE id = ?
                    `,
                    [
                        company_id,
                        category_id,
                        title.trim(),
                        location.trim(),
                        salary
                            ? salary.trim()
                            : null,
                        description.trim(),
                        deadline,
                        status,
                        jobId
                    ]
                );


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message:
                        "Không tìm thấy tin tuyển dụng."
                });

            }


            res.json({
                message:
                    "Cập nhật tin tuyển dụng thành công."
            });

        } catch (error) {

            console.error(
                "Lỗi cập nhật tin:",
                error
            );


            res.status(500).json({
                message:
                    "Không thể cập nhật tin tuyển dụng."
            });

        }

    }
);


// ==================================================
// ADMIN - ĐÓNG / MỞ TIN
// ==================================================

app.patch(
    "/api/admin/jobs/:id/toggle",
    requireAdmin,
    async (req, res) => {

        try {

            const jobId =
                Number(req.params.id);


            const [rows] =
                await db.query(
                    `
                    SELECT status
                    FROM jobs
                    WHERE id = ?
                    `,
                    [jobId]
                );


            if (rows.length === 0) {

                return res.status(404).json({
                    message:
                        "Không tìm thấy tin tuyển dụng."
                });

            }


            const newStatus =
                rows[0].status === "active"
                    ? "closed"
                    : "active";


            await db.query(
                `
                UPDATE jobs
                SET status = ?
                WHERE id = ?
                `,
                [
                    newStatus,
                    jobId
                ]
            );


            res.json({

                message:
                    newStatus === "active"
                        ? "Đã mở lại tin tuyển dụng."
                        : "Đã đóng tin tuyển dụng.",

                status:
                    newStatus

            });

        } catch (error) {

            console.error(
                "Lỗi đổi trạng thái tin:",
                error
            );


            res.status(500).json({
                message:
                    "Không thể thay đổi trạng thái tin."
            });

        }

    }
);


// ==================================================
// ADMIN - XÓA TIN
// ==================================================

app.delete(
    "/api/admin/jobs/:id",
    requireAdmin,
    async (req, res) => {

        try {

            const jobId =
                Number(req.params.id);


            const [result] =
                await db.query(
                    `
                    DELETE FROM jobs
                    WHERE id = ?
                    `,
                    [jobId]
                );


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    message:
                        "Không tìm thấy tin tuyển dụng."
                });

            }


            res.json({
                message:
                    "Xóa tin tuyển dụng thành công."
            });

        } catch (error) {

            console.error(
                "Lỗi xóa tin:",
                error
            );


            res.status(500).json({
                message:
                    "Không thể xóa tin tuyển dụng."
            });

        }

    }
);
// ==================================================
// ADMIN - LẤY TOÀN BỘ HỒ SƠ ỨNG VIÊN
// ==================================================

app.get(
    "/api/admin/applications",
    requireAdmin,
    async (req, res) => {

        try {

            const [rows] =
                await db.query(
                    `
                    SELECT
                        applications.id,
                        applications.cv_file,
                        applications.status,
                        applications.created_at,

                        users.id AS user_id,
                        users.full_name,
                        users.email,

                        jobs.id AS job_id,
                        jobs.title AS job_title,

                        companies.name AS company_name

                    FROM applications

                    INNER JOIN users
                        ON applications.user_id = users.id

                    INNER JOIN jobs
                        ON applications.job_id = jobs.id

                    INNER JOIN companies
                        ON jobs.company_id = companies.id

                    ORDER BY applications.created_at DESC
                    `
                );


            res.json(rows);

        } catch (error) {

            console.error(
                "Lỗi lấy hồ sơ ứng viên:",
                error
            );


            res.status(500).json({
                message:
                    "Không thể lấy danh sách hồ sơ ứng viên."
            });

        }

    }
);
// ==================================================
// ADMIN - CẬP NHẬT TRẠNG THÁI HỒ SƠ
// ==================================================

app.patch(
    "/api/admin/applications/:id/status",
    requireAdmin,
    async (req, res) => {

        try {

            const applicationId =
                Number(req.params.id);


            const {
                status
            } = req.body;


            const allowedStatuses = [
                "pending",
                "viewed",
                "interview",
                "accepted",
                "rejected"
            ];


            if (
                !Number.isInteger(applicationId) ||
                !allowedStatuses.includes(status)
            ) {

                return res
                    .status(400)
                    .json({
                        message:
                            "Trạng thái hồ sơ không hợp lệ."
                    });

            }


            const [result] =
                await db.query(
                    `
                    UPDATE applications

                    SET status = ?

                    WHERE id = ?
                    `,
                    [
                        status,
                        applicationId
                    ]
                );


            if (
                result.affectedRows === 0
            ) {

                return res
                    .status(404)
                    .json({
                        message:
                            "Không tìm thấy hồ sơ ứng viên."
                    });

            }


            res.json({
                message:
                    "Cập nhật trạng thái hồ sơ thành công."
            });

        } catch (error) {

            console.error(
                "Lỗi cập nhật trạng thái hồ sơ:",
                error
            );


            res.status(500).json({
                message:
                    "Không thể cập nhật trạng thái hồ sơ."
            });

        }

    }
);
// ==================================================
// ADMIN - XEM CV ỨNG VIÊN
// ==================================================

app.get(
    "/api/admin/applications/:id/cv",
    requireAdmin,
    async (req, res) => {

        try {

            const applicationId =
                Number(req.params.id);


            if (
                !Number.isInteger(applicationId)
            ) {

                return res
                    .status(400)
                    .json({
                        message:
                            "Mã hồ sơ không hợp lệ."
                    });

            }


            const [rows] =
                await db.query(
                    `
                    SELECT cv_file
                    FROM applications
                    WHERE id = ?
                    `,
                    [applicationId]
                );


            if (
                rows.length === 0
            ) {

                return res
                    .status(404)
                    .json({
                        message:
                            "Không tìm thấy hồ sơ."
                    });

            }


            const filename =
                path.basename(
                    rows[0].cv_file
                );


            const filePath =
                path.join(
                    __dirname,
                    "../uploads",
                    filename
                );


            if (
                !fs.existsSync(filePath)
            ) {

                return res
                    .status(404)
                    .json({
                        message:
                            "Không tìm thấy file CV."
                    });

            }


const extension =
    path.extname(filename)
        .toLowerCase();


if (extension === ".pdf") {

    res.setHeader(
        "Content-Type",
        "application/pdf"
    );

    res.setHeader(
        "Content-Disposition",
        `inline; filename="${filename}"`
    );

    return res.sendFile(
        filePath
    );

}


// DOC / DOCX thì tải xuống
return res.download(
    filePath,
    filename
);
        } catch (error) {

            console.error(
                "Lỗi xem CV:",
                error
            );


            res.status(500).json({
                message:
                    "Không thể mở file CV."
            });

        }

    }
);
// ==================================================
// ADMIN - THỐNG KÊ DASHBOARD
// ==================================================

app.get(
    "/api/admin/stats",
    requireAdmin,
    async (req, res) => {

        try {

            // Tổng số tin tuyển dụng
            const [jobStats] =
                await db.query(
                    `
                    SELECT
                        COUNT(*) AS total_jobs,

                        SUM(
                            CASE
                                WHEN status = 'active'
                                THEN 1
                                ELSE 0
                            END
                        ) AS active_jobs

                    FROM jobs
                    `
                );


            // Thống kê hồ sơ ứng tuyển
            const [applicationStats] =
                await db.query(
                    `
                    SELECT
                        COUNT(*) AS total_applications,

                        SUM(
                            CASE
                                WHEN status = 'pending'
                                THEN 1
                                ELSE 0
                            END
                        ) AS pending_applications

                    FROM applications
                    `
                );


            // 5 hồ sơ mới nhất
            const [recentApplications] =
                await db.query(
                    `
                    SELECT
                        applications.id,
                        applications.status,
                        applications.created_at,

                        users.full_name,

                        jobs.title AS job_title,

                        companies.name AS company_name

                    FROM applications

                    INNER JOIN users
                        ON applications.user_id = users.id

                    INNER JOIN jobs
                        ON applications.job_id = jobs.id

                    INNER JOIN companies
                        ON jobs.company_id = companies.id

                    ORDER BY
                        applications.created_at DESC

                    LIMIT 5
                    `
                );


            res.json({

                stats: {

                    total_jobs:
                        Number(
                            jobStats[0].total_jobs || 0
                        ),

                    active_jobs:
                        Number(
                            jobStats[0].active_jobs || 0
                        ),

                    total_applications:
                        Number(
                            applicationStats[0]
                                .total_applications || 0
                        ),

                    pending_applications:
                        Number(
                            applicationStats[0]
                                .pending_applications || 0
                        )

                },

                recentApplications

            });


        } catch (error) {

            console.error(
                "Lỗi thống kê Dashboard:",
                error
            );


            res.status(500).json({
                message:
                    "Không thể tải thống kê Dashboard."
            });

        }

    }
);
// ==================================================
// QUÊN MẬT KHẨU
// ==================================================

app.post(
    "/api/forgot-password",
    async (req, res) => {

        try {

            const email =
                String(
                    req.body.email || ""
                )
                    .trim()
                    .toLowerCase();


            if (!email) {

                return res.status(400).json({
                    message:
                        "Vui lòng nhập email."
                });

            }


            // Xóa token đã hết hạn
            await db.query(
                `
                DELETE FROM password_reset_tokens
                WHERE expires_at <= NOW()
                `
            );


            // Tìm tài khoản theo email
            const [users] =
                await db.query(
                    `
                    SELECT
                        id,
                        full_name,
                        email

                    FROM users

                    WHERE LOWER(email) = ?

                    LIMIT 1
                    `,
                    [email]
                );


            /*
             * Không cho biết email có tồn tại hay không
             * để tránh dò tài khoản.
             */
            const safeMessage =
                "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi liên kết đặt lại mật khẩu.";


            if (users.length === 0) {

                return res.json({
                    message:
                        safeMessage
                });

            }


            const user =
                users[0];


            // Xóa token cũ của tài khoản
            await db.query(
                `
                DELETE FROM password_reset_tokens
                WHERE user_id = ?
                `,
                [user.id]
            );


            // Tạo token ngẫu nhiên
            const rawToken =
                crypto
                    .randomBytes(32)
                    .toString("hex");


            // Chỉ lưu hash của token vào DB
            const tokenHash =
                crypto
                    .createHash("sha256")
                    .update(rawToken)
                    .digest("hex");

const minutes =
    Number(
        process.env.RESET_TOKEN_MINUTES
        || 15
    );


await db.query(
    `
    INSERT INTO password_reset_tokens
    (
        user_id,
        token_hash,
        expires_at
    )

    VALUES
    (
        ?,
        ?,
        DATE_ADD(
            NOW(),
            INTERVAL ? MINUTE
        )
    )
    `,
    [
        user.id,
        tokenHash,
        minutes
    ]
);


            const baseUrl =
                process.env.APP_BASE_URL
                || "http://localhost:3000";


            const resetUrl =
                `${baseUrl}/reset-password.html?token=${encodeURIComponent(rawToken)}`;


            try {

                await sendPasswordResetEmail(
                    user.email,
                    resetUrl
                );

            } catch (mailError) {

                console.error(
                    "Lỗi gửi email:",
                    mailError
                );


                // Nếu gửi mail thất bại thì xóa token
                await db.query(
                    `
                    DELETE FROM password_reset_tokens
                    WHERE user_id = ?
                    `,
                    [user.id]
                );


                return res.status(500).json({
                    message:
                        "Không thể gửi email đặt lại mật khẩu."
                });

            }


            res.json({
                message:
                    safeMessage
            });


        } catch (error) {

            console.error(
                "Lỗi quên mật khẩu:",
                error
            );


            res.status(500).json({
                message:
                    "Có lỗi xảy ra. Vui lòng thử lại."
            });

        }

    }
);
// ==================================================
// ĐẶT LẠI MẬT KHẨU
// ==================================================

app.post(
    "/api/reset-password",
    async (req, res) => {

        let connection;

        try {

            const token =
                String(
                    req.body.token || ""
                ).trim();


            const newPassword =
                String(
                    req.body.new_password || ""
                );


            const confirmPassword =
                String(
                    req.body.confirm_password || ""
                );


            // ==========================================
            // KIỂM TRA DỮ LIỆU
            // ==========================================

            if (
                !token ||
                !newPassword ||
                !confirmPassword
            ) {

                return res
                    .status(400)
                    .json({
                        message:
                            "Vui lòng nhập đầy đủ thông tin."
                    });

            }


            if (
                newPassword.length < 8
            ) {

                return res
                    .status(400)
                    .json({
                        message:
                            "Mật khẩu mới phải có ít nhất 8 ký tự."
                    });

            }


            if (
                newPassword !==
                confirmPassword
            ) {

                return res
                    .status(400)
                    .json({
                        message:
                            "Xác nhận mật khẩu không khớp."
                    });

            }


            // ==========================================
            // HASH TOKEN
            // ==========================================

            const tokenHash =
                crypto
                    .createHash("sha256")
                    .update(token)
                    .digest("hex");


            connection =
                await db.getConnection();


            await connection
                .beginTransaction();


            // ==========================================
            // KIỂM TRA TOKEN CÒN HẠN
            // ==========================================

            const [tokens] =
                await connection.query(
                    `
                    SELECT
                        id,
                        user_id

                    FROM password_reset_tokens

                    WHERE
                        token_hash = ?
                        AND expires_at > NOW()

                    LIMIT 1

                    FOR UPDATE
                    `,
                    [tokenHash]
                );


            if (
                tokens.length === 0
            ) {

                await connection
                    .rollback();


                return res
                    .status(400)
                    .json({
                        message:
                            "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn."
                    });

            }


            const userId =
                tokens[0].user_id;


            // ==========================================
            // HASH MẬT KHẨU MỚI
            // ==========================================

            const passwordHash =
                await bcrypt.hash(
                    newPassword,
                    10
                );


            // ==========================================
            // CẬP NHẬT MẬT KHẨU
            // ==========================================

            await connection.query(
                `
                UPDATE users

                SET password = ?

                WHERE id = ?
                `,
                [
                    passwordHash,
                    userId
                ]
            );


            // ==========================================
            // XÓA TOKEN SAU KHI DÙNG
            // ==========================================

            await connection.query(
                `
                DELETE FROM password_reset_tokens

                WHERE user_id = ?
                `,
                [userId]
            );


            await connection
                .commit();


            res.json({
                message:
                    "Đặt lại mật khẩu thành công."
            });


        } catch (error) {

            if (connection) {

                try {

                    await connection
                        .rollback();

                } catch (
                    rollbackError
                ) {

                    console.error(
                        "Rollback lỗi:",
                        rollbackError
                    );

                }

            }


            console.error(
                "Lỗi đặt lại mật khẩu:",
                error
            );


            res.status(500).json({
                message:
                    "Không thể đặt lại mật khẩu."
            });


        } finally {

            if (connection) {

                connection.release();

            }

        }

    }
);

// ==========================================
// KIỂM TRA DATABASE
// ==========================================

async function checkDatabase() {

    try {

        const connection =
            await db.getConnection();

        await connection.query(
            "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        );

        console.log(
            "Kết nối MySQL thành công!"
        );

        connection.release();

    } catch (error) {

        console.error(
            "Kết nối MySQL thất bại:",
            error.message
        );

    }

}

// ==========================================
// KHỞI ĐỘNG SERVER
// ==========================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Job Board đang chạy tại http://localhost:${PORT}`
        );


        checkDatabase();

    }
);
