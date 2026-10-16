const form =
    document.getElementById(
        "add-job-form"
    );


const message =
    document.getElementById(
        "job-message"
    );


async function loadOptions() {

    const response =
        await fetch(
            "/api/admin/job-options"
        );


    if (response.status === 401) {

        window.location.href =
            "/login.html";

        return;

    }


    if (response.status === 403) {

        window.location.href =
            "/";

        return;

    }


    const data =
        await response.json();


    const company =
        document.getElementById(
            "company"
        );


    const category =
        document.getElementById(
            "category"
        );


    data.companies.forEach(
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


    data.categories.forEach(
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

}


form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const body = {

            title:
                document
                    .getElementById("title")
                    .value,

            company_id:
                document
                    .getElementById("company")
                    .value,

            category_id:
                document
                    .getElementById("category")
                    .value,

            location:
                document
                    .getElementById("location")
                    .value,

            salary:
                document
                    .getElementById("salary")
                    .value,

            deadline:
                document
                    .getElementById("deadline")
                    .value,

            description:
                document
                    .getElementById("description")
                    .value

        };


        const response =
            await fetch(
                "/api/admin/jobs",
                {

                    method: "POST",

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


loadOptions();
