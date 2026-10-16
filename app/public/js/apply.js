const params =
    new URLSearchParams(
        window.location.search
    );


const jobId =
    params.get("id");


const jobName =
    document.getElementById(
        "job-name"
    );


const form =
    document.getElementById(
        "application-form"
    );


const message =
    document.getElementById(
        "application-message"
    );


const backLink =
    document.getElementById(
        "back-job-link"
    );


// ==========================================
// KIỂM TRA ĐĂNG NHẬP
// ==========================================

async function checkLogin() {

    const response =
        await fetch(
            "/api/me"
        );


    if (!response.ok) {

        alert(
            "Bạn cần đăng nhập trước khi nộp CV."
        );


        window.location.href =
            "/login.html";

        return false;

    }


    return true;
}


// ==========================================
// LẤY THÔNG TIN VIỆC LÀM
// ==========================================

async function loadJob() {

    if (!jobId) {

        jobName.textContent =
            "Không tìm thấy công việc.";

        form.style.display =
            "none";

        return;

    }


    backLink.href =
        `/job-detail.html?id=${jobId}`;


    try {

        const response =
            await fetch(
                `/api/jobs/${jobId}`
            );


        if (!response.ok) {

            throw new Error(
                "Không tìm thấy công việc."
            );

        }


        const job =
            await response.json();


        jobName.innerHTML = `
            <strong>Ứng tuyển:</strong>
            ${job.title}
        `;


    } catch (error) {

        jobName.textContent =
            "Không thể tải thông tin công việc.";

        form.style.display =
            "none";

    }

}


// ==========================================
// NỘP CV
// ==========================================

form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const cvInput =
            document.getElementById(
                "cv"
            );


        if (
            cvInput.files.length === 0
        ) {

            message.textContent =
                "Vui lòng chọn file CV.";

            return;

        }


        const file =
            cvInput.files[0];


        if (
            file.size >
            5 * 1024 * 1024
        ) {

            message.textContent =
                "File CV không được vượt quá 5 MB.";

            return;

        }


        const formData =
            new FormData();


        formData.append(
            "job_id",
            jobId
        );


        formData.append(
            "cv",
            file
        );


        try {

            const response =
                await fetch(
                    "/api/applications",
                    {

                        method:
                            "POST",

                        body:
                            formData

                    }
                );


            const data =
                await response.json();


            if (response.status === 401) {

                window.location.href =
                    "/login.html";

                return;

            }


            if (!response.ok) {

                message.textContent =
                    data.message ||
                    "Nộp CV thất bại.";

                return;

            }


            message.textContent =
                "Nộp CV thành công!";


            form.reset();


        } catch (error) {

            console.error(error);


            message.textContent =
                "Không thể kết nối tới máy chủ.";

        }

    }
);


// ==========================================
// KHỞI ĐỘNG
// ==========================================

async function start() {

    const loggedIn =
        await checkLogin();


    if (!loggedIn) {
        return;
    }


    loadJob();

}


start();
