const CUSTOMERS_KEY = "restaurantpro_customers";

let editingCustomerId = null;

document.addEventListener("DOMContentLoaded", function () {
    setupCustomerSearch();
    renderCustomers();
});


function getCustomers() {
    const saved = localStorage.getItem(CUSTOMERS_KEY);

    if (!saved) {
        return [];
    }

    try {
        return JSON.parse(saved) || [];
    } catch (error) {
        console.error("Could not read customers:", error);
        return [];
    }
}


function saveCustomers(customers) {
    localStorage.setItem(
        CUSTOMERS_KEY,
        JSON.stringify(customers)
    );
}


function openCustomerModal(customerId = null) {

    const modal = document.getElementById("customerModal");
    const form = document.getElementById("customerForm");
    const title = document.getElementById("customerModalTitle");

    if (!modal || !form) {
        return;
    }

    editingCustomerId = customerId;

    form.reset();

    if (customerId !== null) {

        const customers = getCustomers();

        const customer = customers.find(function (item) {
            return String(item.id) === String(customerId);
        });

        if (!customer) {
            return;
        }

        title.textContent = "Edit Customer";

        document.getElementById("customerName").value =
            customer.name || "";

        document.getElementById("customerPhone").value =
            customer.phone || "";

        document.getElementById("customerAddress").value =
            customer.address || "";

        document.getElementById("customerNotes").value =
            customer.notes || "";

    } else {

        title.textContent = "Add Customer";

    }

    modal.classList.add("show");

    setTimeout(function () {
        document.getElementById("customerName").focus();
    }, 50);
}


function closeCustomerModal() {

    const modal = document.getElementById("customerModal");
    const form = document.getElementById("customerForm");

    if (modal) {
        modal.classList.remove("show");
    }

    if (form) {
        form.reset();
    }

    editingCustomerId = null;
}


function saveCustomer(event) {

    event.preventDefault();

    const name = document
        .getElementById("customerName")
        .value
        .trim();

    const phone = document
        .getElementById("customerPhone")
        .value
        .trim();

    const address = document
        .getElementById("customerAddress")
        .value
        .trim();

    const notes = document
        .getElementById("customerNotes")
        .value
        .trim();


    if (!name || !phone) {

        alert("Please enter customer name and phone number.");

        return;
    }


    let customers = getCustomers();


    if (editingCustomerId !== null) {

        const index = customers.findIndex(function (customer) {

            return String(customer.id) ===
                String(editingCustomerId);

        });


        if (index !== -1) {

            customers[index] = {

                ...customers[index],

                name: name,
                phone: phone,
                address: address,
                notes: notes

            };

        }

    } else {

        customers.unshift({

            id: Date.now(),

            name: name,

            phone: phone,

            address: address,

            notes: notes,

            orders: 0,

            totalSpent: 0,

            lastOrder: null,

            createdAt: new Date().toISOString()

        });

    }


    saveCustomers(customers);

    closeCustomerModal();

    renderCustomers();
}


function deleteCustomer(customerId) {

    const customers = getCustomers();

    const customer = customers.find(function (item) {

        return String(item.id) === String(customerId);

    });


    if (!customer) {
        return;
    }


    const confirmed = confirm(
        `Delete "${customer.name}" from customers?`
    );


    if (!confirmed) {
        return;
    }


    const updatedCustomers = customers.filter(function (item) {

        return String(item.id) !== String(customerId);

    });


    saveCustomers(updatedCustomers);

    renderCustomers();
}


function renderCustomers() {

    const tbody =
        document.getElementById("customersTableBody");

    const empty =
        document.getElementById("customersEmpty");


    if (!tbody || !empty) {
        return;
    }


    let customers = getCustomers();


    const searchInput =
        document.getElementById("customerSearch");


    const search = searchInput
        ? searchInput.value.toLowerCase().trim()
        : "";


    if (search) {

        customers = customers.filter(function (customer) {

            const name =
                String(customer.name || "")
                    .toLowerCase();

            const phone =
                String(customer.phone || "")
                    .toLowerCase();

            return (
                name.includes(search) ||
                phone.includes(search)
            );

        });

    }


    tbody.innerHTML = "";


    if (customers.length === 0) {

        empty.classList.remove("hidden");

    } else {

        empty.classList.add("hidden");


        customers.forEach(function (customer) {

            tbody.appendChild(
                createCustomerRow(customer)
            );

        });

    }


    updateCustomerStats();
}


