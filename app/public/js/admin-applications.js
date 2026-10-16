const applicationsList =
    document.getElementById(
        "admin-applications-list"
    );


// ==========================================
// TÊN TRẠNG THÁI
// ==========================================

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


// ==========================================
// ĐỊNH DẠNG NGÀY
// ==========================================

function formatDate(value) {

    if (!value) {
        return "";
    }


    return new Date(value)
        .toLocaleDateString(
            "vi-VN"
        );

}


// ==========================================
// TẢI DANH SÁCH HỒ SƠ
// ==========================================

async function loadApplications() {

    try {

        const response =
            await fetch(
                "/api/admin/applications"
            );


        if (
            response.status === 401
        ) {

            window.location.href =
                "/login.html";

            return;

        }


        if (
            response.status === 403
        ) {

            alert(
                "Bạn không có quyền Admin."
            );

            window.location.href =
                "/";

            return;

        }


        if (!response.ok) {

            throw new Error(
                "Không thể tải hồ sơ."
            );

        }


        const applications =
            await response.json();


        applicationsList.innerHTML =
            "";


        if (
            applications.length === 0
        ) {

            applicationsList.innerHTML = `

                <div class="application-card">

                    <p>
                        Chưa có hồ sơ ứng tuyển.
                    </p>

                </div>

            `;

            return;

        }


        applications.forEach(
            (application) => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "admin-application-card";

const fileName =
    application.cv_file || "";

const extension =
    fileName
        .split(".")
        .pop()
        .toLowerCase();

const isPdf =
    extension === "pdf";

const cvButtonText =
    isPdf
        ? "👁️ Xem CV"
        : "⬇️ Tải CV";

const cvTarget =
    isPdf
        ? 'target="_blank"'
        : "";
                card.innerHTML = `

                    <h3>
                        ${application.full_name}
                    </h3>


                    <p>
                        <strong>Email:</strong>
                        ${application.email}
                    </p>


                    <p>
                        <strong>Ứng tuyển:</strong>
                        ${application.job_title}
                    </p>


                    <p>
                        <strong>Công ty:</strong>
                        ${application.company_name}
                    </p>


                    <p>
                        <strong>Ngày nộp:</strong>
                        ${formatDate(
                            application.created_at
                        )}
                    </p>


                    <p>
                        <strong>
                            Trạng thái hiện tại:
                        </strong>

                        <span
                            class="application-status"
                        >
                            ${getStatusText(
                                application.status
                            )}
                        </span>
                    </p>


                    <div
                        class="admin-application-actions"
                    >

<a
    class="cv-button"
    href="/api/admin/applications/${application.id}/cv"
    ${cvTarget}
>
    ${cvButtonText}
</a>

                        <select
                            id="status-${application.id}"
                        >

                            <option
                                value="pending"
                                ${
                                    application.status === "pending"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Đang chờ xử lý
                            </option>


                            <option
                                value="viewed"
                                ${
                                    application.status === "viewed"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Đã xem hồ sơ
                            </option>


                            <option
                                value="interview"
                                ${
                                    application.status === "interview"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Mời phỏng vấn
                            </option>


                            <option
                                value="accepted"
                                ${
                                    application.status === "accepted"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Đã tuyển
                            </option>


                            <option
                                value="rejected"
                                ${
                                    application.status === "rejected"
                                        ? "selected"
                                        : ""
                                }
                            >
                                Không phù hợp
                            </option>

                        </select>


                        <button
                            onclick="
                                updateApplicationStatus(
                                    ${application.id}
                                )
                            "
                        >
                            Cập nhật
                        </button>

                    </div>

                `;


                applicationsList
                    .appendChild(
                        card
                    );

            }
        );


    } catch (error) {

        console.error(error);


        applicationsList.innerHTML = `

            <p>
                Không thể tải danh sách hồ sơ.
            </p>

        `;

    }

}


// ==========================================
// CẬP NHẬT TRẠNG THÁI
// ==========================================

async function updateApplicationStatus(id) {

    const select =
        document.getElementById(
            `status-${id}`
        );


    const status =
        select.value;


    try {

        const response =
            await fetch(
                `/api/admin/applications/${id}/status`,
                {

                    method:
                        "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            status
                        })

                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Cập nhật thất bại."
            );

            return;

        }


        alert(
            data.message
        );


        loadApplications();


    } catch (error) {

        console.error(error);


        alert(
            "Không thể kết nối tới máy chủ."
        );

    }

}


// ==========================================
// KHỞI ĐỘNG
// ==========================================

loadApplications();
