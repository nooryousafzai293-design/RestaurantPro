const SETTINGS_KEY = "restaurantpro_settings";

document.addEventListener("DOMContentLoaded", function () {
setupLogo();
    loadSettings();

    setupRestaurantForm();

    setupSystemForm();

    setupClearData();

});


function getSettings() {

    const saved =
        localStorage.getItem(SETTINGS_KEY);

    if (!saved) {

        return {

            restaurantName: "RestaurantPro",

            restaurantPhone: "",

            restaurantAddress: "",

            currency: "PKR",

            taxRate: 0,

            orderPrefix: "ORD-",

            tableCount: 20

        };

    }

    try {

        return JSON.parse(saved);

    } catch (error) {

        console.error(
            "Could not read settings:",
            error
        );

        return {};

    }

}


function saveSettings(settings) {

    localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settings)
    );

}


function loadSettings() {

    const settings =
        getSettings();


    const restaurantName =
        document.getElementById(
            "restaurantName"
        );

    const restaurantPhone =
        document.getElementById(
            "restaurantPhone"
        );

    const restaurantAddress =
        document.getElementById(
            "restaurantAddress"
        );

    const currency =
        document.getElementById(
            "currency"
        );

    const taxRate =
        document.getElementById(
            "taxRate"
        );

    const orderPrefix =
        document.getElementById(
            "orderPrefix"
        );

    const tableCount =
        document.getElementById(
            "tableCount"
        );


    if (restaurantName) {

        restaurantName.value =
            settings.restaurantName ||
            "RestaurantPro";

    }


    if (restaurantPhone) {

        restaurantPhone.value =
            settings.restaurantPhone || "";

    }


    if (restaurantAddress) {

        restaurantAddress.value =
            settings.restaurantAddress || "";

    }


    if (currency) {

        currency.value =
            settings.currency || "PKR";

    }


    if (taxRate) {

        taxRate.value =
            settings.taxRate ?? 0;

    }


    if (orderPrefix) {

        orderPrefix.value =
            settings.orderPrefix ||
            "ORD-";

    }


    if (tableCount) {

        tableCount.value =
            settings.tableCount || 20;

    }

}


function setupRestaurantForm() {

    const form =
        document.getElementById(
            "restaurantSettingsForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const settings =
                getSettings();


            settings.restaurantName =
                document
                    .getElementById(
                        "restaurantName"
                    )
                    .value
                    .trim();


            settings.restaurantPhone =
                document
                    .getElementById(
                        "restaurantPhone"
                    )
                    .value
                    .trim();


            settings.restaurantAddress =
                document
                    .getElementById(
                        "restaurantAddress"
                    )
                    .value
                    .trim();


            if (!settings.restaurantName) {

                alert(
                    "Please enter restaurant name."
                );

                return;

            }


            saveSettings(settings);


            alert(
                "Restaurant information saved successfully."
            );

        }
    );

}


function setupSystemForm() {

    const form =
        document.getElementById(
            "systemSettingsForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const settings =
                getSettings();


            const tax =
                Number(
                    document
                        .getElementById(
                            "taxRate"
                        )
                        .value
                );


            const tables =
                Number(
                    document
                        .getElementById(
                            "tableCount"
                        )
                        .value
                );


            if (
                !Number.isFinite(tax) ||
                tax < 0 ||
                tax > 100
            ) {

                alert(
                    "Please enter a valid tax rate between 0 and 100."
                );

                return;

            }


            if (
                !Number.isInteger(tables) ||
                tables < 1
            ) {

                alert(
                    "Please enter a valid number of tables."
                );

                return;

            }


            settings.currency =
                document
                    .getElementById(
                        "currency"
                    )
                    .value;


            settings.taxRate =
                tax;


            settings.orderPrefix =
                document
                    .getElementById(
                        "orderPrefix"
                    )
                    .value
                    .trim();


            settings.tableCount =
                tables;


            saveSettings(settings);


            alert(
                "System settings saved successfully."
            );

        }
    );

}


function setupClearData() {

    const button =
        document.getElementById(
            "clearDataButton"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function () {

            const confirmed =
                confirm(
                    "Are you sure you want to clear all RestaurantPro data? This action cannot be undone."
                );


            if (!confirmed) {
                return;
            }


            const doubleConfirmed =
                confirm(
                    "This will delete menu, orders, customers, expenses and settings. Continue?"
                );


            if (!doubleConfirmed) {
                return;
            }


            localStorage.clear();


            alert(
                "All RestaurantPro data has been cleared."
            );


            location.reload();

        }
    );

}function setupLogo() {

    const logoInput =
        document.getElementById("restaurantLogo");

    const logoPreview =
        document.getElementById("logoPreview");

    const logoPlaceholder =
        document.getElementById("logoPlaceholder");

    const removeButton =
        document.getElementById("removeLogoButton");


    const savedLogo =
        localStorage.getItem("restaurantpro_logo");


    if (savedLogo) {

        logoPreview.src = savedLogo;

        logoPreview.style.display = "block";

        logoPlaceholder.style.display = "none";

    }


    logoInput.addEventListener(
        "change",
        function () {

            const file =
                logoInput.files[0];

            if (!file) {
                return;
            }


            if (!file.type.startsWith("image/")) {

                alert("Please select an image file.");

                logoInput.value = "";

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    const logo =
                        event.target.result;

                    logoPreview.src = logo;

                    logoPreview.style.display =
                        "block";

                    logoPlaceholder.style.display =
                        "none";

                    localStorage.setItem(
                        "restaurantpro_logo",
                        logo
                    );

                };


            reader.readAsDataURL(file);

        }
    );


    removeButton.addEventListener(
        "click",
        function () {

            localStorage.removeItem(
                "restaurantpro_logo"
            );

            logoPreview.src = "";

            logoPreview.style.display =
                "none";

            logoPlaceholder.style.display =
                "block";

            logoInput.value = "";

        }
    );

}