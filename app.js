console.log("RestaurantPro started successfully.");


/* ==========================================
   RESTAURANT BRANDING
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log("Dashboard loaded.");

        const settings =
            JSON.parse(
                localStorage.getItem(
                    "restaurantpro_settings"
                ) || "{}"
            );

        const savedLogo =
            localStorage.getItem(
                "restaurantpro_logo"
            );


        /* Restaurant Name */

        const restaurantNames =
            document.querySelectorAll(
                ".brand h2"
            );

        restaurantNames.forEach(
            function (element) {

                if (settings.restaurantName) {

                    element.textContent =
                        settings.restaurantName;

                }

            }
        );


        /* Restaurant Logo */

        const logos =
            document.querySelectorAll(
                ".brand-logo"
            );

        logos.forEach(
            function (element) {

                if (savedLogo) {

                    element.innerHTML = "";

                    const img =
                        document.createElement(
                            "img"
                        );

                    img.src = savedLogo;

                    img.alt =
                        "Restaurant Logo";

                    img.style.width =
                        "100%";

                    img.style.height =
                        "100%";

                    img.style.objectFit =
                        "contain";

                    img.style.borderRadius =
                        "10px";

                    element.appendChild(img);

                }

            }
        );


        console.log(
            "Restaurant branding loaded."
        );

    }
);



/* ==========================================
   ORDER STATUS COUNTS
========================================== */

function updateDashboardOrderStatus() {

    const orders =
        JSON.parse(
            localStorage.getItem(
                "restaurantpro_orders"
            )
        ) || [];


    let newCount = 0;
    let preparingCount = 0;
    let readyCount = 0;
    let completedCount = 0;


    orders.forEach(
        function (order) {

            const status =
                String(
                    order.status ||
                    order.kitchenStatus ||
                    "new"
                ).toLowerCase();


            if (status === "new") {

                newCount++;

            }

            else if (
                status === "preparing" ||
                status === "cooking" ||
                status === "in_progress"
            ) {

                preparingCount++;

            }

            else if (status === "ready") {

                readyCount++;

            }

            else if (status === "completed") {

                completedCount++;

            }

        }
    );


    const newElement =
        document.getElementById(
            "newOrdersCount"
        );

    const preparingElement =
        document.getElementById(
            "preparingOrdersCount"
        );

    const readyElement =
        document.getElementById(
            "readyOrdersCount"
        );

    const completedElement =
        document.getElementById(
            "completedOrdersCount"
        );


    if (newElement) {

        newElement.textContent =
            newCount;

    }

    if (preparingElement) {

        preparingElement.textContent =
            preparingCount;

    }

    if (readyElement) {

        readyElement.textContent =
            readyCount;

    }

    if (completedElement) {

        completedElement.textContent =
            completedCount;

    }

}



/* ==========================================
   TODAY'S SALES + ORDERS
========================================== */

function updateDashboardTodayStats() {

    const orders =
        JSON.parse(
            localStorage.getItem(
                "restaurantpro_orders"
            )
        ) || [];


    const today =
        new Date()
            .toISOString()
            .slice(0, 10);


    let todayOrders = 0;
    let todaySales = 0;


    orders.forEach(
        function (order) {

            if (
                String(
                    order.date || ""
                ).slice(0, 10)
                === today
            ) {

                todayOrders++;


                todaySales +=
                    Number(
                        order.grandTotal || 0
                    );

            }

        }
    );


    const salesElement =
        document.querySelector(
            ".stat-card:nth-child(1) h2"
        );

    const ordersElement =
        document.querySelector(
            ".stat-card:nth-child(2) h2"
        );


    if (salesElement) {

        salesElement.textContent =
            "Rs. " +
            todaySales.toLocaleString();

    }


    if (ordersElement) {

        ordersElement.textContent =
            todayOrders;

    }

}



/* ==========================================
   MENU ITEMS COUNT
========================================== */

