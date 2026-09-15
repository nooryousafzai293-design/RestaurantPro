const EXPENSES_KEY = "restaurantpro_expenses";

let editingExpenseId = null;

document.addEventListener("DOMContentLoaded", function () {
    setTodayDate();
    setupExpenseSearch();
    setupExpenseCategoryFilter();
    renderExpenses();
});


function getExpenses() {
    const saved = localStorage.getItem(EXPENSES_KEY);

    if (!saved) {
        return [];
    }

    try {
        return JSON.parse(saved) || [];
    } catch (error) {
        console.error("Could not read expenses:", error);
        return [];
    }
}


function saveExpenses(expenses) {
    localStorage.setItem(
        EXPENSES_KEY,
        JSON.stringify(expenses)
    );
}


function setTodayDate() {

    const dateInput =
        document.getElementById("expenseDate");

    if (dateInput && !dateInput.value) {

        const today = new Date();

        const year = today.getFullYear();

        const month =
            String(today.getMonth() + 1).padStart(2, "0");

        const day =
            String(today.getDate()).padStart(2, "0");

        dateInput.value =
            `${year}-${month}-${day}`;
    }
}


function openExpenseModal(expenseId = null) {

    const modal =
        document.getElementById("expenseModal");

    const form =
        document.getElementById("expenseForm");

    const title =
        document.getElementById("expenseModalTitle");


    if (!modal || !form) {
        return;
    }


    editingExpenseId = expenseId;

    form.reset();


    if (expenseId !== null) {

        const expenses = getExpenses();

        const expense =
            expenses.find(function (item) {

                return String(item.id) ===
                    String(expenseId);

            });


        if (!expense) {
            return;
        }


        title.textContent =
            "Edit Expense";


        document.getElementById("expenseName").value =
            expense.name || "";


        document.getElementById("expenseCategory").value =
            expense.category || "";


        document.getElementById("expenseAmount").value =
            expense.amount || "";


        document.getElementById("expenseDate").value =
            expense.date || "";


        document.getElementById("expensePayment").value =
            expense.payment || "Cash";


        document.getElementById("expenseNotes").value =
            expense.notes || "";


    } else {

        title.textContent =
            "Add Expense";

        setTodayDate();

    }


    modal.classList.add("show");


    setTimeout(function () {

        document
            .getElementById("expenseName")
            .focus();

    }, 50);
}


function closeExpenseModal() {

    const modal =
        document.getElementById("expenseModal");

    const form =
        document.getElementById("expenseForm");


    if (modal) {
        modal.classList.remove("show");
    }


    if (form) {
        form.reset();
    }


    editingExpenseId = null;

    setTodayDate();
}


function saveExpense(event) {

    event.preventDefault();


    const name =
        document
            .getElementById("expenseName")
            .value
            .trim();


    const category =
        document
            .getElementById("expenseCategory")
            .value;


    const amount =
        Number(
            document
                .getElementById("expenseAmount")
                .value
        );


    const date =
        document
            .getElementById("expenseDate")
            .value;


    const payment =
        document
            .getElementById("expensePayment")
            .value;


    const notes =
        document
            .getElementById("expenseNotes")
            .value
            .trim();


    if (!name || !category || !date) {

        alert(
            "Please complete all required fields."
        );

        return;
    }


    if (amount <= 0 || !Number.isFinite(amount)) {

        alert(
            "Please enter a valid expense amount."
        );

        return;
    }


    let expenses =
        getExpenses();


    if (editingExpenseId !== null) {

        const index =
            expenses.findIndex(function (expense) {

                return String(expense.id) ===
                    String(editingExpenseId);

            });


        if (index !== -1) {

            expenses[index] = {

                ...expenses[index],

                name: name,

                category: category,

                amount: amount,

                date: date,

                payment: payment,

                notes: notes

            };

        }

    } else {

        expenses.unshift({

            id: Date.now(),

            name: name,

            category: category,

            amount: amount,

            date: date,

            payment: payment,

            notes: notes,

            createdAt:
                new Date().toISOString()

        });

    }


    saveExpenses(expenses);

    closeExpenseModal();

    renderExpenses();
}


function deleteExpense(expenseId) {

    const expenses =
        getExpenses();


    const expense =
        expenses.find(function (item) {

            return String(item.id) ===
                String(expenseId);

        });


    if (!expense) {
        return;
    }


    const confirmed =
        confirm(
            `Delete "${expense.name}" expense?`
        );


    if (!confirmed) {
        return;
    }


    const updatedExpenses =
        expenses.filter(function (item) {

            return String(item.id) !==
                String(expenseId);

        });


    saveExpenses(updatedExpenses);

    renderExpenses();
}


