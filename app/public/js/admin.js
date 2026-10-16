const adminUser =
    document.getElementById(
        "admin-user"
    );


const adminContent =
    document.getElementById(
        "admin-content"
    );


const recentApplications =
    document.getElementById(
        "recent-applications"
    );


// ==================================================
// TÊN TRẠNG THÁI
// ==================================================

function getStatusText(status) {

    const statuses = {

        pending:
            "Đang chờ xử lý",

        viewed:
            "Đã xem hồ sơ",

        interview:
            "Mời phỏng vấn",

        accepted:
            "Đã tuyển",

        rejected:
            "Không phù hợp"

    };


    return statuses[status] || status;
}


// ==================================================
// CLASS MÀU TRẠNG THÁI
// ==================================================

function getStatusClass(status) {

    const classes = {

        pending:
            "dashboard-status-pending",

        viewed:
            "dashboard-status-viewed",

        interview:
            "dashboard-status-interview",

        accepted:
            "dashboard-status-accepted",

        rejected:
            "dashboard-status-rejected"

    };


    return classes[status] ||
        "dashboard-status-pending";
}


// ==================================================
// ĐỊNH DẠNG NGÀY
// ==================================================

function formatDate(value) {

    if (!value) {

        return "";

    }


    return new Date(value)
        .toLocaleDateString(
            "vi-VN"
        );

}


// ==================================================
// HIỂN THỊ HỒ SƠ GẦN ĐÂY
// ==================================================

function displayRecentApplications(
    applications
) {

    recentApplications.innerHTML =
        "";


    if (
        applications.length === 0
    ) {

        recentApplications.innerHTML = `

            <div class="empty-dashboard">

                <div>
                    📭
                </div>

                <p>
                    Chưa có hồ sơ ứng tuyển.
                </p>

            </div>

        `;

        return;

    }


    applications.forEach(
        (application) => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "recent-application-item";


            item.innerHTML = `

                <div
                    class="candidate-avatar"
                >
                    👤
                </div>


                <div
                    class="recent-application-info"
                >

                    <strong>
                        ${application.full_name}
                    </strong>

                    <p>
                        ${application.job_title}
                    </p>

                    <small>
                        🏢 ${application.company_name}
                    </small>

                </div>


                <div
                    class="recent-application-meta"
                >

                    <span
                        class="
                            dashboard-status
                            ${getStatusClass(
                                application.status
                            )}
                        "
                    >
                        ${getStatusText(
                            application.status
                        )}
                    </span>

                    <small>
                        ${formatDate(
                            application.created_at
                        )}
                    </small>

                </div>

            `;


            recentApplications
                .appendChild(
                    item
                );

        }
    );

}


// ==================================================
// KIỂM TRA ADMIN + LOAD DASHBOARD
// ==================================================

async function loadDashboard() {

    try {

        // ------------------------------------------
        // KIỂM TRA QUYỀN ADMIN
        // ------------------------------------------

        const checkResponse =
            await fetch(
                "/api/admin/check"
            );


        if (
            checkResponse.status === 401
        ) {

            window.location.href =
                "/login.html";

            return;

        }


        if (
            checkResponse.status === 403
        ) {

            alert(
                "Bạn không có quyền truy cập trang quản trị."
            );


            window.location.href =
                "/";

            return;

        }


        if (!checkResponse.ok) {

            throw new Error(
                "Không thể kiểm tra quyền Admin."
            );

        }


        const checkData =
            await checkResponse.json();


        adminUser.textContent =
            `👋 Xin chào, ${checkData.user.full_name}`;


        // ------------------------------------------
        // LẤY DỮ LIỆU THỐNG KÊ
        // ------------------------------------------

        const statsResponse =
            await fetch(
                "/api/admin/stats"
            );


        if (!statsResponse.ok) {

            throw new Error(
                "Không thể tải dữ liệu Dashboard."
            );

        }


        const data =
            await statsResponse.json();


        // ------------------------------------------
        // ĐỔ SỐ LIỆU THẬT VÀO DASHBOARD
        // ------------------------------------------

        document
            .getElementById(
                "total-jobs"
            )
            .textContent =
                data.stats.total_jobs;


        document
            .getElementById(
                "active-jobs"
            )
            .textContent =
                data.stats.active_jobs;


        document
            .getElementById(
                "total-applications"
            )
            .textContent =
                data.stats.total_applications;


        document
            .getElementById(
                "pending-applications"
            )
            .textContent =
                data.stats.pending_applications;


        // ------------------------------------------
        // HỒ SƠ MỚI
        // ------------------------------------------

        displayRecentApplications(
            data.recentApplications
        );


        // ------------------------------------------
        // HIỆN DASHBOARD
        // ------------------------------------------

        adminContent.style.display =
            "block";


    } catch (error) {

        console.error(error);


        adminUser.textContent =
            "Không thể tải Dashboard.";

    }

}


// ==================================================
// KHỞI ĐỘNG
// ==================================================

loadDashboard();
