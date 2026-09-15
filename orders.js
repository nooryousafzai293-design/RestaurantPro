/* ==========================================
   RESTAURANTPRO - ORDERS
========================================== */

const ORDER_KEY = "restaurantpro_orders";

let selectedOrder = null;


/* ==========================================
   START
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        renderOrders();
        setupSearch();
        setupFilter();

    }
);


/* ==========================================
   GET ORDERS
========================================== */

function getOrders() {

    return JSON.parse(
        localStorage.getItem(
            ORDER_KEY
        )
    ) || [];

}


/* ==========================================
   SEARCH
========================================== */

function setupSearch() {

    const search =
        document.getElementById(
            "ordersSearch"
        );


    if (!search) {
        return;
    }


    search.addEventListener(
        "input",
        function () {

            renderOrders();

        }
    );

}


/* ==========================================
   FILTER
========================================== */

function setupFilter() {

    const filter =
        document.getElementById(
            "orderFilter"
        );


    if (!filter) {
        return;
    }


    filter.addEventListener(
        "change",
        function () {

            renderOrders();

        }
    );

}


/* ==========================================
   RENDER ORDERS
========================================== */

function renderOrders() {

    const tbody =
        document.getElementById(
            "ordersTableBody"
        );


    const empty =
        document.getElementById(
            "ordersEmpty"
        );


    if (!tbody) {
        return;
    }


    let orders =
        getOrders();


    const searchInput =
        document.getElementById(
            "ordersSearch"
        );


    const filter =
        document.getElementById(
            "orderFilter"
        );


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const filterValue =
        filter
            ? filter.value
            : "all";


    /* SEARCH */

    if (search) {

        orders =
            orders.filter(
                function (order) {

                    const customer =
                        order.customerName ||
                        "";


                    const phone =
                        order.customerPhone ||
                        "";


                    const orderNumber =
                        order.orderNumber ||
                        "";


                    return (

                        orderNumber
                            .toLowerCase()
                            .includes(search)

                        ||

                        customer
                            .toLowerCase()
                            .includes(search)

                        ||

                        phone
                            .toLowerCase()
                            .includes(search)

                    );

                }
            );

    }


    /* FILTER */

    if (
        filterValue === "today"
    ) {

        orders =
            orders.filter(
                function (order) {

                    return isToday(
                        order.date
                    );

                }
            );

    }


    if (
        filterValue === "dine-in" ||
        filterValue === "takeaway" ||
        filterValue === "delivery"
    ) {

        orders =
            orders.filter(
                function (order) {

                    return (
                        order.orderType ===
                        filterValue
                    );

                }
            );

    }


    /* NEWEST FIRST */

    orders.sort(
        function (a, b) {

            return (
                new Date(b.date) -
                new Date(a.date)
            );

        }
    );


    tbody.innerHTML = "";


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

                tbody.appendChild(
                    createOrderRow(
                        order
                    )
                );

            }
        );

    }


    updateStats();

}


/* ==========================================
   CREATE TABLE ROW
========================================== */

function createOrderRow(order) {

    const tr =
        document.createElement(
            "tr"
        );


    const customerName =
        order.customerName ||
        "Walk-in Customer";


    const phone =
        order.customerPhone ||
        "";


    const itemCount =
        order.items
            ? order.items.reduce(
                function (
                    total,
                    item
                ) {

                    return (
                        total +
                        item.quantity
                    );

                },
                0
            )
            : 0;


    const typeName =
        formatOrderType(
            order.orderType
        );


    const paymentName =
        formatPayment(
            order.paymentMethod
        );


    const date =
        formatDate(
            order.date
        );

const status = String(order.status || "new").toLowerCase();

const statusNames = {
    new: "New",
    preparing: "Preparing",
    ready: "Ready",
    completed: "Completed"
};

const statusLabel = statusNames[status] || status;
    tr.innerHTML = `

        <td>

            <span
                class="order-number"
                onclick="openOrderModal(
                    '${order.id}'
                )"
            >

                ${escapeHTML(
                    order.orderNumber
                )}

            </span>

        </td>


        <td>

            <div class="customer-name">

                ${escapeHTML(
                    customerName
                )}

            </div>

            ${
                phone
                    ? `
                        <div class="customer-phone">
                            ${escapeHTML(phone)}
                        </div>
                      `
                    : ""
            }

        </td>


        <td>

            <span
                class="order-type ${order.orderType}"
            >

                ${typeName}

            </span>

        </td>


        <td>

            <span class="items-count">

                ${itemCount}

                ${
                    itemCount === 1
                        ? " item"
                        : " items"
                }

            </span>

        </td>


        <td>

            <span
                class="payment-badge ${order.paymentMethod}"
            >

                ${paymentIcon(
                    order.paymentMethod
                )}

                ${paymentName}

            </span>

        </td>

<td>
    <span class="order-status ${escapeHTML(status)}">
        ${escapeHTML(statusLabel)}
    </span>
</td>
        <td>

            <span class="order-total">

                Rs.
                ${Number(
                    order.grandTotal
                ).toLocaleString()}

            </span>

        </td>


        <td>

            <div class="order-date">

                ${date}

            </div>

        </td>


        <td>

            <button
                type="button"
                class="view-order-button"
                onclick="openOrderModal(
                    '${order.id}'
                )"
            >

                View

            </button>

        </td>

    `;


    return tr;

}