function createCustomerRow(customer) {

    const row = document.createElement("tr");


    const orders =
        Number(customer.orders || 0);


    const totalSpent =
        Number(customer.totalSpent || 0);


    row.innerHTML = `

        <td>

            <div class="customer-name">

                ${escapeHTML(customer.name)}

            </div>

            <div class="customer-address">

                ${escapeHTML(
                    customer.address || "No address"
                )}

            </div>

        </td>


        <td>

            <span class="customer-phone">

                ${escapeHTML(customer.phone)}

            </span>

        </td>


        <td>

            <span class="customer-order-count">

                ${orders}

            </span>

        </td>


        <td>

            <span class="customer-spending">

                Rs. ${formatMoney(totalSpent)}

            </span>

        </td>


        <td>

            <span class="customer-last-order">

                ${formatDate(customer.lastOrder)}

            </span>

        </td>


        <td>

            <div class="customer-actions">

                <button
                    type="button"
                    class="customer-action-button"
                    title="Edit"
                    onclick="openCustomerModal('${customer.id}')"
                >
                    ✏️
                </button>


                <button
                    type="button"
                    class="customer-action-button delete"
                    title="Delete"
                    onclick="deleteCustomer('${customer.id}')"
                >
                    🗑️
                </button>

            </div>

        </td>

    `;


    return row;
}


function updateCustomerStats() {

    const customers = getCustomers();


    const totalCustomers =
        customers.length;


    const totalOrders =
        customers.reduce(function (total, customer) {

            return total +
                Number(customer.orders || 0);

        }, 0);


    const totalSpending =
        customers.reduce(function (total, customer) {

            return total +
                Number(customer.totalSpent || 0);

        }, 0);


    const currentTime =
        new Date().getTime();


    const thirtyDays =
        30 * 24 * 60 * 60 * 1000;


    const newCustomers =
        customers.filter(function (customer) {

            if (!customer.createdAt) {
                return false;
            }

            const created =
                new Date(customer.createdAt).getTime();

            return (
                currentTime - created <= thirtyDays
            );

        }).length;


    const totalElement =
        document.getElementById("totalCustomers");

    const newElement =
        document.getElementById("newCustomers");

    const ordersElement =
        document.getElementById("customerOrders");

    const spendingElement =
        document.getElementById("customerSpending");


    if (totalElement) {
        totalElement.textContent =
            totalCustomers;
    }


    if (newElement) {
        newElement.textContent =
            newCustomers;
    }


    if (ordersElement) {
        ordersElement.textContent =
            totalOrders;
    }


    if (spendingElement) {
        spendingElement.textContent =
            "Rs. " + formatMoney(totalSpending);
    }
}


function setupCustomerSearch() {

    const input =
        document.getElementById("customerSearch");


    if (!input) {
        return;
    }


    input.addEventListener(
        "input",
        function () {

            renderCustomers();

        }
    );
}


function formatMoney(value) {

    return Number(value || 0).toLocaleString(
        "en-PK",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }
    );
}


function formatDate(dateValue) {

    if (!dateValue) {
        return "No orders";
    }


    const date = new Date(dateValue);


    if (isNaN(date.getTime())) {
        return "No orders";
    }


    return date.toLocaleDateString(
        "en-PK",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
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


document.addEventListener(
    "click",
    function (event) {

        const modal =
            document.getElementById("customerModal");


        if (
            modal &&
            event.target === modal
        ) {

            closeCustomerModal();

        }

    }
);


document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            closeCustomerModal();

        }

    }
);