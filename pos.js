/* ==========================================
   RESTAURANTPRO - POS / BILLING
========================================== */

const MENU_CATEGORY_KEY = "restaurantpro_categories";
const MENU_FOOD_KEY = "restaurantpro_foods";
const ORDER_KEY = "restaurantpro_orders";

let selectedCategory = "all";
let cart = [];
let selectedPayment = "cash";
let selectedFoodId = null;


/* ==========================================
   START
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    initializePOS();

    renderCategories();
    renderProducts();
    renderCart();

    setupSearch();
    setupPaymentMethods();
    setupOrderType();
    setupTotals();
    function loadSettingsTaxRate() {

    const taxRateInput =
        document.getElementById("taxRate");

    if (!taxRateInput) {
        return;
    }

    const savedSettings =
        localStorage.getItem("restaurantpro_settings");

    if (!savedSettings) {
        return;
    }

    try {

        const settings =
            JSON.parse(savedSettings);

        taxRateInput.value =
            Number(settings.taxRate) || 0;

        calculateTotals();

    } catch (error) {

        console.error(
            "Could not load tax rate from settings:",
            error
        );

    }

}
loadSettingsTaxRate();
   loadCustomerPhoneList();
});


function initializePOS() {

    if (!localStorage.getItem(ORDER_KEY)) {

        localStorage.setItem(
            ORDER_KEY,
            JSON.stringify([])
        );

    }

}


/* ==========================================
   DATA
========================================== */

function getCategories() {

    return JSON.parse(
        localStorage.getItem(
            MENU_CATEGORY_KEY
        )
    ) || [];

}


function getFoods() {

    return JSON.parse(
        localStorage.getItem(
            MENU_FOOD_KEY
        )
    ) || [];

}


function getOrders() {

    return JSON.parse(
        localStorage.getItem(
            ORDER_KEY
        )
    ) || [];

}


function saveOrders(orders) {

    localStorage.setItem(
        ORDER_KEY,
        JSON.stringify(orders)
    );

}


/* ==========================================
   SEARCH
========================================== */

function setupSearch() {

    const search =
        document.getElementById(
            "posSearch"
        );


    if (!search) {
        return;
    }


    search.addEventListener(
        "input",
        function () {

            renderProducts();

        }
    );

}


/* ==========================================
   CATEGORIES
========================================== */

