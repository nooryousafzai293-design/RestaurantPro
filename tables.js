/* ==========================================
   RESTAURANTPRO - TABLES
========================================== */

const TABLE_KEY = "restaurantpro_tables";

let currentFilter = "all";

let deleteTableId = null;


/* ==========================================
   START
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeTables();

        setupTableForm();

        setupFilters();

        setupSearch();

        setupModalEvents();

        renderTables();

    }
);


/* ==========================================
   INITIAL TABLES
========================================== */

function initializeTables() {

    const existing =
        localStorage.getItem(
            TABLE_KEY
        );


    if (existing !== null) {

        return;

    }


    const defaultTables = [

        {
            id: createId(),
            name: "Table 1",
            capacity: 4,
            location: "Main Hall",
            notes: "",
            status: "available"
        },

        {
            id: createId(),
            name: "Table 2",
            capacity: 4,
            location: "Main Hall",
            notes: "",
            status: "available"
        },

        {
            id: createId(),
            name: "Table 3",
            capacity: 6,
            location: "Main Hall",
            notes: "",
            status: "available"
        },

        {
            id: createId(),
            name: "Table 4",
            capacity: 2,
            location: "Main Hall",
            notes: "",
            status: "available"
        }

    ];


    saveTables(
        defaultTables
    );

}


/* ==========================================
   GET TABLES
========================================== */

function getTables() {

    return JSON.parse(
        localStorage.getItem(
            TABLE_KEY
        )
    ) || [];

}


/* ==========================================
   SAVE TABLES
========================================== */

function saveTables(tables) {

    localStorage.setItem(
        TABLE_KEY,
        JSON.stringify(tables)
    );

}


/* ==========================================
   RENDER
========================================== */

function renderTables() {

    const grid =
        document.getElementById(
            "tablesGrid"
        );


    const empty =
        document.getElementById(
            "tablesEmpty"
        );


    if (!grid) {

        return;

    }


    let tables =
        getTables();


    const searchInput =
        document.getElementById(
            "tableSearch"
        );


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    /* FILTER */

    if (
        currentFilter !== "all"
    ) {

        tables =
            tables.filter(
                function (table) {

                    return (
                        table.status ===
                        currentFilter
                    );

                }
            );

    }


    /* SEARCH */

    if (search) {

        tables =
            tables.filter(
                function (table) {

                    return (

                        table.name
                            .toLowerCase()
                            .includes(search)

                        ||

                        table.location
                            .toLowerCase()
                            .includes(search)

                    );

                }
            );

    }


    grid.innerHTML = "";


    if (tables.length === 0) {

        empty.classList.remove(
            "hidden"
        );

    }

    else {

        empty.classList.add(
            "hidden"
        );


        tables.forEach(
            function (table) {

                grid.appendChild(
                    createTableCard(
                        table
                    )
                );

            }
        );

    }


    updateTableStats();

}


/* ==========================================
   CREATE TABLE CARD
========================================== */

function createTableCard(table) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "restaurant-table-card " +
        table.status;


    const statusText =
        table.status === "occupied"
            ? "Occupied"
            : "Available";


    const statusIcon =
        table.status === "occupied"
            ? "🔴"
            : "🟢";


    card.innerHTML = `

        <div class="table-card-top">


            <div>

                <div class="table-number">

                    ${escapeHTML(
                        table.name
                    )}

                </div>


                <div class="table-location">

                    ${escapeHTML(
                        table.location
                    )}

                </div>

            </div>


            <span
                class="table-status ${table.status}"
            >

                ${statusIcon}

                ${statusText}

            </span>


        </div>



        <div class="table-visual">

            <div class="table-shape">

                ${table.capacity} Seats

            </div>

        </div>



        <div class="table-card-info">

            <span class="table-capacity">

                Capacity:

                <strong>
                    ${table.capacity}
                </strong>

            </span>


            ${
                table.notes
                    ? `
                        <span class="table-capacity">
                            📝 Note
                        </span>
                      `
                    : ""
            }

        </div>



        <div class="table-card-actions">


            <button
                type="button"
                class="table-action edit"
                onclick="editTable(
                    '${table.id}'
                )"
            >
                Edit
            </button>


            ${
                table.status === "available"
                    ? `
                        <button
                            type="button"
                            class="table-action edit"
                            onclick="toggleTableStatus(
                                '${table.id}'
                            )"
                        >
                            Occupy
                        </button>
                      `
                    : `
                        <button
                            type="button"
                            class="table-action edit"
                            onclick="toggleTableStatus(
                                '${table.id}'
                            )"
                        >
                            Free
                        </button>
                      `
            }


            <button
                type="button"
                class="table-action delete"
                onclick="openDeleteModal(
                    '${table.id}'
                )"
            >
                Delete
            </button>


        </div>

    `;


    return card;

}


/* ==========================================
   STATS
========================================== */

function updateTableStats() {

    const tables =
        getTables();


    const total =
        tables.length;


    const available =
        tables.filter(
            function (table) {

                return (
                    table.status ===
                    "available"
                );

            }
        ).length;


    const occupied =
        tables.filter(
            function (table) {

                return (
                    table.status ===
                    "occupied"
                );

            }
        ).length;


    const capacity =
        tables.reduce(
            function (
                totalSeats,
                table
            ) {

                return (
                    totalSeats +
                    Number(
                        table.capacity
                    )
                );

            },
            0
        );


    document.getElementById(
        "totalTables"
    ).textContent =
        total;


    document.getElementById(
        "availableTables"
    ).textContent =
        available;


    document.getElementById(
        "occupiedTables"
    ).textContent =
        occupied;


    document.getElementById(
        "totalCapacity"
    ).textContent =
        capacity;

}


