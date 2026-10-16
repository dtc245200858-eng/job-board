const applicationsList =
    document.getElementById(
        "applications-list"
    );


// ==========================================
// HIỂN THỊ TRẠNG THÁI TIẾNG VIỆT
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
// TẢI HỒ SƠ CỦA NGƯỜI DÙNG
// ==========================================

async function loadApplications() {

    try {

        const response =
            await fetch(
                "/api/my-applications"
            );


        if (response.status === 401) {

            alert(
                "Bạn cần đăng nhập để xem hồ sơ."
            );

            window.location.href =
                "/login.html";

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
                        Bạn chưa ứng tuyển công việc nào.
                    </p>

                    <a href="/#jobs">
                        Xem việc làm
                    </a>

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
                    "application-card";


                const date =
                    new Date(
                        application.created_at
                    )
                    .toLocaleDateString(
                        "vi-VN"
                    );


                card.innerHTML = `

                    <h3>
                        ${application.title}
                    </h3>


                    <p>
                        <strong>Công ty:</strong>
                        ${application.company_name}
                    </p>


                    <p>
                        <strong>Địa điểm:</strong>
                        ${application.location}
                    </p>


                    <p>
                        <strong>Mức lương:</strong>
                        ${
                            application.salary ||
                            "Thỏa thuận"
                        }
                    </p>


                    <p>
                        <strong>Ngày nộp:</strong>
                        ${date}
                    </p>


                    <p>
                        <strong>Trạng thái:</strong>

                        <span class="application-status">
                            ${
                                getStatusText(
                                    application.status
                                )
                            }
                        </span>
                    </p>


                    <a
                        href="/job-detail.html?id=${application.job_id}"
                    >
                        Xem lại việc làm
                    </a>

                `;


                applicationsList
                    .appendChild(card);

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
// KHỞI ĐỘNG
// ==========================================

loadApplications();
