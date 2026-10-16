const jobsList =
    document.getElementById(
        "admin-jobs-list"
    );


function formatDate(value) {

    if (!value) {
        return "Không giới hạn";
    }


    return new Date(value)
        .toLocaleDateString(
            "vi-VN"
        );

}


// ==========================================
// TẢI DANH SÁCH TIN
// ==========================================

async function loadAdminJobs() {

    try {

        const response =
            await fetch(
                "/api/admin/jobs"
            );


        if (response.status === 401) {

            window.location.href =
                "/login.html";

            return;

        }


        if (response.status === 403) {

            alert(
                "Bạn không có quyền Admin."
            );

            window.location.href =
                "/";

            return;

        }


        if (!response.ok) {

            throw new Error(
                "Không thể tải danh sách tin."
            );

        }


        const jobs =
            await response.json();


        jobsList.innerHTML =
            "";


        if (jobs.length === 0) {

            jobsList.innerHTML = `
                <p>
                    Chưa có tin tuyển dụng.
                </p>
            `;

            return;

        }


        jobs.forEach((job) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "admin-job-card";


            const statusText =
                job.status === "active"
                    ? "Đang tuyển"
                    : "Đã đóng";


            const toggleText =
                job.status === "active"
                    ? "Đóng tin"
                    : "Mở tin";


            card.innerHTML = `

                <h3>
                    ${job.title}
                </h3>

                <p>
                    <strong>Công ty:</strong>
                    ${job.company_name}
                </p>

                <p>
                    <strong>Danh mục:</strong>
                    ${job.category_name}
                </p>

                <p>
                    <strong>Địa điểm:</strong>
                    ${job.location}
                </p>

                <p>
                    <strong>Mức lương:</strong>
                    ${job.salary || "Thỏa thuận"}
                </p>

                <p>
                    <strong>Hạn nộp:</strong>
                    ${formatDate(job.deadline)}
                </p>

                <p>
                    <strong>Trạng thái:</strong>
                    ${statusText}
                </p>


                <div class="admin-job-actions">

                    <button
                        onclick="editJob(${job.id})"
                    >
                        Sửa
                    </button>

                    <button
                        onclick="toggleJob(${job.id})"
                    >
                        ${toggleText}
                    </button>

                    <button
                        class="delete-button"
                        onclick="deleteJob(${job.id})"
                    >
                        Xóa
                    </button>

                </div>

            `;


            jobsList.appendChild(
                card
            );

        });


    } catch (error) {

        console.error(error);


        jobsList.innerHTML = `
            <p>
                Không thể tải danh sách tin.
            </p>
        `;

    }

}


// ==========================================
// THÊM TIN
// ==========================================

document
    .getElementById(
        "add-job-button"
    )
    .addEventListener(
        "click",
        () => {

            window.location.href =
                "/admin-add-job.html";

        }
    );


// ==========================================
// SỬA
// ==========================================

function editJob(id) {

    window.location.href =
        `/admin-edit-job.html?id=${id}`;

}


// ==========================================
// ĐÓNG / MỞ
// ==========================================

async function toggleJob(id) {

    if (
        !confirm(
            "Bạn có chắc muốn thay đổi trạng thái tin này?"
        )
    ) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/admin/jobs/${id}/toggle`,
                {
                    method: "PATCH"
                }
            );


        const data =
            await response.json();


        alert(
            data.message
        );


        if (response.ok) {

            loadAdminJobs();

        }


    } catch (error) {

        alert(
            "Không thể kết nối tới máy chủ."
        );

    }

}


// ==========================================
// XÓA
// ==========================================

async function deleteJob(id) {

    if (
        !confirm(
            "Bạn có chắc muốn xóa tin này? Hồ sơ ứng tuyển liên quan cũng có thể bị xóa."
        )
    ) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/admin/jobs/${id}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        alert(
            data.message
        );


        if (response.ok) {

            loadAdminJobs();

        }


    } catch (error) {

        alert(
            "Không thể kết nối tới máy chủ."
        );

    }

}


// ==========================================
// KHỞI ĐỘNG
// ==========================================

loadAdminJobs();