/* ==========================================
   STATS
========================================== */

function updateStats() {

    const orders =
        getOrders();


    const totalOrders =
        orders.length;


    const totalSales =
        orders.reduce(
            function (
                total,
                order
            ) {

                return (
                    total +
                    Number(
                        order.grandTotal
                    )
                );

            },
            0
        );


    const todayOrders =
        orders.filter(
            function (order) {

                return isToday(
                    order.date
                );

            }
        );


    const todaySales =
        todayOrders.reduce(
            function (
                total,
                order
            ) {

                return (
                    total +
                    Number(
                        order.grandTotal
                    )
                );

            },
            0
        );


    document.getElementById(
        "totalOrders"
    ).textContent =
        totalOrders;


    document.getElementById(
        "totalSales"
    ).textContent =
        formatMoney(
            totalSales
        );


    document.getElementById(
        "todayOrders"
    ).textContent =
        todayOrders.length;


    document.getElementById(
        "todaySales"
    ).textContent =
        formatMoney(
            todaySales
        );

}


/* ==========================================
   ORDER MODAL
========================================== */

function openOrderModal(orderId) {

    const orders =
        getOrders();


    selectedOrder =
        orders.find(
            function (order) {

                return (
                    order.id ===
                    orderId
                );

            }
        );


    if (!selectedOrder) {

        alert(
            "Order not found."
        );

        return;

    }


    document.getElementById(
        "modalOrderNumber"
    ).textContent =
        selectedOrder.orderNumber;


    const content =
        document.getElementById(
            "orderModalContent"
        );


    const order =
        selectedOrder;


    const customerName =
        order.customerName ||
        "Walk-in Customer";


    const phone =
        order.customerPhone ||
        "Not provided";


    const table =
        order.tableNumber ||
        "N/A";


    let itemsHTML = "";


    order.items.forEach(
        function (item) {

            const itemTotal =
                Number(item.price) *
                Number(item.quantity);


            itemsHTML += `

                <div class="modal-item-row">

                    <div>

                        <div class="modal-item-name">

                            ${escapeHTML(
                                item.name
                            )}

                        </div>

                        <div class="modal-item-option">

                            ${escapeHTML(
                                item.optionName
                            )}

                        </div>

                    </div>


                    <div class="modal-item-quantity">

                        × ${item.quantity}

                    </div>


                    <div class="modal-item-price">

                        Rs.
                        ${itemTotal.toLocaleString()}

                    </div>

                </div>

            `;

        }
    );


    content.innerHTML = `

        <div class="modal-info-grid">


            <div class="modal-info-box">

                <span>
                    Customer
                </span>

                <strong>
                    ${escapeHTML(
                        customerName
                    )}
                </strong>

            </div>


            <div class="modal-info-box">

                <span>
                    Phone
                </span>

                <strong>
                    ${escapeHTML(
                        phone
                    )}
                </strong>

            </div>


            <div class="modal-info-box">

                <span>
                    Order Type
                </span>

                <strong>
                    ${formatOrderType(
                        order.orderType
                    )}
                </strong>

            </div>


            <div class="modal-info-box">

                <span>
                    Table
                </span>

                <strong>
                    ${escapeHTML(
                        table
                    )}
                </strong>

            </div>


            <div class="modal-info-box">

                <span>
                    Payment
                </span>

                <strong>
                    ${formatPayment(
                        order.paymentMethod
                    )}
                </strong>

            </div>


            <div class="modal-info-box">

                <span>
                    Date
                </span>

                <strong>
                    ${formatDate(
                        order.date
                    )}
                </strong>

            </div>


        </div>


        <div class="modal-items">


            <div class="modal-items-header">

                <span>
                    Item
                </span>

                <span>
                    Qty
                </span>

                <span>
                    Amount
                </span>

            </div>


            ${itemsHTML}


        </div>


        <div class="modal-totals">


            <div class="modal-total-row">

                <span>
                    Subtotal
                </span>

                <strong>
                    ${formatMoney(
                        order.subtotal
                    )}
                </strong>

            </div>


            ${
                Number(order.discount) > 0
                    ? `
                        <div class="modal-total-row">

                            <span>
                                Discount
                            </span>

                            <strong>
                                - ${formatMoney(
                                    order.discount
                                )}
                            </strong>

                        </div>
                      `
                    : ""
            }


            ${
                Number(order.taxAmount) > 0
                    ? `
                        <div class="modal-total-row">

                            <span>
                                Tax (${order.taxRate}%)
                            </span>

                            <strong>
                                ${formatMoney(
                                    order.taxAmount
                                )}
                            </strong>

                        </div>
                      `
                    : ""
            }


            <div class="modal-grand-total">

                <span>
                    Grand Total
                </span>

                <strong>
                    ${formatMoney(
                        order.grandTotal
                    )}
                </strong>

            </div>


        </div>

    `;


    document.getElementById(
        "orderModal"
    ).classList.add(
        "show"
    );

}


