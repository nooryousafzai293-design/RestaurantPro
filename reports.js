const REPORT_ORDERS_KEY = "restaurantpro_orders";
const REPORT_EXPENSES_KEY = "restaurantpro_expenses";

let currentReportPeriod = "today";


document.addEventListener("DOMContentLoaded", function () {

    setupPeriodButtons();

    renderReport();

});


function getOrders() {

    const saved =
        localStorage.getItem(REPORT_ORDERS_KEY);

    if (!saved) {
        return [];
    }

    try {

        return JSON.parse(saved) || [];

    } catch (error) {

        console.error(
            "Could not read orders:",
            error
        );

        return [];

    }

}


function getExpenses() {

    const saved =
        localStorage.getItem(REPORT_EXPENSES_KEY);

    if (!saved) {
        return [];
    }

    try {

        return JSON.parse(saved) || [];

    } catch (error) {

        console.error(
            "Could not read expenses:",
            error
        );

        return [];

    }

}


function setupPeriodButtons() {

    const buttons =
        document.querySelectorAll(
            ".period-button"
        );


    buttons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                buttons.forEach(function (item) {

                    item.classList.remove("active");

                });


                button.classList.add("active");


                currentReportPeriod =
                    button.dataset.period;


                renderReport();

            }
        );

    });

}


function renderReport() {

    const orders =
        getOrders();

    const expenses =
        getExpenses();


    const filteredOrders =
        filterRecordsByPeriod(
            orders,
            currentReportPeriod
        );


    const filteredExpenses =
        filterRecordsByPeriod(
            expenses,
            currentReportPeriod
        );


    const sales =
        calculateSales(
            filteredOrders
        );


    const expenseTotal =
        calculateExpenses(
            filteredExpenses
        );


    const orderCount =
        filteredOrders.length;


    const profit =
        sales - expenseTotal;


    updateSummary(
        sales,
        orderCount,
        expenseTotal,
        profit
    );


    renderSalesChart(
        filteredOrders
    );


    renderExpenseBreakdown(
        filteredExpenses
    );


    renderTopItems(
        filteredOrders
    );

}


function filterRecordsByPeriod(
    records,
    period
) {

    if (period === "all") {

        return records;

    }


    const now =
        new Date();


    const todayStart =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );


    return records.filter(function (record) {

        const recordDate =
            getRecordDate(record);


        if (!recordDate) {
            return false;
        }


        if (period === "today") {

            return (
                recordDate >= todayStart
            );

        }


        if (period === "week") {

            const weekStart =
                new Date(todayStart);

            weekStart.setDate(
                todayStart.getDate() -
                todayStart.getDay()
            );


            return (
                recordDate >= weekStart
            );

        }


        if (period === "month") {

            const monthStart =
                new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    1
                );


            return (
                recordDate >= monthStart
            );

        }


        if (period === "year") {

            const yearStart =
                new Date(
                    now.getFullYear(),
                    0,
                    1
                );


            return (
                recordDate >= yearStart
            );

        }


        return true;

    });

}


function getRecordDate(record) {

    const possibleDates = [

        record.date,

        record.orderDate,

        record.createdAt,

        record.created_at,

        record.timestamp

    ];


    for (
        let i = 0;
        i < possibleDates.length;
        i++
    ) {

        const value =
            possibleDates[i];


        if (!value) {
            continue;
        }


        const date =
            new Date(value);


        if (!isNaN(date.getTime())) {

            return date;

        }

    }


    return null;

}


function calculateSales(orders) {

    let total = 0;


    orders.forEach(function (order) {

        total += getOrderAmount(order);

    });


    return total;

}


function getOrderAmount(order) {

    const possibleAmounts = [

        order.total,

        order.grandTotal,

        order.amount,

        order.totalAmount,

        order.finalTotal,

        order.netTotal

    ];


    for (
        let i = 0;
        i < possibleAmounts.length;
        i++
    ) {

        const value =
            Number(
                possibleAmounts[i]
            );


        if (
            Number.isFinite(value) &&
            value > 0
        ) {

            return value;

        }

    }


    if (Array.isArray(order.items)) {

        return order.items.reduce(
            function (sum, item) {

                const price =
                    Number(
                        item.price ||
                        item.amount ||
                        0
                    );


                const quantity =
                    Number(
                        item.quantity ||
                        item.qty ||
                        1
                    );


                return sum +
                    (price * quantity);

            },
            0
        );

    }


    return 0;

}


function calculateExpenses(expenses) {

    return expenses.reduce(
        function (total, expense) {

            return total +
                Number(
                    expense.amount || 0
                );

        },
        0
    );

}


function updateSummary(
    sales,
    orders,
    expenses,
    profit
) {

    const reportSales =
        document.getElementById(
            "reportSales"
        );


    const reportOrders =
        document.getElementById(
            "reportOrders"
        );


    const reportExpenses =
        document.getElementById(
            "reportExpenses"
        );


    const reportProfit =
        document.getElementById(
            "reportProfit"
        );


    const salesRevenue =
        document.getElementById(
            "salesRevenue"
        );


    const averageOrder =
        document.getElementById(
            "averageOrder"
        );


    if (reportSales) {

        reportSales.textContent =
            "Rs. " +
            formatMoney(sales);

    }


    if (reportOrders) {

        reportOrders.textContent =
            orders;

    }


    if (reportExpenses) {

        reportExpenses.textContent =
            "Rs. " +
            formatMoney(expenses);

    }


    if (reportProfit) {

        reportProfit.textContent =
            "Rs. " +
            formatMoney(profit);

    }


    if (salesRevenue) {

        salesRevenue.textContent =
            "Rs. " +
            formatMoney(sales);

    }


    if (averageOrder) {

        const average =
            orders > 0
                ? sales / orders
                : 0;


        averageOrder.textContent =
            "Rs. " +
            formatMoney(average);

    }

}


