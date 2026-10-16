const params =
    new URLSearchParams(
        window.location.search
    );


const jobId =
    params.get("id");


const form =
    document.getElementById(
        "edit-job-form"
    );


const message =
    document.getElementById(
        "job-message"
    );


async function loadData() {

    if (!jobId) {

        window.location.href =
            "/admin-jobs.html";

        return;

    }


    const optionsResponse =
        await fetch(
            "/api/admin/job-options"
        );


    if (!optionsResponse.ok) {

        window.location.href =
            "/";

        return;

    }


    const options =
        await optionsResponse.json();


    const company =
        document.getElementById(
            "company"
        );


    const category =
        document.getElementById(
            "category"
        );


    options.companies.forEach(
        (item) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                item.id;

            option.textContent =
                item.name;


            company.appendChild(
                option
            );

        }
    );


    options.categories.forEach(
        (item) => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                item.id;

            option.textContent =
                item.name;


            category.appendChild(
                option
            );

        }
    );


    const response =
        await fetch(
            `/api/admin/jobs/${jobId}`
        );


    if (!response.ok) {

        message.textContent =
            "Không thể tải tin.";

        return;

    }


    const job =
        await response.json();


    document.getElementById("title").value =
        job.title;

    company.value =
        job.company_id;

    category.value =
        job.category_id;

    document.getElementById("location").value =
        job.location;

    document.getElementById("salary").value =
        job.salary || "";

    document.getElementById("description").value =
        job.description;

    document.getElementById("status").value =
        job.status;


    if (job.deadline) {

        document
            .getElementById("deadline")
            .value =
                String(job.deadline)
                    .substring(
                        0,
                        10
                    );

    }

}


form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const body = {

            title:
                document.getElementById("title").value,

            company_id:
                company.value,

            category_id:
                category.value,

            location:
                document.getElementById("location").value,

            salary:
                document.getElementById("salary").value,

            deadline:
                document.getElementById("deadline").value,

            status:
                document.getElementById("status").value,

            description:
                document.getElementById("description").value

        };


        const response =
            await fetch(
                `/api/admin/jobs/${jobId}`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(body)

                }
            );


        const data =
            await response.json();


        message.textContent =
            data.message;


        if (response.ok) {

            setTimeout(
                () => {

                    window.location.href =
                        "/admin-jobs.html";

                },
                800
            );

        }

    }
);


loadData();