function renderCategories() {

    const container =
        document.getElementById(
            "posCategories"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    const allButton =
        document.createElement("button");


    allButton.type = "button";

    allButton.className =
        "pos-category " +
        (
            selectedCategory === "all"
                ? "active"
                : ""
        );


    allButton.textContent =
        "All";


    allButton.addEventListener(
        "click",
        function () {

            selectedCategory = "all";

            renderCategories();
            renderProducts();

        }
    );


    container.appendChild(
        allButton
    );


    getCategories().forEach(
        function (category) {

            const button =
                document.createElement(
                    "button"
                );


            button.type = "button";


            button.className =
                "pos-category " +
                (
                    selectedCategory ===
                    category.id
                        ? "active"
                        : ""
                );


            button.textContent =
                category.icon +
                " " +
                category.name;


            button.addEventListener(
                "click",
                function () {

                    selectedCategory =
                        category.id;

                    renderCategories();
                    renderProducts();

                }
            );


            container.appendChild(
                button
            );

        }
    );

}


/* ==========================================
   PRODUCTS
========================================== */

function renderProducts() {

    const container =
        document.getElementById(
            "posProducts"
        );


    if (!container) {
        return;
    }


    const searchInput =
        document.getElementById(
            "posSearch"
        );


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    let foods =
        getFoods();


    /* CATEGORY */

    if (
        selectedCategory !==
        "all"
    ) {

        foods =
            foods.filter(
                function (food) {

                    return (
                        food.categoryId ===
                        selectedCategory
                    );

                }
            );

    }


    /* SEARCH */

    if (search) {

        foods =
            foods.filter(
                function (food) {

                    return (
                        food.name
                            .toLowerCase()
                            .includes(search)
                    );

                }
            );

    }


    container.innerHTML = "";


    if (foods.length === 0) {

        container.innerHTML = `

            <div class="pos-empty">

                <div class="pos-empty-icon">
                    🍽️
                </div>

                <h3>
                    No Food Items Found
                </h3>

                <p>
                    Add food items from the Menu first.
                </p>

            </div>

        `;

        return;

    }


    foods.forEach(
        function (food) {

            const category =
                getCategories().find(
                    function (item) {

                        return (
                            item.id ===
                            food.categoryId
                        );

                    }
                );


            const categoryName =
                category
                    ? category.name
                    : "Food";


            const firstPrice =
                food.options &&
                food.options.length
                    ? food.options[0].price
                    : 0;


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "pos-product";


            card.innerHTML = `

                <div class="pos-product-icon">
                    ${escapeHTML(
                        food.icon || "🍽️"
                    )}
                </div>

                <h3>
                    ${escapeHTML(food.name)}
                </h3>

                <span class="pos-product-category">
                    ${escapeHTML(categoryName)}
                </span>

                <div class="pos-product-price">
                    From Rs.
                    ${Number(firstPrice)
                        .toLocaleString()}
                </div>

            `;


            card.addEventListener(
                "click",
                function () {

                    openPriceModal(
                        food.id
                    );

                }
            );


            container.appendChild(
                card
            );

        }
    );

}


/* ==========================================
   PRICE MODAL
========================================== */

function openPriceModal(foodId) {

    const food =
        getFoods().find(
            function (item) {

                return item.id === foodId;

            }
        );


    if (!food) {
        return;
    }


    selectedFoodId =
        foodId;


    const name =
        document.getElementById(
            "priceModalFoodName"
        );


    const options =
        document.getElementById(
            "priceOptions"
        );


    name.textContent =
        food.name;


    options.innerHTML = "";


    if (
        !food.options ||
        food.options.length === 0
    ) {

        closePriceModal();

        return;

    }


    food.options.forEach(
        function (option, index) {

            const button =
                document.createElement(
                    "button"
                );


            button.type = "button";

            button.className =
                "price-option";


            button.innerHTML = `

                <span class="price-option-name">
                    ${escapeHTML(option.name)}
                </span>

                <span class="price-option-price">
                    Rs.
                    ${Number(option.price)
                        .toLocaleString()}
                </span>

            `;


            button.addEventListener(
                "click",
                function () {

                    addToCart(
                        food,
                        option,
                        index
                    );

                }
            );


            options.appendChild(
                button
            );

        }
    );


    document.getElementById(
        "priceModal"
    ).classList.add("show");

}


function closePriceModal() {

    document.getElementById(
        "priceModal"
    ).classList.remove("show");


    selectedFoodId = null;

}


/* ==========================================
   ADD TO CART
========================================== */

function addToCart(
    food,
    option,
    optionIndex
) {

    const cartId =
        food.id +
        "_" +
        optionIndex;


    const existing =
        cart.find(
            function (item) {

                return (
                    item.cartId ===
                    cartId
                );

            }
        );


    if (existing) {

        existing.quantity += 1;

    }

    else {

        cart.push({

            cartId:
                cartId,

            foodId:
                food.id,

            name:
                food.name,

            optionName:
                option.name,

            price:
                Number(option.price),

            quantity:
                1

        });

    }


    closePriceModal();

    renderCart();

}


/* ==========================================
   CART
========================================== */

function renderCart() {

    const container =
        document.getElementById(
            "cartItems"
        );


    const count =
        document.getElementById(
            "cartItemCount"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    const totalQuantity =
        cart.reduce(
            function (total, item) {

                return (
                    total +
                    item.quantity
                );

            },
            0
        );


    count.textContent =
        totalQuantity +
        (
            totalQuantity === 1
                ? " item"
                : " items"
        );


    if (cart.length === 0) {

        container.innerHTML = `

            <div class="cart-empty">

                <div class="cart-empty-icon">
                    🛒
                </div>

                <h3>
                    No Items Added
                </h3>

                <p>
                    Select food from the menu.
                </p>

            </div>

        `;


        calculateTotals();

        return;

    }


    cart.forEach(
        function (item) {

            const itemTotal =
                item.price *
                item.quantity;


            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "cart-item";


            element.innerHTML = `

                <div class="cart-item-top">

                    <div>

                        <div class="cart-item-name">
                            ${escapeHTML(item.name)}
                        </div>

                        <div class="cart-item-option">
                            ${escapeHTML(item.optionName)}
                            × Rs.
                            ${Number(item.price)
                                .toLocaleString()}
                        </div>

                    </div>

                    <div class="cart-item-total">
                        Rs.
                        ${itemTotal
                            .toLocaleString()}
                    </div>

                </div>


                <div class="cart-item-controls">

                    <div class="quantity-controls">

                        <button
                            type="button"
                            onclick="changeQuantity(
                                '${item.cartId}',
                                -1
                            )"
                        >
                            −
                        </button>

                        <span>
                            ${item.quantity}
                        </span>

                        <button
                            type="button"
                            onclick="changeQuantity(
                                '${item.cartId}',
                                1
                            )"
                        >
                            +
                        </button>

                    </div>


                    <button
                        type="button"
                        class="remove-cart-item"
                        onclick="removeFromCart(
                            '${item.cartId}'
                        )"
                        title="Remove"
                    >
                        🗑️
                    </button>

                </div>

            `;


            container.appendChild(
                element
            );

        }
    );


    calculateTotals();

}


/* ==========================================
   QUANTITY
========================================== */

function changeQuantity(
    cartId,
    amount
) {

    const item =
        cart.find(
            function (item) {

                return (
                    item.cartId ===
                    cartId
                );

            }
        );


    if (!item) {
        return;
    }


    item.quantity += amount;


    if (item.quantity <= 0) {

        cart =
            cart.filter(
                function (cartItem) {

                    return (
                        cartItem.cartId !==
                        cartId
                    );

                }
            );

    }


    renderCart();

}


/* ==========================================
   REMOVE
========================================== */

function removeFromCart(cartId) {

    cart =
        cart.filter(
            function (item) {

                return (
                    item.cartId !==
                    cartId
                );

            }
        );


    renderCart();

}


/* ==========================================
   CLEAR
========================================== */

function clearCart() {

    if (cart.length === 0) {
        return;
    }


    const confirmed =
        confirm(
            "Clear the current order?"
        );


    if (!confirmed) {
        return;
    }


    cart = [];


    renderCart();

}


/* ==========================================
   TOTALS
========================================== */

function calculateTotals() {

    const subtotalElement =
        document.getElementById(
            "subtotal"
        );


    const discountElement =
        document.getElementById(
            "discount"
        );


    const taxRateElement =
        document.getElementById(
            "taxRate"
        );


    const taxAmountElement =
        document.getElementById(
            "taxAmount"
        );


    const grandTotalElement =
        document.getElementById(
            "grandTotal"
        );


    const subtotal =
        cart.reduce(
            function (total, item) {

                return (
                    total +
                    (
                        item.price *
                        item.quantity
                    )
                );

            },
            0
        );


    let discount =
        Number(
            discountElement.value
        ) || 0;


    let taxRate =
        Number(
            taxRateElement.value
        ) || 0;


    if (discount < 0) {
        discount = 0;
    }


    if (taxRate < 0) {
        taxRate = 0;
    }


    if (discount > subtotal) {

        discount = subtotal;

        discountElement.value =
            subtotal;

    }


    const taxableAmount =
        Math.max(
            0,
            subtotal - discount
        );


    const taxAmount =
        taxableAmount *
        taxRate /
        100;


    const grandTotal =
        taxableAmount +
        taxAmount;


    subtotalElement.textContent =
        formatMoney(subtotal);


    taxAmountElement.textContent =
        formatMoney(taxAmount);


    grandTotalElement.textContent =
        formatMoney(grandTotal);


    return {

        subtotal:
            subtotal,

        discount:
            discount,

        taxRate:
            taxRate,

        taxAmount:
            taxAmount,

        grandTotal:
            grandTotal

    };

}


/* ==========================================
   TOTAL INPUT EVENTS
========================================== */

function setupTotals() {

    const discount =
        document.getElementById(
            "discount"
        );


    const taxRate =
        document.getElementById(
            "taxRate"
        );


    discount.addEventListener(
        "input",
        calculateTotals
    );


    taxRate.addEventListener(
        "input",
        calculateTotals
    );

}


/* ==========================================
   PAYMENT
========================================== */

function setupPaymentMethods() {

    const buttons =
        document.querySelectorAll(
            ".payment-method"
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


                    selectedPayment =
                        button.dataset.payment;

                }
            );

        }
    );

}


