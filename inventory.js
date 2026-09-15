/* ==========================================
   RESTAURANTPRO - INVENTORY JS
========================================== */

const INVENTORY_KEY = "restaurantpro_inventory";

let editingInventoryId = null;


/* ==========================================
   START
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setupInventorySearch();

        setupInventoryFilter();

        renderInventory();

    }
);


/* ==========================================
   GET INVENTORY
========================================== */

function getInventory() {

    const saved =
        localStorage.getItem(
            INVENTORY_KEY
        );

    if (!saved) {
        return [];
    }

    try {
        return JSON.parse(saved) || [];
    }

    catch (error) {

        console.error(
            "Could not read inventory:",
            error
        );

        return [];

    }

}


/* ==========================================
   SAVE INVENTORY
========================================== */

function saveInventory(items) {

    localStorage.setItem(
        INVENTORY_KEY,
        JSON.stringify(items)
    );

}


/* ==========================================
   OPEN MODAL
========================================== */

function openInventoryModal(itemId = null) {

    const modal =
        document.getElementById(
            "inventoryModal"
        );

    const title =
        document.getElementById(
            "inventoryModalTitle"
        );

    const form =
        document.getElementById(
            "inventoryForm"
        );


    if (!modal || !form) {
        return;
    }


    editingInventoryId =
        itemId;


    form.reset();


    if (itemId !== null) {

        const items =
            getInventory();

        const item =
            items.find(
                function (entry) {

                    return String(
                        entry.id
                    ) === String(itemId);

                }
            );


        if (!item) {
            return;
        }


        title.textContent =
            "Edit Stock Item";


        document.getElementById(
            "itemName"
        ).value =
            item.name || "";


        document.getElementById(
            "itemCategory"
        ).value =
            item.category || "";


        document.getElementById(
            "itemQuantity"
        ).value =
            item.quantity ?? 0;


        document.getElementById(
            "itemUnit"
        ).value =
            item.unit || "kg";


        document.getElementById(
            "itemCost"
        ).value =
            item.cost ?? 0;


        document.getElementById(
            "itemMinStock"
        ).value =
            item.minStock ?? 0;

    }

    else {

        title.textContent =
            "Add Stock Item";

        document.getElementById(
            "itemUnit"
        ).value =
            "kg";

    }


    modal.classList.add(
        "show"
    );


    setTimeout(
        function () {

            document.getElementById(
                "itemName"
            ).focus();

        },
        50
    );

}


/* ==========================================
   CLOSE MODAL
========================================== */

function closeInventoryModal() {

    const modal =
        document.getElementById(
            "inventoryModal"
        );

    const form =
        document.getElementById(
            "inventoryForm"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }


    if (form) {

        form.reset();

    }


    editingInventoryId =
        null;

}


/* ==========================================
   SAVE ITEM
========================================== */

function saveInventoryItem(event) {

    event.preventDefault();


    const name =
        document.getElementById(
            "itemName"
        ).value.trim();


    const category =
        document.getElementById(
            "itemCategory"
        ).value.trim();


    const quantity =
        Number(
            document.getElementById(
                "itemQuantity"
            ).value
        );


    const unit =
        document.getElementById(
            "itemUnit"
        ).value;


    const cost =
        Number(
            document.getElementById(
                "itemCost"
            ).value
        );


    const minStock =
        Number(
            document.getElementById(
                "itemMinStock"
            ).value
        );


    if (!name || !category) {

        alert(
            "Please enter item name and category."
        );

        return;

    }


    if (
        quantity < 0 ||
        cost < 0 ||
        minStock < 0
    ) {

        alert(
            "Quantity, cost and minimum stock cannot be negative."
        );

        return;

    }


    let items =
        getInventory();


    if (editingInventoryId !== null) {

        const index =
            items.findIndex(
                function (item) {

                    return String(
                        item.id
                    ) ===
                    String(
                        editingInventoryId
                    );

                }
            );


        if (index !== -1) {

            items[index] = {

                ...items[index],

                name:
                    name,

                category:
                    category,

                quantity:
                    quantity,

                unit:
                    unit,

                cost:
                    cost,

                minStock:
                    minStock

            };

        }

    }

    else {

        const newItem = {

            id:
                Date.now(),

            name:
                name,

            category:
                category,

            quantity:
                quantity,

            unit:
                unit,

            cost:
                cost,

            minStock:
                minStock,

            createdAt:
                new Date().toISOString()

        };


        items.unshift(
            newItem
        );

    }


    saveInventory(
        items
    );


    closeInventoryModal();

    renderInventory();

}


/* ==========================================
   DELETE ITEM
========================================== */

function deleteInventoryItem(itemId) {

    const items =
        getInventory();


    const item =
        items.find(
            function (entry) {

                return String(
                    entry.id
                ) === String(itemId);

            }
        );


    if (!item) {
        return;
    }


    const confirmed =
        confirm(
            `Delete "${item.name}" from inventory?`
        );


    if (!confirmed) {
        return;
    }


    const updated =
        items.filter(
            function (entry) {

                return String(
                    entry.id
                ) !== String(itemId);

            }
        );


    saveInventory(
        updated
    );


    renderInventory();

}


/* ==========================================
   RENDER INVENTORY
========================================== */

