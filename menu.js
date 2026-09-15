/* ==========================================
   RESTAURANTPRO
   MENU MANAGEMENT
========================================== */

const CATEGORY_KEY = "restaurantpro_categories";
const FOOD_KEY = "restaurantpro_foods";


let editingCategoryId = null;
let editingFoodId = null;


/* ==========================================
   INITIALIZE
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    initializeMenu();

    renderCategories();
    renderCategoryFilter();
    renderFoodItems();

    setupSearch();

});


function initializeMenu() {

    if (!localStorage.getItem(CATEGORY_KEY)) {

        localStorage.setItem(
            CATEGORY_KEY,
            JSON.stringify([])
        );

    }

    if (!localStorage.getItem(FOOD_KEY)) {

        localStorage.setItem(
            FOOD_KEY,
            JSON.stringify([])
        );

    }

}


/* ==========================================
   DATA FUNCTIONS
========================================== */

function getCategories() {

    return JSON.parse(
        localStorage.getItem(CATEGORY_KEY)
    ) || [];

}


function getFoods() {

    return JSON.parse(
        localStorage.getItem(FOOD_KEY)
    ) || [];

}


function saveCategories(categories) {

    localStorage.setItem(
        CATEGORY_KEY,
        JSON.stringify(categories)
    );

}


function saveFoods(foods) {

    localStorage.setItem(
        FOOD_KEY,
        JSON.stringify(foods)
    );

}


/* ==========================================
   SEARCH
========================================== */

function setupSearch() {

    const search = document.getElementById("menuSearch");

    const filter = document.getElementById("categoryFilter");


    if (search) {

        search.addEventListener(
            "input",
            renderFoodItems
        );

    }


    if (filter) {

        filter.addEventListener(
            "change",
            renderFoodItems
        );

    }

}


/* ==========================================
   CATEGORY RENDER
========================================== */

function renderCategories() {

    const container =
        document.getElementById(
            "categoryContainer"
        );

    const count =
        document.getElementById(
            "categoryCount"
        );


    const categories =
        getCategories();


    container.innerHTML = "";


    count.textContent =
        categories.length +
        (
            categories.length === 1
                ? " Category"
                : " Categories"
        );


    if (categories.length === 0) {

        container.innerHTML = `

            <div class="empty-menu">

                <div>📂</div>

                <h3>
                    No Categories Yet
                </h3>

                <p>
                    Create your first category.
                </p>

            </div>

        `;

        return;

    }


    categories.forEach(function (category) {

        const foodCount =
            getFoods().filter(function (food) {

                return food.categoryId === category.id;

            }).length;


        const card =
            document.createElement("div");


        card.className =
            "category-card";


        card.innerHTML = `

            <div class="category-icon">
                ${escapeHTML(category.icon)}
            </div>


            <div class="category-info">

                <h3>
                    ${escapeHTML(category.name)}
                </h3>

                <span>
                    ${foodCount}
                    ${foodCount === 1 ? " item" : " items"}
                </span>

            </div>


            <div class="category-actions">

                <button
                    type="button"
                    onclick="editCategory('${category.id}')"
                    title="Edit">

                    ✏️

                </button>


                <button
                    type="button"
                    onclick="deleteCategory('${category.id}')"
                    title="Delete">

                    🗑️

                </button>

            </div>

        `;


        container.appendChild(card);

    });

}


/* ==========================================
   CATEGORY FILTER
========================================== */

function renderCategoryFilter() {

    const filter =
        document.getElementById(
            "categoryFilter"
        );


    const currentValue =
        filter.value;


    filter.innerHTML = `

        <option value="all">
            All Categories
        </option>

    `;


    getCategories().forEach(
        function (category) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                category.id;


            option.textContent =
                category.name;


            filter.appendChild(option);

        }
    );


    const exists =
        [...filter.options].some(
            function (option) {

                return option.value ===
                    currentValue;

            }
        );


    if (exists) {

        filter.value =
            currentValue;

    }

}


/* ==========================================
   FOOD RENDER
========================================== */