function renderSalesChart(orders) {

    const chart =
        document.getElementById(
            "salesChart"
        );


    if (!chart) {
        return;
    }


    chart.innerHTML = "";


    if (orders.length === 0) {

        chart.innerHTML = `
            <div class="chart-empty">
                No sales data available
            </div>
        `;

        return;

    }


    const dailySales =
        {};


    orders.forEach(function (order) {

        const date =
            getRecordDate(order);


        if (!date) {
            return;
        }


        const key =
            date.toISOString()
                .split("T")[0];


        dailySales[key] =
            (dailySales[key] || 0) +
            getOrderAmount(order);

    });


    const days =
        Object.keys(dailySales)
            .sort()
            .slice(-7);


    if (days.length === 0) {

        chart.innerHTML = `
            <div class="chart-empty">
                No sales data available
            </div>
        `;

        return;

    }


    const values =
        days.map(function (day) {

            return dailySales[day];

        });


    const maxValue =
        Math.max(
            ...values,
            1
        );


    days.forEach(function (day) {

        const value =
            dailySales[day];


        const item =
            document.createElement(
                "div"
            );


        item.className =
            "chart-bar-item";


        const bar =
            document.createElement(
                "div"
            );


        bar.className =
            "chart-bar";


        const height =
            Math.max(
                3,
                (value / maxValue) * 100
            );


        bar.style.height =
            height + "%";


        bar.title =
            "Rs. " +
            formatMoney(value);


        const label =
            document.createElement(
                "div"
            );


        label.className =
            "chart-label";


        label.textContent =
            formatShortDate(day);


        item.appendChild(bar);

        item.appendChild(label);

        chart.appendChild(item);

    });

}


function renderExpenseBreakdown(expenses) {

    const container =
        document.getElementById(
            "expenseBreakdown"
        );


    const totalElement =
        document.getElementById(
            "breakdownTotal"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (expenses.length === 0) {

        container.innerHTML = `
            <div class="expense-breakdown-empty">
                No expense data available
            </div>
        `;


        if (totalElement) {

            totalElement.textContent =
                "Rs. 0";

        }


        return;

    }


    const categories =
        {};


    expenses.forEach(function (expense) {

        const category =
            expense.category ||
            "Other";


        categories[category] =
            (categories[category] || 0) +
            Number(
                expense.amount || 0
            );

    });


    const total =
        Object.values(categories)
            .reduce(
                function (sum, value) {

                    return sum + value;

                },
                0
            );


    Object.entries(categories)
        .sort(
            function (a, b) {

                return b[1] - a[1];

            }
        )
        .forEach(function (
            entry
        ) {

            const category =
                entry[0];

            const amount =
                entry[1];


            const percentage =
                total > 0
                    ? (amount / total) * 100
                    : 0;


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "breakdown-item";


            item.innerHTML = `

                <div class="breakdown-item-header">

                    <span class="breakdown-item-name">
                        ${escapeHTML(category)}
                    </span>

                    <span class="breakdown-item-amount">
                        Rs. ${formatMoney(amount)}
                    </span>

                </div>

                <div class="breakdown-progress">

                    <div
                        class="breakdown-progress-bar"
                        style="width: ${percentage}%"
                    ></div>

                </div>

            `;


            container.appendChild(item);

        });


    if (totalElement) {

        totalElement.textContent =
            "Rs. " +
            formatMoney(total);

    }

}


function renderTopItems(orders) {

    const container =
        document.getElementById(
            "topItems"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    const itemData =
        {};


    orders.forEach(function (order) {

        if (!Array.isArray(order.items)) {
            return;
        }


        order.items.forEach(function (item) {

            const name =
                item.name ||
                item.title ||
                "Unknown Item";


            const quantity =
                Number(
                    item.quantity ||
                    item.qty ||
                    1
                );


            const price =
                Number(
                    item.price ||
                    item.amount ||
                    0
                );


            if (!itemData[name]) {

                itemData[name] = {

                    quantity: 0,

                    sales: 0

                };

            }


            itemData[name].quantity +=
                quantity;


            itemData[name].sales +=
                price * quantity;

        });

    });


    const topItems =
        Object.entries(itemData)
            .sort(
                function (a, b) {

                    return (
                        b[1].quantity -
                        a[1].quantity
                    );

                }
            )
            .slice(0, 5);


    if (topItems.length === 0) {

        container.innerHTML = `
            <div class="top-items-empty">
                No item sales data available
            </div>
        `;

        return;

    }


    topItems.forEach(
        function (entry, index) {

            const name =
                entry[0];

            const data =
                entry[1];


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "top-item";


            item.innerHTML = `

                <div class="top-item-rank">
                    #${index + 1}
                </div>

                <div>

                    <div class="top-item-name">
                        ${escapeHTML(name)}
                    </div>

                    <div class="top-item-orders">
                        ${data.quantity} sold
                    </div>

                </div>

                <div class="top-item-sales">
                    Rs. ${formatMoney(data.sales)}
                </div>

            `;


            container.appendChild(item);

        }
    );

}


function printReport() {

    window.print();

}


function formatMoney(value) {

    return Number(
        value || 0
    ).toLocaleString(
        "en-PK",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    );

}


function formatShortDate(value) {

    const date =
        new Date(
            value + "T00:00:00"
        );


    if (isNaN(date.getTime())) {
        return "-";
    }


    return date.toLocaleDateString(
        "en-PK",
        {
            day: "2-digit",
            month: "short"
        }
    );

}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}