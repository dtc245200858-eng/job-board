SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
USE job_board;

ALTER DATABASE job_board
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- ==================================================
-- BẢNG NGƯỜI DÙNG
-- ==================================================

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,

    full_name VARCHAR(100) NOT NULL,

    email VARCHAR(150) NOT NULL UNIQUE,

    password VARCHAR(255) NOT NULL,

    role ENUM(
        'candidate',
        'admin'
    ) NOT NULL DEFAULT 'candidate',

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
);


-- ==================================================
-- BẢNG CÔNG TY
-- ==================================================

CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    description TEXT,

    address VARCHAR(255),

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP
);


-- ==================================================
-- BẢNG DANH MỤC
-- ==================================================

CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL UNIQUE
);


-- ==================================================
-- BẢNG TIN TUYỂN DỤNG
-- ==================================================

CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,

    company_id INT NOT NULL,

    category_id INT NOT NULL,

    title VARCHAR(200) NOT NULL,

    location VARCHAR(150) NOT NULL,

    salary VARCHAR(100),

    description TEXT NOT NULL,

    deadline DATE,

    status ENUM(
        'active',
        'closed'
    ) NOT NULL DEFAULT 'active',

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_jobs_company
        FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_jobs_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON DELETE CASCADE
);


-- ==================================================
-- BẢNG HỒ SƠ ỨNG TUYỂN
-- ==================================================

CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT NOT NULL,

    job_id INT NOT NULL,

    cv_file VARCHAR(255) NOT NULL,

    status ENUM(
        'pending',
        'viewed',
        'interview',
        'accepted',
        'rejected'
    ) NOT NULL DEFAULT 'pending',

    created_at TIMESTAMP
        DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_applications_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_applications_job
        FOREIGN KEY (job_id)
        REFERENCES jobs(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_user_job
        UNIQUE (user_id, job_id)
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash CHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_password_reset_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    INDEX idx_password_reset_user (user_id),
    INDEX idx_password_reset_expires (expires_at)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;
-- ==================================================
-- DỮ LIỆU MẪU - DANH MỤC
-- ==================================================

INSERT INTO categories (name)
VALUES
    ('Lập trình'),
    ('Thiết kế'),
    ('Công nghệ thông tin');


-- ==================================================
-- DỮ LIỆU MẪU - CÔNG TY
-- ==================================================

INSERT INTO companies (
    name,
    description,
    address
)
VALUES

(
    'Công ty ABC',
    'Công ty phát triển phần mềm và giải pháp công nghệ.',
    'Hà Nội'
),

(
    'Công ty XYZ',
    'Công ty thiết kế website và trải nghiệm người dùng.',
    'Hà Nội'
),

(
    'Công ty Technology',
    'Doanh nghiệp chuyên phát triển các hệ thống công nghệ.',
    'TP. Hồ Chí Minh'
);


-- ==================================================
-- DỮ LIỆU MẪU - VIỆC LÀM
-- ==================================================

INSERT INTO jobs (
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
    1,
    1,
    'Lập trình viên Node.js',
    'Hà Nội',
    '12 - 18 triệu',
    'Phát triển ứng dụng web bằng Node.js và Express.',
    '2026-12-31',
    'active'
),

(
    2,
    2,
    'Nhân viên thiết kế Website',
    'Hà Nội',
    '10 - 15 triệu',
    'Thiết kế giao diện website và trải nghiệm người dùng.',
    '2026-12-31',
    'active'
),

(
    3,
    3,
    'Lập trình viên Backend',
    'TP. Hồ Chí Minh',
    '15 - 25 triệu',
    'Phát triển hệ thống Backend cho ứng dụng web.',
    '2026-12-31',
    'active'
);
