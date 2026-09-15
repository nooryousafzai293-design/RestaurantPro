/* ==========================================
   RESTAURANTPRO - KITCHEN JS
========================================== */

const KITCHEN_ORDER_KEY = "restaurantpro_orders";

let kitchenFilter = "all";

let autoRefreshTimer = null;


/* ==========================================
   START
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupKitchenFilters();

        setupKitchenSearch();

        setupAutoRefresh();

        renderKitchen();

    }
);


/* ==========================================
   GET ORDERS
========================================== */

function getKitchenOrders() {

    const saved =
        localStorage.getItem(
            KITCHEN_ORDER_KEY
        );


    if (!saved) {

        return [];

    }


    try {

        return JSON.parse(saved) || [];

    }

    catch (error) {

        console.error(
            "Could not read orders:",
            error
        );

        return [];

    }

}


/* ==========================================
   SAVE ORDERS
========================================== */

function saveKitchenOrders(orders) {

    localStorage.setItem(
        KITCHEN_ORDER_KEY,
        JSON.stringify(orders)
    );

}


/* ==========================================
   RENDER KITCHEN
========================================== */

function renderKitchen() {

    const board =
        document.getElementById(
            "kitchenBoard"
        );


    const empty =
        document.getElementById(
            "kitchenEmpty"
        );


    if (!board || !empty) {

        return;

    }


    let orders =
        getKitchenOrders();


    const searchInput =
        document.getElementById(
            "kitchenSearch"
        );


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    /* FILTER */

    if (
        kitchenFilter !== "all"
    ) {

        orders =
            orders.filter(
                function (order) {

                    return (
                        getOrderStatus(
                            order
                        ) ===
                        kitchenFilter
                    );

                }
            );

    }


    /* SEARCH */

    if (search) {

        orders =
            orders.filter(
                function (order) {

                    const orderNumber =
                        String(
                            order.id ||
                            order.orderNumber ||
                            ""
                        ).toLowerCase();


                    const customer =
                        String(
                            order.customer ||
                            order.customerName ||
                            ""
                        ).toLowerCase();


                    return (
                        orderNumber.includes(search) ||
                        customer.includes(search)
                    );

                }
            );

    }


    board.innerHTML = "";


    if (orders.length === 0) {

        empty.classList.remove(
            "hidden"
        );

    }

    else {

        empty.classList.add(
            "hidden"
        );


        orders.forEach(
            function (order) {

                board.appendChild(
                    createKitchenCard(
                        order
                    )
                );

            }
        );

    }


    updateKitchenStats();

}


/* ==========================================
   CREATE ORDER CARD
========================================== */

function createKitchenCard(order) {

    const card =
        document.createElement(
            "div"
        );


    const status =
        getOrderStatus(
            order
        );


    card.className =
        "kitchen-order-card " +
        status;


    const orderNumber =
        order.orderNumber ||
        order.id ||
        "Order";


    const customer =
        order.customerName ||
        order.customer ||
        "Walk-in Customer";


    const table =
        order.table ||
        order.tableName ||
        "Takeaway";


    const time =
        formatOrderTime(
            order.createdAt ||
            order.time ||
            order.date
        );


    const items =
        normalizeItems(
            order
        );


    let itemsHTML = "";


    items.forEach(
        function (item) {

            const itemName =
                item.name ||
                item.itemName ||
                "Food Item";


            const quantity =
                Number(
                    item.quantity ||
                    item.qty ||
                    1
                );


            const note =
                item.note ||
                item.notes ||
                "";


            itemsHTML += `

                <div class="kitchen-item">

                    <div class="kitchen-item-top">

                        <span class="kitchen-item-name">

                            ${escapeHTML(
                                itemName
                            )}

                        </span>

                        <span class="kitchen-item-qty">

                            × ${quantity}

                        </span>

                    </div>


                    ${
                        note
                            ? `
                                <div class="kitchen-item-note">
                                    📝 ${escapeHTML(note)}
                                </div>
                              `
                            : ""
                    }

                </div>

            `;

        }
    );


    card.innerHTML = `

        <div class="kitchen-order-header">


            <div>

                <div class="kitchen-order-number">

                    #${escapeHTML(
                        String(orderNumber)
                    )}

                </div>


                <div class="kitchen-order-meta">

                    ${escapeHTML(
                        customer
                    )}

                </div>

            </div>


            <span
                class="kitchen-order-status ${status}"
            >

                ${getStatusIcon(status)}

                ${getStatusText(status)}

            </span>


        </div>



        <div class="kitchen-order-body">


            <div class="kitchen-order-info">

                <span class="kitchen-order-type">

                    🍽️ ${escapeHTML(
                        getOrderType(order)
                    )}

                </span>


                <span class="kitchen-order-time">

                    ${time}

                </span>

            </div>


            <div class="kitchen-items">

                ${itemsHTML}

            </div>


        </div>



        <div class="kitchen-order-footer">


            <div class="kitchen-table-info">

                <span>
                    Table / Service
                </span>

                <strong>
                    ${escapeHTML(
                        String(table)
                    )}
                </strong>

            </div>


            <button
                type="button"
                class="kitchen-status-button"
                onclick="advanceOrderStatus(
                    '${escapeHTML(
                        String(
                            order.id ||
                            order.orderNumber
                        )
                    )}'
                )"
            >

                ${getActionText(status)}

            </button>


        </div>

    `;


    return card;

}


/* ==========================================
   STATUS
========================================== */