/* ==========================================
   CLOSE MODAL
========================================== */

function closeOrderModal() {

    document.getElementById(
        "orderModal"
    ).classList.remove(
        "show"
    );


    selectedOrder = null;

}


/* ==========================================
   PRINT SELECTED ORDER
========================================== */

function printSelectedOrder() {

    if (!selectedOrder) {

        return;

    }


    printBill(
        selectedOrder
    );

}


/* ==========================================
   PRINT BILL
========================================== */

function printBill(order) {

    const paymentNames = {

        cash: "Cash",

        card: "Card",

        online: "Online Payment"

    };


    let itemsHTML = "";


    order.items.forEach(
        function (item) {

            itemsHTML += `

                <tr>

                    <td>

                        ${escapeHTML(
                            item.name
                        )}

                        <br>

                        <small>

                            ${escapeHTML(
                                item.optionName
                            )}

                            ×
                            ${item.quantity}

                        </small>

                    </td>


                    <td>

                        Rs.
                        ${(
                            item.price *
                            item.quantity
                        ).toLocaleString()}

                    </td>

                </tr>

            `;

        }
    );


    const billWindow =
        window.open(
            "",
            "_blank",
            "width=450,height=700"
        );


    if (!billWindow) {

        alert(
            "Please allow pop-ups to print the bill."
        );

        return;

    }


    billWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>
                RestaurantPro Bill
            </title>


            <style>

                * {
                    box-sizing: border-box;
                }

                body {

                    font-family:
                        Arial,
                        sans-serif;

                    width: 380px;

                    margin: 0 auto;

                    padding: 20px;

                    color: #222;

                    font-size: 13px;

                }

                .restaurant-name {

                    text-align: center;

                    font-size: 22px;

                    font-weight: bold;

                    margin-bottom: 4px;

                }

                .restaurant-subtitle {

                    text-align: center;

                    color: #777;

                    font-size: 11px;

                    margin-bottom: 15px;

                }

                .line {

                    border-top:
                        1px dashed #999;

                    margin: 12px 0;

                }

                .info {

                    font-size: 11px;

                    line-height: 1.7;

                }

                table {

                    width: 100%;

                    border-collapse:
                        collapse;

                    margin-top: 12px;

                }

                th {

                    text-align: left;

                    border-bottom:
                        1px solid #222;

                    padding: 6px 0;

                }

                td {

                    padding: 7px 0;

                    vertical-align:
                        top;

                }

                td:last-child,
                th:last-child {

                    text-align: right;

                }

                small {

                    color: #777;

                    font-size: 10px;

                }

                .total {

                    display: flex;

                    justify-content:
                        space-between;

                    padding: 5px 0;

                }

                .grand {

                    border-top:
                        1px solid #222;

                    padding-top: 10px;

                    margin-top: 5px;

                    font-size: 18px;

                    font-weight: bold;

                }

                .thank {

                    text-align: center;

                    margin-top: 25px;

                    color: #555;

                    font-size: 12px;

                }

                @media print {

                    body {
                        width: 100%;
                    }

                }

            </style>

        </head>


        <body>


            <div class="restaurant-name">

                RestaurantPro

            </div>


            <div class="restaurant-subtitle">

                Restaurant Billing System

            </div>


            <div class="line"></div>


            <div class="info">

                <strong>
                    Order:
                </strong>

                ${escapeHTML(
                    order.orderNumber
                )}

                <br>


                <strong>
                    Date:
                </strong>

                ${formatDate(
                    order.date
                )}

                <br>


                <strong>
                    Type:
                </strong>

                ${formatOrderType(
                    order.orderType
                )}


                ${
                    order.tableNumber
                        ? `
                            <br>

                            <strong>
                                Table:
                            </strong>

                            ${escapeHTML(
                                order.tableNumber
                            )}
                          `
                        : ""
                }


                ${
                    order.customerName
                        ? `
                            <br>

                            <strong>
                                Customer:
                            </strong>

                            ${escapeHTML(
                                order.customerName
                            )}
                          `
                        : ""
                }

            </div>


            <div class="line"></div>


            <table>

                <thead>

                    <tr>

                        <th>
                            Item
                        </th>

                        <th>
                            Amount
                        </th>

                    </tr>

                </thead>


                <tbody>

                    ${itemsHTML}

                </tbody>

            </table>


            <div class="line"></div>


            <div class="total">

                <span>
                    Subtotal
                </span>

                <strong>
                    ${formatMoney(
                        order.subtotal
                    )}
                </strong>

            </div>


            ${
                Number(order.discount) > 0
                    ? `
                        <div class="total">

                            <span>
                                Discount
                            </span>

                            <strong>
                                - ${formatMoney(
                                    order.discount
                                )}
                            </strong>

                        </div>
                      `
                    : ""
            }


            ${
                Number(order.taxAmount) > 0
                    ? `
                        <div class="total">

                            <span>
                                Tax (${order.taxRate}%)
                            </span>

                            <strong>
                                ${formatMoney(
                                    order.taxAmount
                                )}
                            </strong>

                        </div>
                      `
                    : ""
            }


            <div class="total grand">

                <span>
                    TOTAL
                </span>

                <strong>
                    ${formatMoney(
                        order.grandTotal
                    )}
                </strong>

            </div>


            <div class="total">

                <span>
                    Payment
                </span>

                <strong>

                    ${
                        paymentNames[
                            order.paymentMethod
                        ] ||
                        order.paymentMethod
                    }

                </strong>

            </div>


            <div class="thank">

                Thank you for visiting us!

                <br>

                Please come again.

            </div>


        </body>

        </html>

    `);


    billWindow.document.close();

    billWindow.focus();


    setTimeout(
        function () {

            billWindow.print();

        },
        300
    );

}


/* ==========================================
   HELPERS
========================================== */

function isToday(date) {

    const orderDate =
        new Date(date);


    const today =
        new Date();


    return (

        orderDate.getFullYear() ===
        today.getFullYear()

        &&

        orderDate.getMonth() ===
        today.getMonth()

        &&

        orderDate.getDate() ===
        today.getDate()

    );

}


function formatMoney(amount) {

    return (

        "Rs. " +

        Number(amount || 0)
            .toLocaleString(
                "en-PK",
                {
                    maximumFractionDigits: 2
                }
            )

    );

}


function formatDate(date) {

    return new Date(date)
        .toLocaleString(
            "en-PK",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );

}


function formatOrderType(type) {

    const names = {

        "dine-in":
            "Dine In",

        "takeaway":
            "Takeaway",

        "delivery":
            "Delivery"

    };


    return (

        names[type] ||
        type ||
        "Unknown"

    );

}


function formatPayment(payment) {

    const names = {

        cash:
            "Cash",

        card:
            "Card",

        online:
            "Online Payment"

    };


    return (

        names[payment] ||
        payment ||
        "Unknown"

    );

}


function paymentIcon(payment) {

    const icons = {

        cash:
            "💵",

        card:
            "💳",

        online:
            "📱"

    };


    return (

        icons[payment] ||
        "💰"

    );

}


function escapeHTML(value) {

    return String(value || "")
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


/* ==========================================
   MODAL BACKDROP
========================================== */

document.addEventListener(
    "click",
    function (event) {

        if (
            event.target.id ===
            "orderModal"
        ) {

            closeOrderModal();

        }

    }
);


/* ==========================================
   ESC KEY
========================================== */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            closeOrderModal();

        }

    }
);