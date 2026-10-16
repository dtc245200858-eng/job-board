const jobDetail =
    document.getElementById(
        "job-detail"
    );


const params =
    new URLSearchParams(
        window.location.search
    );


const jobId =
    params.get("id");


// ==========================================
// KIỂM TRA ID
// ==========================================

if (!jobId) {

    jobDetail.innerHTML = `

        <p>
            Không tìm thấy mã việc làm.
        </p>

    `;

}


// ==========================================
// ĐỊNH DẠNG NGÀY
// ==========================================

function formatDate(dateValue) {

    if (!dateValue) {

        return "Không giới hạn";

    }


    const date =
        new Date(dateValue);


    return date
        .toLocaleDateString(
            "vi-VN"
        );

}


// ==========================================
// LẤY CHI TIẾT VIỆC LÀM
// ==========================================

async function loadJobDetail() {

    if (!jobId) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/jobs/${jobId}`
            );


        if (response.status === 404) {

            jobDetail.innerHTML = `

                <p>
                    Việc làm không tồn tại.
                </p>

            `;

            return;

        }


        if (!response.ok) {

            throw new Error(
                "Không thể lấy dữ liệu."
            );

        }


        const job =
            await response.json();


        const statusText =
            job.status === "active"
                ? "Đang tuyển"
                : "Đã đóng";


        jobDetail.innerHTML = `

            <article class="job-detail-card">

                <h2>
                    ${job.title}
                </h2>


                <div class="job-summary">

                    <p>
                        <strong>
                            Công ty:
                        </strong>

                        ${job.company_name}
                    </p>


                    <p>
                        <strong>
                            Danh mục:
                        </strong>

                        ${job.category_name}
                    </p>


                    <p>
                        <strong>
                            Địa điểm:
                        </strong>

                        ${job.location}
                    </p>


                    <p>
                        <strong>
                            Mức lương:
                        </strong>

                        ${job.salary || "Thỏa thuận"}
                    </p>


                    <p>
                        <strong>
                            Hạn nộp hồ sơ:
                        </strong>

                        ${formatDate(job.deadline)}
                    </p>


                    <p>
                        <strong>
                            Trạng thái:
                        </strong>

                        ${statusText}
                    </p>

                </div>


                <section class="job-detail-section">

                    <h3>
                        Mô tả công việc
                    </h3>

                    <p>
                        ${job.description}
                    </p>

                </section>


                <section class="job-detail-section">

                    <h3>
                        Thông tin công ty
                    </h3>

                    <p>
                        ${job.company_description || "Chưa cập nhật"}
                    </p>

                    <p>
                        <strong>
                            Địa chỉ công ty:
                        </strong>

                        ${job.company_address || "Chưa cập nhật"}
                    </p>

                </section>


                <button
                    class="apply-button"
                    onclick="applyJob(${job.id})"
                >
                    Nộp CV ngay
                </button>

            </article>

        `;


    } catch (error) {

        console.error(
            "Lỗi:",
            error
        );


        jobDetail.innerHTML = `

            <p>
                Không thể tải thông tin việc làm.
            </p>

        `;

    }

}


// ==========================================
// NÚT NỘP CV
// ==========================================

function applyJob(id) {

    window.location.href =
        `/apply.html?id=${id}`;

}

// ==========================================
// KHỞI ĐỘNG
// ==========================================

loadJobDetail();