function renderInventory() {

    const tbody =
        document.getElementById(
            "inventoryTableBody"
        );


    const empty =
        document.getElementById(
            "inventoryEmpty"
        );


    if (!tbody || !empty) {
        return;
    }


    let items =
        getInventory();


    const searchInput =
        document.getElementById(
            "inventorySearch"
        );


    const filter =
        document.getElementById(
            "stockFilter"
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


    if (search) {

        items =
            items.filter(
                function (item) {

                    return (

                        String(
                            item.name || ""
                        )
                        .toLowerCase()
                        .includes(search)

                        ||

                        String(
                            item.category || ""
                        )
                        .toLowerCase()
                        .includes(search)

                    );

                }
            );

    }


    if (
        filterValue !== "all"
    ) {

        items =
            items.filter(
                function (item) {

                    return (
                        getStockStatus(
                            item
                        ) ===
                        filterValue
                    );

                }
            );

    }


    tbody.innerHTML = "";


    if (items.length === 0) {

        empty.classList.remove(
            "hidden"
        );

    }

    else {

        empty.classList.add(
            "hidden"
        );


        items.forEach(
            function (item) {

                tbody.appendChild(
                    createInventoryRow(
                        item
                    )
                );

            }
        );

    }


    updateInventoryStats();

}


/* ==========================================
   CREATE TABLE ROW
========================================== */

function createInventoryRow(item) {

    const row =
        document.createElement(
            "tr"
        );


    const status =
        getStockStatus(
            item
        );


    const stockValue =
        Number(
            item.quantity || 0
        ) *
        Number(
            item.cost || 0
        );


    row.innerHTML = `

        <td>

            <div class="inventory-item-name">

                ${escapeHTML(
                    item.name
                )}

            </div>

            <div class="inventory-item-category">

                ${escapeHTML(
                    item.category
                )}

            </div>

        </td>


        <td>

            ${escapeHTML(
                item.category
            )}

        </td>


        <td>

            <span class="inventory-quantity">

                ${formatNumber(
                    item.quantity
                )}

            </span>

        </td>


        <td>

            <span class="inventory-unit">

                ${escapeHTML(
                    item.unit
                )}

            </span>

        </td>


        <td>

            Rs. ${formatMoney(
                item.cost
            )}

        </td>


        <td>

            Rs. ${formatMoney(
                stockValue
            )}

        </td>


        <td>

            <span class="inventory-status ${status}">

                ${getStatusText(
                    status
                )}

            </span>

        </td>


        <td>

            <div class="inventory-actions">

                <button
                    type="button"
                    class="inventory-action-button"
                    title="Edit"
                    onclick="openInventoryModal('${item.id}')"
                >
                    ✏️
                </button>


                <button
                    type="button"
                    class="inventory-action-button delete"
                    title="Delete"
                    onclick="deleteInventoryItem('${item.id}')"
                >
                    🗑️
                </button>

            </div>

        </td>

    `;


    return row;

}


/* ==========================================
   STOCK STATUS
========================================== */

function getStockStatus(item) {

    const quantity =
        Number(
            item.quantity || 0
        );


    const minimum =
        Number(
            item.minStock || 0
        );


    if (
        quantity <= 0
    ) {

        return "out";

    }


    if (
        quantity <= minimum
    ) {

        return "low";

    }


    return "normal";

}


/* ==========================================
   STATUS TEXT
========================================== */

function getStatusText(status) {

    if (
        status === "out"
    ) {

        return "Out of Stock";

    }


    if (
        status === "low"
    ) {

        return "Low Stock";

    }


    return "Normal";

}


/* ==========================================
   UPDATE STATS
========================================== */

function updateInventoryStats() {

    const items =
        getInventory();


    const total =
        items.length;


    const low =
        items.filter(
            function (item) {

                return (
                    getStockStatus(
                        item
                    ) === "low"
                );

            }
        ).length;


    const out =
        items.filter(
            function (item) {

                return (
                    getStockStatus(
                        item
                    ) === "out"
                );

            }
        ).length;


    const value =
        items.reduce(
            function (total, item) {

                return (
                    total +
                    (
                        Number(
                            item.quantity || 0
                        ) *
                        Number(
                            item.cost || 0
                        )
                    )
                );

            },
            0
        );


    const totalElement =
        document.getElementById(
            "totalItems"
        );


    const lowElement =
        document.getElementById(
            "lowStockItems"
        );


    const outElement =
        document.getElementById(
            "outOfStockItems"
        );


    const valueElement =
        document.getElementById(
            "stockValue"
        );


    if (totalElement) {

        totalElement.textContent =
            total;

    }


    if (lowElement) {

        lowElement.textContent =
            low;

    }


    if (outElement) {

        outElement.textContent =
            out;

    }


    if (valueElement) {

        valueElement.textContent =
            "Rs. " +
            formatMoney(value);

    }

}


/* ==========================================
   SEARCH
========================================== */

function setupInventorySearch() {

    const input =
        document.getElementById(
            "inventorySearch"
        );


    if (!input) {
        return;
    }


    input.addEventListener(
        "input",
        function () {

            renderInventory();

        }
    );

}


/* ==========================================
   FILTER
========================================== */

function setupInventoryFilter() {

    const filter =
        document.getElementById(
            "stockFilter"
        );


    if (!filter) {
        return;
    }


    filter.addEventListener(
        "change",
        function () {

            renderInventory();

        }
    );

}


/* ==========================================
   FORMAT MONEY
========================================== */

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


/* ==========================================
   FORMAT NUMBER
========================================== */

function formatNumber(value) {

    return Number(
        value || 0
    ).toLocaleString(
        "en-PK",
        {
            maximumFractionDigits: 2
        }
    );

}


/* ==========================================
   ESCAPE HTML
========================================== */

function escapeHTML(value) {

    return String(
        value ?? ""
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


/* ==========================================
   CLOSE MODAL ON BACKGROUND CLICK
========================================== */

document.addEventListener(
    "click",
    function (event) {

        const modal =
            document.getElementById(
                "inventoryModal"
            );


        if (
            modal &&
            event.target === modal
        ) {

            closeInventoryModal();

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

            closeInventoryModal();

        }

    }
);