function getOrderStatus(order) {

    const status =
        String(
            order.status ||
            order.kitchenStatus ||
            "new"
        ).toLowerCase();


    if (
        status === "preparing" ||
        status === "cooking" ||
        status === "in_progress"
    ) {

        return "preparing";

    }


    if (
        status === "ready" ||
        status === "completed"
    ) {

        return "ready";

    }


    return "new";

}


/* ==========================================
   STATUS TEXT
========================================== */

function getStatusText(status) {

    if (
        status === "preparing"
    ) {

        return "Preparing";

    }


    if (
        status === "ready"
    ) {

        return "Ready";

    }


    return "New";

}


/* ==========================================
   STATUS ICON
========================================== */

function getStatusIcon(status) {

    if (
        status === "preparing"
    ) {

        return "👨‍🍳";

    }


    if (
        status === "ready"
    ) {

        return "✅";

    }


    return "🔔";

}


/* ==========================================
   NEXT ACTION
========================================== */

function getActionText(status) {

    if (
        status === "new"
    ) {

        return "Start Preparing";

    }


    if (
        status === "preparing"
    ) {

        return "Mark Ready";

    }


    return "Order Completed";

}


/* ==========================================
   ADVANCE STATUS
========================================== */

function advanceOrderStatus(id) {

    let orders = getKitchenOrders();

    const index = orders.findIndex(function (order) {

        return String(
            order.id || order.orderNumber
        ) === String(id);

    });


    if (index === -1) {
        return;
    }


    const current =
        getOrderStatus(orders[index]);


    if (current === "new") {

        orders[index].status = "preparing";

    }

    else if (current === "preparing") {

        orders[index].status = "ready";

    }

    else if (current === "ready") {

        orders[index].status = "completed";

        orders[index].completedAt =
            new Date().toISOString();

    }


    saveKitchenOrders(orders);

    renderKitchen();

}


/* ==========================================
   NORMALIZE ITEMS
========================================== */

function normalizeItems(order) {

    let items =
        order.items ||
        order.cart ||
        order.products ||
        [];


    if (
        !Array.isArray(items)
    ) {

        return [];

    }


    return items;

}


/* ==========================================
   ORDER TYPE
========================================== */

function getOrderType(order) {

    return (
        order.orderType ||
        order.type ||
        "Dine In"
    );

}


/* ==========================================
   TIME
========================================== */

function formatOrderTime(value) {

    if (!value) {

        return "Just now";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

    }


    return date.toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* ==========================================
   STATS
========================================== */

function updateKitchenStats() {

    const orders =
        getKitchenOrders();


    const newOrders =
        orders.filter(
            function (order) {

                return (
                    getOrderStatus(
                        order
                    ) === "new"
                );

            }
        ).length;


    const preparing =
        orders.filter(
            function (order) {

                return (
                    getOrderStatus(
                        order
                    ) === "preparing"
                );

            }
        ).length;


    const ready =
        orders.filter(
            function (order) {

                return (
                    getOrderStatus(
                        order
                    ) === "ready"
                );

            }
        ).length;


    const newCount =
        document.getElementById(
            "newOrdersCount"
        );


    const preparingCount =
        document.getElementById(
            "preparingCount"
        );


    const readyCount =
        document.getElementById(
            "readyCount"
        );


    const todayCount =
        document.getElementById(
            "todayOrdersCount"
        );


    if (newCount) {

        newCount.textContent =
            newOrders;

    }


    if (preparingCount) {

        preparingCount.textContent =
            preparing;

    }


    if (readyCount) {

        readyCount.textContent =
            ready;

    }


    if (todayCount) {

        todayCount.textContent =
            orders.length;

    }

}


/* ==========================================
   FILTERS
========================================== */

function setupKitchenFilters() {

    const buttons =
        document.querySelectorAll(
            ".kitchen-filter"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    buttons.forEach(
                        function (item) {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    kitchenFilter =
                        button.dataset.status ||
                        "all";


                    renderKitchen();

                }
            );

        }
    );

}


/* ==========================================
   SEARCH
========================================== */

function setupKitchenSearch() {

    const input =
        document.getElementById(
            "kitchenSearch"
        );


    if (!input) {

        return;

    }


    input.addEventListener(
        "input",
        function () {

            renderKitchen();

        }
    );

}


/* ==========================================
   REFRESH
========================================== */

function refreshKitchen() {

    renderKitchen();

}


/* ==========================================
   AUTO REFRESH
========================================== */

function setupAutoRefresh() {

    const checkbox =
        document.getElementById(
            "autoRefresh"
        );


    if (!checkbox) {

        return;

    }


    startAutoRefresh();


    checkbox.addEventListener(
        "change",
        function () {

            if (
                checkbox.checked
            ) {

                startAutoRefresh();

            }

            else {

                stopAutoRefresh();

            }

        }
    );

}


function startAutoRefresh() {

    stopAutoRefresh();


    autoRefreshTimer =
        setInterval(
            function () {

                const checkbox =
                    document.getElementById(
                        "autoRefresh"
                    );


                if (
                    checkbox &&
                    checkbox.checked
                ) {

                    renderKitchen();

                }

            },
            5000
        );

}


function stopAutoRefresh() {

    if (
        autoRefreshTimer
    ) {

        clearInterval(
            autoRefreshTimer
        );

        autoRefreshTimer =
            null;

    }

}


/* ==========================================
   ESCAPE HTML
========================================== */

function escapeHTML(value) {

    return String(
        value || ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}