function renderFoodItems() {

    const container =
        document.getElementById(
            "foodContainer"
        );


    const count =
        document.getElementById(
            "foodItemCount"
        );


    const searchInput =
        document.getElementById(
            "menuSearch"
        );


    const filter =
        document.getElementById(
            "categoryFilter"
        );


    const search =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const selectedCategory =
        filter
            ? filter.value
            : "all";


    let foods =
        getFoods();


    /* SEARCH */

    if (search) {

        foods =
            foods.filter(function (food) {

                return food.name
                    .toLowerCase()
                    .includes(search);

            });

    }


    /* CATEGORY FILTER */

    if (selectedCategory !== "all") {

        foods =
            foods.filter(function (food) {

                return food.categoryId ===
                    selectedCategory;

            });

    }


    container.innerHTML = "";


    count.textContent =
        foods.length +
        (
            foods.length === 1
                ? " Item"
                : " Items"
        );


    if (foods.length === 0) {

        container.innerHTML = `

            <div class="empty-menu">

                <div>🍽️</div>

                <h3>
                    No Food Items Found
                </h3>

                <p>
                    Add your first food item.
                </p>

            </div>

        `;

        return;

    }


    foods.forEach(function (food) {

        const category =
            getCategories().find(
                function (item) {

                    return item.id ===
                        food.categoryId;

                }
            );


        const categoryName =
            category
                ? category.name
                : "Unknown Category";


        let priceHTML = "";


        food.options.forEach(
            function (option) {

                priceHTML += `

                    <div class="price-row">

                        <span>
                            ${escapeHTML(option.name)}
                        </span>

                        <strong>
                            Rs.
                            ${Number(option.price)
                                .toLocaleString()}
                        </strong>

                    </div>

                `;

            }
        );


        const card =
            document.createElement("div");


        card.className =
            "food-card";


        card.innerHTML = `

            <div class="food-card-top">

                <div class="food-icon">
                    ${escapeHTML(food.icon || "🍽️")}
                </div>


                <div class="food-actions">

                    <button
                        type="button"
                        onclick="editFood('${food.id}')"
                        title="Edit">

                        ✏️

                    </button>


                    <button
                        type="button"
                        onclick="deleteFood('${food.id}')"
                        title="Delete">

                        🗑️

                    </button>

                </div>

            </div>


            <h3>
                ${escapeHTML(food.name)}
            </h3>


            <span class="food-category">
                ${escapeHTML(categoryName)}
            </span>


            ${
                food.description
                    ? `
                        <p class="food-description">
                            ${escapeHTML(food.description)}
                        </p>
                      `
                    : ""
            }


            <div class="price-list">

                ${priceHTML}

            </div>

        `;


        container.appendChild(card);

    });

}


/* ==========================================
   CATEGORY MODAL
========================================== */

function openCategoryModal() {

    editingCategoryId = null;


    document.getElementById(
        "categoryModalTitle"
    ).textContent =
        "Add Category";


    document.getElementById(
        "categoryName"
    ).value = "";


    document.getElementById(
        "categoryIcon"
    ).value = "";


    document.getElementById(
        "categoryModal"
    ).classList.add("show");


    setTimeout(function () {

        document.getElementById(
            "categoryName"
        ).focus();

    }, 100);

}


function closeCategoryModal() {

    document.getElementById(
        "categoryModal"
    ).classList.remove("show");

}


/* ==========================================
   SAVE CATEGORY
========================================== */

function saveCategory() {

    const name =
        document.getElementById(
            "categoryName"
        ).value.trim();


    const icon =
        document.getElementById(
            "categoryIcon"
        ).value.trim();


    if (!name) {

        alert(
            "Please enter category name."
        );

        return;

    }


    const categories =
        getCategories();


    /* EDIT */

    if (editingCategoryId) {

        const category =
            categories.find(
                function (item) {

                    return item.id ===
                        editingCategoryId;

                }
            );


        if (category) {

            category.name =
                name;

            category.icon =
                icon || "🍽️";

        }

    }


    /* ADD */

    else {

        categories.push({

            id:
                "cat_" +
                Date.now() +
                "_" +
                Math.random()
                    .toString(36)
                    .substring(2, 7),

            name:
                name,

            icon:
                icon || "🍽️"

        });

    }


    saveCategories(categories);


    closeCategoryModal();


    renderCategories();
    renderCategoryFilter();
    renderFoodItems();

}