/* ==========================================
   ORDER TYPE
========================================== */

function setupOrderType() {

    const select =
        document.getElementById(
            "orderType"
        );


    const tableField =
        document.getElementById(
            "tableField"
        );


    select.addEventListener(
        "change",
        function () {

            if (
                select.value ===
                "dine-in"
            ) {

                tableField.style.display =
                    "block";

            }

            else {

                tableField.style.display =
                    "none";

            }

        }
    );

}


/* ==========================================
   COMPLETE ORDER
========================================== */

function completeOrder() {

    if (cart.length === 0) {

        alert(
            "Please add at least one food item."
        );

        return;

    }


    const customerName =
        document.getElementById(
            "customerName"
        ).value.trim();


    const customerPhone =
        document.getElementById(
            "customerPhone"
        ).value.trim();


    const orderType =
        document.getElementById(
            "orderType"
        ).value;


    const tableNumber =
        document.getElementById(
            "tableNumber"
        ).value.trim();


    if (
        orderType === "dine-in" &&
        !tableNumber
    ) {

        alert(
            "Please enter table number for Dine In."
        );

        return;

    }


    const totals =
        calculateTotals();


    const orderNumber =
        generateOrderNumber();


    const order = {

        id:
            "order_" +
            Date.now(),

        orderNumber:
            orderNumber,

        date:
            new Date().toISOString(),

        orderType:
            orderType,

        tableNumber:
            tableNumber,

        customerName:
            customerName,

        customerPhone:
            customerPhone,

        items:
            JSON.parse(
                JSON.stringify(cart)
            ),

        subtotal:
            totals.subtotal,

        discount:
            totals.discount,

        taxRate:
            totals.taxRate,

        taxAmount:
            totals.taxAmount,

        grandTotal:
            totals.grandTotal,
paymentMethod:
    selectedPayment,

status:
    "new",

kitchenStatus:
    "new"

    };


    const orders =
        getOrders();


    orders.push(order);


    saveOrders(orders);

saveCustomerFromOrder(order);

    showOrderSuccess(
        order
    );

}