/* ==========================================
   ADD TABLE MODAL
========================================== */

function openAddTableModal() {

    const form =
        document.getElementById(
            "tableForm"
        );


    form.reset();


    document.getElementById(
        "editTableId"
    ).value = "";


    document.getElementById(
        "tableCapacity"
    ).value = 4;


    document.getElementById(
        "tableModalTitle"
    ).textContent =
        "Add Table";


    document.getElementById(
        "tableModal"
    ).classList.add(
        "show"
    );


    setTimeout(
        function () {

            document.getElementById(
                "tableName"
            ).focus();

        },
        100
    );

}


/* ==========================================
   CLOSE TABLE MODAL
========================================== */

function closeTableModal() {

    document.getElementById(
        "tableModal"
    ).classList.remove(
        "show"
    );

}


/* ==========================================
   EDIT TABLE
========================================== */

function editTable(id) {

    const tables =
        getTables();


    const table =
        tables.find(
            function (item) {

                return (
                    item.id === id
                );

            }
        );


    if (!table) {

        return;

    }


    document.getElementById(
        "editTableId"
    ).value =
        table.id;


    document.getElementById(
        "tableName"
    ).value =
        table.name;


    document.getElementById(
        "tableCapacity"
    ).value =
        table.capacity;


    document.getElementById(
        "tableLocation"
    ).value =
        table.location;


    document.getElementById(
        "tableNotes"
    ).value =
        table.notes || "";


    document.getElementById(
        "tableModalTitle"
    ).textContent =
        "Edit Table";


    document.getElementById(
        "tableModal"
    ).classList.add(
        "show"
    );

}


/* ==========================================
   SAVE FORM
========================================== */

function setupTableForm() {

    const form =
        document.getElementById(
            "tableForm"
        );


    if (!form) {

        return;

    }


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const id =
                document.getElementById(
                    "editTableId"
                ).value;


            const name =
                document.getElementById(
                    "tableName"
                ).value.trim();


            const capacity =
                Number(
                    document.getElementById(
                        "tableCapacity"
                    ).value
                );


            const location =
                document.getElementById(
                    "tableLocation"
                ).value;


            const notes =
                document.getElementById(
                    "tableNotes"
                ).value.trim();


            if (!name) {

                alert(
                    "Please enter table name or number."
                );

                return;

            }


            if (
                !capacity ||
                capacity < 1
            ) {

                alert(
                    "Please enter a valid seating capacity."
                );

                return;

            }


            let tables =
                getTables();


            /* EDIT */

            if (id) {

                const index =
                    tables.findIndex(
                        function (table) {

                            return (
                                table.id ===
                                id
                            );

                        }
                    );


                if (index !== -1) {

                    tables[index].name =
                        name;

                    tables[index].capacity =
                        capacity;

                    tables[index].location =
                        location;

                    tables[index].notes =
                        notes;

                }

            }

            /* ADD */

            else {

                const newTable = {

                    id: createId(),

                    name: name,

                    capacity: capacity,

                    location: location,

                    notes: notes,

                    status: "available"

                };


                tables.push(
                    newTable
                );

            }


            saveTables(
                tables
            );


            closeTableModal();


            renderTables();

        }
    );

}


/* ==========================================
   TOGGLE STATUS
========================================== */

function toggleTableStatus(id) {

    let tables =
        getTables();


    const table =
        tables.find(
            function (item) {

                return (
                    item.id === id
                );

            }
        );


    if (!table) {

        return;

    }


    if (
        table.status ===
        "available"
    ) {

        table.status =
            "occupied";

    }

    else {

        table.status =
            "available";

    }


    saveTables(
        tables
    );


    renderTables();

}


/* ==========================================
   FILTERS
========================================== */

function setupFilters() {

    const buttons =
        document.querySelectorAll(
            ".table-filter"
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


                    currentFilter =
                        button.dataset.filter;


                    renderTables();

                }
            );

        }
    );

}


/* ==========================================
   SEARCH
========================================== */

function setupSearch() {

    const search =
        document.getElementById(
            "tableSearch"
        );


    if (!search) {

        return;

    }


    search.addEventListener(
        "input",
        function () {

            renderTables();

        }
    );

}


/* ==========================================
   DELETE MODAL
========================================== */

function openDeleteModal(id) {

    deleteTableId = id;


    document.getElementById(
        "deleteModal"
    ).classList.add(
        "show"
    );

}


function closeDeleteModal() {

    deleteTableId = null;


    document.getElementById(
        "deleteModal"
    ).classList.remove(
        "show"
    );

}


/* ==========================================
   CONFIRM DELETE
========================================== */

function confirmDeleteTable() {

    if (!deleteTableId) {

        return;

    }


    let tables =
        getTables();


    tables =
        tables.filter(
            function (table) {

                return (
                    table.id !==
                    deleteTableId
                );

            }
        );


    saveTables(
        tables
    );


    closeDeleteModal();


    renderTables();

}


/* ==========================================
   MODAL EVENTS
========================================== */

function setupModalEvents() {

    document.addEventListener(
        "click",
        function (event) {

            if (
                event.target.id ===
                "tableModal"
            ) {

                closeTableModal();

            }


            if (
                event.target.id ===
                "deleteModal"
            ) {

                closeDeleteModal();

            }

        }
    );


    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Escape"
            ) {

                closeTableModal();

                closeDeleteModal();

            }

        }
    );

}


/* ==========================================
   CREATE ID
========================================== */

function createId() {

    return (

        "table_" +

        Date.now() +

        "_" +

        Math.random()
            .toString(36)
            .substring(2, 8)

    );

}


/* ==========================================
   ESCAPE HTML
========================================== */

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