function renderExpenses() {

    const tbody =
        document.getElementById(
            "expensesTableBody"
        );


    const empty =
        document.getElementById(
            "expensesEmpty"
        );


    if (!tbody || !empty) {
        return;
    }


    let expenses =
        getExpenses();


    const searchInput =
        document.getElementById(
            "expenseSearch"
        );


    const categoryFilter =
        document.getElementById(
            "expenseCategoryFilter"
        );


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const category =
        categoryFilter
            ? categoryFilter.value
            : "all";


    if (search) {

        expenses =
            expenses.filter(function (expense) {

                const name =
                    String(
                        expense.name || ""
                    ).toLowerCase();


                const notes =
                    String(
                        expense.notes || ""
                    ).toLowerCase();


                const payment =
                    String(
                        expense.payment || ""
                    ).toLowerCase();


                return (
                    name.includes(search) ||
                    notes.includes(search) ||
                    payment.includes(search)
                );

            });

    }


    if (category !== "all") {

        expenses =
            expenses.filter(function (expense) {

                return expense.category ===
                    category;

            });

    }


    tbody.innerHTML = "";


    if (expenses.length === 0) {

        empty.classList.remove("hidden");

    } else {

        empty.classList.add("hidden");


        expenses.forEach(function (expense) {

            tbody.appendChild(
                createExpenseRow(expense)
            );

        });

    }


    updateExpenseStats();
}


function createExpenseRow(expense) {

    const row =
        document.createElement("tr");


    row.innerHTML = `

        <td>

            <div class="expense-name">

                ${escapeHTML(expense.name)}

            </div>

            <div class="expense-note-preview">

                ${escapeHTML(
                    expense.notes || ""
                )}

            </div>

        </td>


        <td>

            <span class="expense-category">

                ${escapeHTML(
                    expense.category
                )}

            </span>

        </td>


        <td>

            <span class="expense-amount">

                Rs. ${formatMoney(
                    expense.amount
                )}

            </span>

        </td>


        <td>

            <span class="expense-date">

                ${formatDate(
                    expense.date
                )}

            </span>

        </td>


        <td>

            <span class="expense-payment">

                ${escapeHTML(
                    expense.payment || "Cash"
                )}

            </span>

        </td>


        <td>

            ${escapeHTML(
                expense.notes || "-"
            )}

        </td>


        <td>

            <div class="expense-actions">

                <button
                    type="button"
                    class="expense-action-button"
                    title="Edit"
                    onclick="openExpenseModal('${expense.id}')"
                >
                    ✏️
                </button>


                <button
                    type="button"
                    class="expense-action-button delete"
                    title="Delete"
                    onclick="deleteExpense('${expense.id}')"
                >
                    🗑️
                </button>

            </div>

        </td>

    `;


    return row;
}


function updateExpenseStats() {

    const expenses =
        getExpenses();


    const now =
        new Date();


    const currentMonth =
        now.getMonth();


    const currentYear =
        now.getFullYear();


    let total =
        0;


    let monthly =
        0;


    let yearly =
        0;


    expenses.forEach(function (expense) {

        const amount =
            Number(expense.amount || 0);


        total += amount;


        if (!expense.date) {
            return;
        }


        const date =
            new Date(
                expense.date + "T00:00:00"
            );


        if (isNaN(date.getTime())) {
            return;
        }


        if (
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear
        ) {

            monthly += amount;

        }


        if (
            date.getFullYear() === currentYear
        ) {

            yearly += amount;

        }

    });


    const totalElement =
        document.getElementById(
            "totalExpenses"
        );


    const monthlyElement =
        document.getElementById(
            "monthlyExpenses"
        );


    const yearlyElement =
        document.getElementById(
            "yearlyExpenses"
        );


    const countElement =
        document.getElementById(
            "expenseCount"
        );


    if (totalElement) {

        totalElement.textContent =
            "Rs. " + formatMoney(total);

    }


    if (monthlyElement) {

        monthlyElement.textContent =
            "Rs. " + formatMoney(monthly);

    }


    if (yearlyElement) {

        yearlyElement.textContent =
            "Rs. " + formatMoney(yearly);

    }


    if (countElement) {

        countElement.textContent =
            expenses.length;

    }

}


function setupExpenseSearch() {

    const input =
        document.getElementById(
            "expenseSearch"
        );


    if (!input) {
        return;
    }


    input.addEventListener(
        "input",
        function () {

            renderExpenses();

        }
    );

}


function setupExpenseCategoryFilter() {

    const select =
        document.getElementById(
            "expenseCategoryFilter"
        );


    if (!select) {
        return;
    }


    select.addEventListener(
        "change",
        function () {

            renderExpenses();

        }
    );

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


function formatDate(value) {

    if (!value) {
        return "-";
    }


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
            document.getElementById(
                "expenseModal"
            );


        if (
            modal &&
            event.target === modal
        ) {

            closeExpenseModal();

        }

    }
);


document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            closeExpenseModal();

        }

    }
);