let allJobs = [];


// ==========================================
// HIỂN THỊ VIỆC LÀM
// ==========================================

function displayJobs(jobs) {

    const jobList =
        document.getElementById(
            "job-list"
        );


    jobList.innerHTML = "";


    if (jobs.length === 0) {

        jobList.innerHTML =
            "<p>Không tìm thấy việc làm.</p>";

        return;

    }


    jobs.forEach((job) => {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "job-card";


        card.innerHTML = `
<div class="job-status-badge">
    <span class="status-dot"></span>
    Đang tuyển
</div>

            <h3>
                ${job.title}
            </h3>

            <p>
                <strong>Công ty:</strong>
                ${job.company_name}
            </p>

            <p>
                <strong>Địa điểm:</strong>
                ${job.location}
            </p>

            <p>
                <strong>Mức lương:</strong>
                ${job.salary || "Thỏa thuận"}
            </p>

            <button
                onclick="viewJobDetail(${job.id})"
            >
                Xem chi tiết
            </button>

        `;


        jobList.appendChild(card);

    });

}


// ==========================================
// LẤY VIỆC LÀM TỪ EXPRESS
// ==========================================

async function loadJobs() {

    try {

        const response =
            await fetch("/api/jobs");


        if (!response.ok) {

            throw new Error(
                "API trả về lỗi."
            );

        }


        allJobs =
            await response.json();


        displayJobs(allJobs);


    } catch (error) {

        console.error(error);


        document
            .getElementById(
                "job-list"
            )
            .innerHTML =
                "<p>Không thể tải danh sách việc làm.</p>";

    }

}


// ==========================================
// TÌM KIẾM
// ==========================================

function searchJobs() {

    const keyword =
        document
            .getElementById(
                "search-input"
            )
            .value
            .toLowerCase()
            .trim();


    const filtered =
        allJobs.filter((job) => {

            return (
                job.title
                    .toLowerCase()
                    .includes(keyword)

                ||

                job.location
                    .toLowerCase()
                    .includes(keyword)

                ||

                job.company_name
                    .toLowerCase()
                    .includes(keyword)
            );

        });


    displayJobs(filtered);

}


// ==========================================
// XEM CHI TIẾT
// ==========================================

function viewJobDetail(id) {

    window.location.href =
        `/job-detail.html?id=${id}`;

}


// ==========================================
// KIỂM TRA ĐĂNG NHẬP
// ==========================================

async function checkLoginStatus() {

    const authMenu =
        document.getElementById(
            "auth-menu"
        );


    try {

        const response =
            await fetch(
                "/api/me"
            );


        const data =
            await response.json();


        // ============================
        // CHƯA ĐĂNG NHẬP
        // ============================

        if (!data.loggedIn) {

            authMenu.innerHTML = `

                <a href="/login.html">
                    Đăng nhập
                </a>

                <a href="/register.html">
                    Đăng ký
                </a>

            `;

            return;

        }


        // ============================
        // ADMIN
        // ============================

        if (
            data.user.role === "admin"
        ) {

            authMenu.innerHTML = `

                <a href="/admin.html">
                    ⚙️ Trang quản trị
                </a>

                <span class="user-name">
                    👋 Xin chào, ${data.user.full_name}
                </span>

                <button
                    id="logout-button"
                    class="logout-button"
                >
                    Đăng xuất
                </button>

            `;

        }

        // ============================
        // CANDIDATE
        // ============================

        else {

            authMenu.innerHTML = `

                <a href="/my-applications.html">
                    📄 Hồ sơ của tôi
                </a>

                <span class="user-name">
                    👋 Xin chào, ${data.user.full_name}
                </span>

                <button
                    id="logout-button"
                    class="logout-button"
                >
                    Đăng xuất
                </button>

            `;

        }


        // ============================
        // NÚT ĐĂNG XUẤT
        // ============================

        const logoutButton =
            document.getElementById(
                "logout-button"
            );


        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                async () => {

                    await fetch(
                        "/api/logout",
                        {
                            method:
                                "POST"
                        }
                    );


                    window.location.href =
                        "/";

                }
            );

        }


    } catch (error) {

        console.error(
            "Lỗi kiểm tra đăng nhập:",
            error
        );

    }

}

// ==========================================
// ĐĂNG XUẤT
// ==========================================

async function logout() {

    try {

        const response =
            await fetch(
                "/api/logout",
                {
                    method: "POST"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Đăng xuất thất bại."
            );

            return;

        }


        window.location.href =
            "/";


    } catch (error) {

        console.error(
            "Lỗi đăng xuất:",
            error
        );


        alert(
            "Không thể kết nối tới máy chủ."
        );

    }

}


// ==========================================
// SỰ KIỆN TÌM KIẾM
// ==========================================

document
    .getElementById(
        "search-button"
    )
    .addEventListener(
        "click",
        searchJobs
    );


document
    .getElementById(
        "search-input"
    )
    .addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {

                searchJobs();

            }

        }
    );


// ==========================================
// KHỞI ĐỘNG
// ==========================================

loadJobs();

checkLoginStatus();