/* ==========================================
   ORDER NUMBER
========================================== */

function generateOrderNumber() {

    const orders =
        getOrders();


    const number =
        orders.length + 1;


    return (
        "ORD-" +
        String(number)
            .padStart(4, "0")
    );

}


/* ==========================================
   SUCCESS
========================================== */

function showOrderSuccess(order) {

    const paymentName = {

        cash: "Cash",

        card: "Card",

        online: "Online Payment"

    };


    const printNow =
        confirm(

            "Order " +
            order.orderNumber +
            " completed successfully!\n\n" +

            "Grand Total: " +
            formatMoney(
                order.grandTotal
            ) +
            "\n" +

            "Payment: " +
            (
                paymentName[
                    order.paymentMethod
                ] ||
                order.paymentMethod
            ) +

            "\n\n" +

            "Print bill now?"

        );


    if (printNow) {

        printBill(
            order
        );

    }


    resetOrder();

}


/* ==========================================
   RESET
========================================== */

function resetOrder() {

    cart = [];

    document.getElementById(
        "customerName"
    ).value = "";


    document.getElementById(
        "customerPhone"
    ).value = "";


    document.getElementById(
        "tableNumber"
    ).value = "";


    document.getElementById(
        "discount"
    ).value = "0";


    document.getElementById(
        "taxRate"
    ).value = "0";


    document.getElementById(
        "orderType"
    ).value = "dine-in";


    document.getElementById(
        "tableField"
    ).style.display =
        "block";


    selectedPayment =
        "cash";


    document
        .querySelectorAll(
            ".payment-method"
        )
        .forEach(
            function (button) {

                button.classList.remove(
                    "active"
                );

            }
        );


    const cashButton =
        document.querySelector(
            '[data-payment="cash"]'
        );


    if (cashButton) {

        cashButton.classList.add(
            "active"
        );

    }


    renderCart();

}


/* ==========================================
   PRINT CURRENT BILL
========================================== */