/* ==========================================
   EDIT CATEGORY
========================================== */

function editCategory(id) {

    const category =
        getCategories().find(
            function (item) {

                return item.id === id;

            }
        );


    if (!category) {

        return;

    }


    editingCategoryId =
        id;


    document.getElementById(
        "categoryModalTitle"
    ).textContent =
        "Edit Category";


    document.getElementById(
        "categoryName"
    ).value =
        category.name;


    document.getElementById(
        "categoryIcon"
    ).value =
        category.icon;


    document.getElementById(
        "categoryModal"
    ).classList.add("show");

}


/* ==========================================
   DELETE CATEGORY
========================================== */

function deleteCategory(id) {

    const categories =
        getCategories();


    const category =
        categories.find(
            function (item) {

                return item.id === id;

            }
        );


    if (!category) {

        return;

    }


    const foodItems =
        getFoods().filter(
            function (food) {

                return food.categoryId === id;

            }
        );


    let message =
        "Delete category '" +
        category.name +
        "'?";


    if (foodItems.length > 0) {

        message +=
            "\n\nThis will also delete " +
            foodItems.length +
            " food item(s) in this category.";

    }


    const confirmed =
        confirm(message);


    if (!confirmed) {

        return;

    }


    const updatedCategories =
        categories.filter(
            function (item) {

                return item.id !== id;

            }
        );


    saveCategories(
        updatedCategories
    );


    const updatedFoods =
        getFoods().filter(
            function (food) {

                return food.categoryId !== id;

            }
        );


    saveFoods(updatedFoods);


    renderCategories();
    renderCategoryFilter();
    renderFoodItems();

}


/* ==========================================
   FOOD MODAL
========================================== */

function openFoodModal() {

    const categories =
        getCategories();


    if (categories.length === 0) {

        alert(
            "Please create a category first."
        );

        openCategoryModal();

        return;

    }


    editingFoodId = null;


    document.getElementById(
        "foodModalTitle"
    ).textContent =
        "Add Food Item";


    document.getElementById(
        "foodName"
    ).value = "";


    document.getElementById(
        "foodDescription"
    ).value = "";


    loadFoodCategories();


    document.getElementById(
        "priceOptionsContainer"
    ).innerHTML = "";


    addPriceOption();


    document.getElementById(
        "foodModal"
    ).classList.add("show");


    setTimeout(function () {

        document.getElementById(
            "foodName"
        ).focus();

    }, 100);

}


function closeFoodModal() {

    document.getElementById(
        "foodModal"
    ).classList.remove("show");

}


/* ==========================================
   FOOD CATEGORY SELECT
========================================== */

function loadFoodCategories(
    selectedId = ""
) {

    const select =
        document.getElementById(
            "foodCategory"
        );


    select.innerHTML = "";


    const categories =
        getCategories();


    categories.forEach(
        function (category) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                category.id;


            option.textContent =
                category.name;


            if (
                category.id ===
                selectedId
            ) {

                option.selected =
                    true;

            }


            select.appendChild(
                option
            );

        }
    );

}


/* ==========================================
   ADD PRICE OPTION
========================================== */

function addPriceOption(
    optionName = "",
    optionPrice = ""
) {

    const container =
        document.getElementById(
            "priceOptionsContainer"
        );


    const row =
        document.createElement(
            "div"
        );


    row.className =
        "price-option-row";


    row.innerHTML = `

        <input
            type="text"
            class="option-name"
            placeholder="Example: Half / Full / 1 KG"
            value="${escapeAttribute(optionName)}"
        >


        <input
            type="number"
            class="option-price"
            placeholder="Price"
            min="0"
            step="1"
            value="${escapeAttribute(optionPrice)}"
        >


        <button
            type="button"
            class="remove-option"
            title="Remove">

            🗑️

        </button>

    `;


    row.querySelector(
        ".remove-option"
    ).addEventListener(
        "click",
        function () {

            row.remove();

        }
    );


    container.appendChild(row);

}