function updateDashboardMenuCount() {

    const foods =
        JSON.parse(
            localStorage.getItem(
                "restaurantpro_foods"
            )
        ) || [];


    const menuElement =
        document.querySelector(
            ".stat-card:nth-child(3) h2"
        );


    if (menuElement) {

        menuElement.textContent =
            foods.length;

    }

}



/* ==========================================
   INITIAL DASHBOARD UPDATE
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateDashboardOrderStatus();

        updateDashboardTodayStats();

        updateDashboardMenuCount();

    }
);



/* ==========================================
   LIVE UPDATE
========================================== */

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key ===
            "restaurantpro_orders"
        ) {

            updateDashboardOrderStatus();

            updateDashboardTodayStats();

        }


        if (
            event.key ===
            "restaurantpro_foods"
        ) {

            updateDashboardMenuCount();

        }

    }
);
function updateDashboardTableCount() {

    const tables =
        JSON.parse(
            localStorage.getItem(
                "restaurantpro_tables"
            )
        ) || [];

    const tableElement =
        document.querySelector(
            ".stat-card:nth-child(4) h2"
        );

    if (tableElement) {
        tableElement.textContent =
            tables.length;
    }

}


document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateDashboardTableCount();
updateDashboardRecentOrders();
updateDashboardPopularItems();
    }
);
/* ==========================================
   RECENT ORDERS
========================================== */

function updateDashboardRecentOrders() {

    const orders =
        JSON.parse(
            localStorage.getItem(
                "restaurantpro_orders"
            )
        ) || [];

    const container =
        document.getElementById(
            "recentOrdersList"
        );

    if (!container) {
        return;
    }

    if (orders.length === 0) {
        return;
    }

    const recentOrders =
        orders
            .slice()
            .reverse()
            .slice(0, 5);

    container.innerHTML =
        recentOrders.map(
            function (order) {

                const status =
                    String(
                        order.status ||
                        "new"
                    ).toLowerCase();

                const statusNames = {
                    new: "New",
                    preparing: "Preparing",
                    ready: "Ready",
                    completed: "Completed"
                };

                const statusLabel =
                    statusNames[status] ||
                    status;

                return `
                    <div class="recent-order-item">

                        <div>
                            <strong>
                                #${order.orderNumber || order.id}
                            </strong>

                            <span>
                                ${order.customerName || "Walk-in Customer"}
                            </span>
                        </div>

                        <div>
                            <strong>
                                Rs. ${Number(
                                    order.grandTotal || 0
                                ).toLocaleString()}
                            </strong>

                            <span class="order-status ${status}">
                                ${statusLabel}
                            </span>
                        </div>

                    </div>
                `;

            }
        ).join("");

}/* ==========================================
   POPULAR ITEMS
========================================== */

function updateDashboardPopularItems() {

    const orders =
        JSON.parse(
            localStorage.getItem(
                "restaurantpro_orders"
            )
        ) || [];

    const container =
        document.getElementById(
            "popularItemsList"
        );

    if (!container) {
        return;
    }

    const itemCounts = {};

    orders.forEach(function (order) {

        const items = order.items || [];

        items.forEach(function (item) {

            const name =
                item.name || "Unknown Item";

            const quantity =
                Number(item.quantity || 1);

            if (!itemCounts[name]) {
                itemCounts[name] = 0;
            }

            itemCounts[name] += quantity;

        });

    });

    const popularItems =
        Object.entries(itemCounts)
            .sort(function (a, b) {
                return b[1] - a[1];
            })
            .slice(0, 5);

    if (popularItems.length === 0) {
        return;
    }

    container.innerHTML =
        popularItems.map(function (item) {

            return `
                <div class="popular-item">

                    <div class="popular-item-icon">
                        🍽️
                    </div>

                    <div class="popular-item-info">
                        <strong>
                            ${item[0]}
                        </strong>

                        <span>
                            ${item[1]} sold
                        </span>
                    </div>

                </div>
            `;

        }).join("");

}function toggleMobileMenu() {
    const sidebar = document.querySelector(".sidebar");

    if (!sidebar) {
        return;
    }

    sidebar.classList.toggle("mobile-open");
}