function printCurrentBill() {

    if (cart.length === 0) {

        alert(
            "There are no items in the current order."
        );

        return;

    }


    const totals =
        calculateTotals();


    const temporaryOrder = {

        orderNumber:
            "PREVIEW",

        date:
            new Date().toISOString(),

        orderType:
            document.getElementById(
                "orderType"
            ).value,

        tableNumber:
            document.getElementById(
                "tableNumber"
            ).value,

        customerName:
            document.getElementById(
                "customerName"
            ).value.trim(),

        customerPhone:
            document.getElementById(
                "customerPhone"
            ).value.trim(),

        items:
            JSON.parse(
                JSON.stringify(cart)
            ),

        subtotal:
            totals.subtotal,

        discount:
            totals.discount,

        taxRate:
            totals.taxRate,

        taxAmount:
            totals.taxAmount,

        grandTotal:
            totals.grandTotal,

        paymentMethod:
            selectedPayment

    };


    printBill(
        temporaryOrder
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
                        ${escapeHTML(item.name)}
                        <br>
                        <small>
                            ${escapeHTML(item.optionName)}
                            × ${item.quantity}
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

                .order-info {
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

                    vertical-align: top;
                }

                td:last-child,
                th:last-child {
                    text-align: right;
                }

                small {
                    color: #777;

                    font-size: 10px;
                }

                .total-row {
                    display: flex;

                    justify-content:
                        space-between;

                    padding: 5px 0;
                }

                .grand-total {
                    font-size: 18px;

                    font-weight: bold;

                    padding-top: 10px;

                    border-top:
                        1px solid #222;
                }

                .thank-you {
                    text-align: center;

                    margin-top: 25px;

                    font-size: 12px;

                    color: #555;
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
    ${
        escapeHTML(
            getRestaurantName()
        )
    }
</div>


            <div class="restaurant-subtitle">
                Restaurant Billing System
            </div>


            <div class="line"></div>


            <div class="order-info">

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


                ${
                    order.customerPhone
                        ? `
                            <br>
                            <strong>
                                Phone:
                            </strong>
                            ${escapeHTML(
                                order.customerPhone
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


            <div class="total-row">

                <span>
                    Subtotal
                </span>

                <strong>
                    Rs.
                    ${order.subtotal.toLocaleString()}
                </strong>

            </div>


            ${
                order.discount > 0
                    ? `
                        <div class="total-row">

                            <span>
                                Discount
                            </span>

                            <strong>
                                - Rs.
                                ${order.discount
                                    .toLocaleString()}
                            </strong>

                        </div>
                      `
                    : ""
            }


            ${
                order.taxAmount > 0
                    ? `
                        <div class="total-row">

                            <span>
                                Tax (${order.taxRate}%)
                            </span>

                            <strong>
                                Rs.
                                ${order.taxAmount
                                    .toLocaleString()}
                            </strong>

                        </div>
                      `
                    : ""
            }


            <div class="total-row grand-total">

                <span>
                    TOTAL
                </span>

                <strong>
                    Rs.
                    ${order.grandTotal
                        .toLocaleString()}
                </strong>

            </div>


            <div class="total-row">

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


            <div class="thank-you">

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
function getRestaurantName() {

    const savedSettings =
        localStorage.getItem(
            "restaurantpro_settings"
        );

    if (!savedSettings) {
        return "RestaurantPro";
    }

    try {

        const settings =
            JSON.parse(savedSettings);

        return (
            settings.restaurantName ||
            "RestaurantPro"
        );

    } catch (error) {

        return "RestaurantPro";

    }

}
function formatMoney(amount) {

    return (
        "Rs. " +
        Number(amount)
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

    const types = {

        "dine-in":
            "Dine In",

        "takeaway":
            "Takeaway",

        "delivery":
            "Delivery"

    };


    return (
        types[type] ||
        type
    );

}


function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ==========================================
   MODAL BACKDROP
========================================== */

document.addEventListener(
    "click",
    function (event) {

        if (
            event.target.id ===
            "priceModal"
        ) {

            closePriceModal();

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

            closePriceModal();

        }

    }
);function saveCustomerFromOrder(order) {

    const name = String(order.customerName || "").trim();
    const phone = String(order.customerPhone || "").trim();

    if (!name && !phone) {
        return;
    }

    const saved =
        localStorage.getItem("restaurantpro_customers");

    let customers = [];

    try {
        customers = saved
            ? JSON.parse(saved)
            : [];
    } catch (error) {
        customers = [];
    }

    const existingIndex = customers.findIndex(function (customer) {
        return phone &&
            String(customer.phone || "").trim() === phone;
    });

    if (existingIndex !== -1) {

        customers[existingIndex].name =
            name || customers[existingIndex].name;

        customers[existingIndex].orders =
            Number(customers[existingIndex].orders || 0) + 1;

        customers[existingIndex].totalSpent =
            Number(customers[existingIndex].totalSpent || 0) +
            Number(order.grandTotal || 0);

        customers[existingIndex].lastOrder =
            order.date;

    } else {

        customers.push({
            id: "customer_" + Date.now(),
            name: name || "Walk-in Customer",
            phone: phone,
            address: "",
            notes: "",
            orders: 1,
            totalSpent: Number(order.grandTotal || 0),
            lastOrder: order.date,
            createdAt: new Date().toISOString()
        });
    }

    localStorage.setItem(
        "restaurantpro_customers",
        JSON.stringify(customers)
    );
}
function loadCustomerPhoneList() {

    const list =
        document.getElementById("customerPhoneList");

    if (!list) {
        return;
    }

    const saved =
        localStorage.getItem("restaurantpro_customers");

    if (!saved) {
        return;
    }

    let customers = [];

    try {
        customers = JSON.parse(saved) || [];
    } catch (error) {
        return;
    }

    list.innerHTML = "";

    customers.forEach(function (customer) {

        const phone =
            String(customer.phone || "").trim();

        if (!phone) {
            return;
        }

        const option =
            document.createElement("option");

        option.value = phone;

        option.label =
            customer.name || "Customer";

        list.appendChild(option);
    });
}