/* ==========================================
   SAVE FOOD
========================================== */

function saveFoodItem() {

    const name =
        document.getElementById(
            "foodName"
        ).value.trim();


    const categoryId =
        document.getElementById(
            "foodCategory"
        ).value;


    const description =
        document.getElementById(
            "foodDescription"
        ).value.trim();


    const rows =
        document.querySelectorAll(
            ".price-option-row"
        );


    const options = [];


    rows.forEach(
        function (row) {

            const optionName =
                row.querySelector(
                    ".option-name"
                ).value.trim();


            const optionPrice =
                row.querySelector(
                    ".option-price"
                ).value;


            if (
                optionName &&
                optionPrice !== "" &&
                Number(optionPrice) >= 0
            ) {

                options.push({

                    name:
                        optionName,

                    price:
                        Number(optionPrice)

                });

            }

        }
    );


    if (!name) {

        alert(
            "Please enter food item name."
        );

        return;

    }


    if (!categoryId) {

        alert(
            "Please select a category."
        );

        return;

    }


    if (options.length === 0) {

        alert(
            "Please add at least one price option."
        );

        return;

    }


    const foods =
        getFoods();


    /* EDIT */

    if (editingFoodId) {

        const food =
            foods.find(
                function (item) {

                    return item.id ===
                        editingFoodId;

                }
            );


        if (food) {

            food.name =
                name;

            food.categoryId =
                categoryId;

            food.description =
                description;

            food.options =
                options;

        }

    }


    /* ADD */

    else {

        foods.push({

            id:
                "food_" +
                Date.now() +
                "_" +
                Math.random()
                    .toString(36)
                    .substring(2, 7),

            name:
                name,

            categoryId:
                categoryId,

            description:
                description,

            icon:
                "🍽️",

            options:
                options

        });

    }


    saveFoods(foods);


    closeFoodModal();


    renderCategories();
    renderFoodItems();

}


/* ==========================================
   EDIT FOOD
========================================== */

function editFood(id) {

    const food =
        getFoods().find(
            function (item) {

                return item.id === id;

            }
        );


    if (!food) {

        return;

    }


    editingFoodId =
        id;


    document.getElementById(
        "foodModalTitle"
    ).textContent =
        "Edit Food Item";


    document.getElementById(
        "foodName"
    ).value =
        food.name;


    document.getElementById(
        "foodDescription"
    ).value =
        food.description || "";


    loadFoodCategories(
        food.categoryId
    );


    const container =
        document.getElementById(
            "priceOptionsContainer"
        );


    container.innerHTML = "";


    food.options.forEach(
        function (option) {

            addPriceOption(
                option.name,
                option.price
            );

        }
    );


    document.getElementById(
        "foodModal"
    ).classList.add("show");

}


/* ==========================================
   DELETE FOOD
========================================== */

function deleteFood(id) {

    const foods =
        getFoods();


    const food =
        foods.find(
            function (item) {

                return item.id === id;

            }
        );


    if (!food) {

        return;

    }


    const confirmed =
        confirm(
            "Delete '" +
            food.name +
            "'?"
        );


    if (!confirmed) {

        return;

    }


    const updatedFoods =
        foods.filter(
            function (item) {

                return item.id !== id;

            }
        );


    saveFoods(
        updatedFoods
    );


    renderCategories();
    renderFoodItems();

}


/* ==========================================
   ESCAPE HTML
========================================== */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function escapeAttribute(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

}


/* ==========================================
   CLOSE MODALS ON BACKDROP CLICK
========================================== */

document.addEventListener(
    "click",
    function (event) {

        if (
            event.target.id ===
            "categoryModal"
        ) {

            closeCategoryModal();

        }


        if (
            event.target.id ===
            "foodModal"
        ) {

            closeFoodModal();

        }

    }
);


/* ==========================================
   ESC KEY
========================================== */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key !== "Escape") {

            return;

        }


        closeCategoryModal();
        closeFoodModal();

    }
);