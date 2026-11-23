const SETTINGS_KEY = "restaurantpro_settings";

document.addEventListener("DOMContentLoaded", function () {
    setupLogo();
    loadSettings();
    setupRestaurantForm();
    setupSystemForm();
    setupClearData();
    syncSidebar();
});

function getSettings() {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (!saved) {
        return { restaurantName: "RestaurantPro", restaurantPhone: "", restaurantAddress: "", currency: "PKR", taxRate: 0, orderPrefix: "ORD-", tableCount: 20 };
    }
    try { return JSON.parse(saved); } catch (e) { return {}; }
}

function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    // FIX: Dono jagah sync karo taake pos.html ko bhi mil jaye
    if (settings.restaurantName) localStorage.setItem("restaurantpro_restaurant_name", settings.restaurantName);
    if (settings.restaurantPhone !== undefined) localStorage.setItem("restaurantpro_phone", settings.restaurantPhone);
    if (settings.restaurantAddress !== undefined) localStorage.setItem("restaurantpro_address", settings.restaurantAddress);
    syncSidebar();
}

function syncSidebar(){
    const s = getSettings();
    const name = localStorage.getItem("restaurantpro_restaurant_name") || s.restaurantName;
    const logo = localStorage.getItem("restaurantpro_logo");
    const nameEl = document.getElementById("sidebarRestName");
    if(nameEl && name) nameEl.textContent = name;
    const img = document.getElementById("sidebarLogoImg");
    const em = document.getElementById("sidebarEmoji");
    if(img && logo){ img.src = logo; img.style.display = "block"; if(em) em.style.display = "none"; }
}

function loadSettings() {
    const settings = getSettings();
    // Agar pos.html wali keys me naam hai to wahan se bhi le lo
    const directName = localStorage.getItem("restaurantpro_restaurant_name");
    if(directName && !settings.restaurantName) settings.restaurantName = directName;

    const map = {
        restaurantName: "restaurantName",
        restaurantPhone: "restaurantPhone",
        restaurantAddress: "restaurantAddress",
        currency: "currency",
        taxRate: "taxRate",
        orderPrefix: "orderPrefix",
        tableCount: "tableCount"
    };
    for(let key in map){
        const el = document.getElementById(map[key]);
        if(el && settings[key] !== undefined) el.value = settings[key];
    }
    // Sidebar naam
    syncSidebar();
}

function setupRestaurantForm() {
    const form = document.getElementById("restaurantSettingsForm");
    if (!form) return;
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const settings = getSettings();
        settings.restaurantName = document.getElementById("restaurantName").value.trim();
        settings.restaurantPhone = document.getElementById("restaurantPhone").value.trim();
        settings.restaurantAddress = document.getElementById("restaurantAddress").value.trim();
        if (!settings.restaurantName) { alert("Please enter restaurant name."); return; }
        saveSettings(settings);
        alert("Restaurant information saved successfully. Ab bill me yehi Naam + Logo aayega.");
    });
}

function setupSystemForm() {
    const form = document.getElementById("systemSettingsForm");
    if (!form) return;
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const settings = getSettings();
        const tax = Number(document.getElementById("taxRate").value);
        const tables = Number(document.getElementById("tableCount").value);
        if (!Number.isFinite(tax) || tax < 0 || tax > 100) { alert("Please enter a valid tax rate between 0 and 100."); return; }
        if (!Number.isInteger(tables) || tables < 1) { alert("Please enter a valid number of tables."); return; }
        settings.currency = document.getElementById("currency").value;
        settings.taxRate = tax;
        settings.orderPrefix = document.getElementById("orderPrefix").value.trim();
        settings.tableCount = tables;
        saveSettings(settings);
        alert("System settings saved successfully.");
    });
}

function setupClearData() {
    const button = document.getElementById("clearDataButton");
    if (!button) return;
    button.addEventListener("click", function () {
        if (!confirm("Are you sure you want to clear all RestaurantPro data? This action cannot be undone.")) return;
        if (!confirm("This will delete menu, orders, customers, expenses and settings. Continue?")) return;
        // FIX: Clear All Data dabane pe bhi restaurant ka naam/logo bachana ho to neeche wali 3 lines rehne do
        // Agar poora clear chahiye to localStorage.clear() wapis laga do
        localStorage.clear();
        alert("All RestaurantPro data has been cleared.");
        location.reload();
    });
}

function setupLogo() {
    const logoInput = document.getElementById("restaurantLogo");
    const logoPreview = document.getElementById("logoPreview");
    const logoPlaceholder = document.getElementById("logoPlaceholder");
    const removeButton = document.getElementById("removeLogoButton");
    if(!logoInput) return;

    const savedLogo = localStorage.getItem("restaurantpro_logo");
    if (savedLogo && logoPreview) {
        logoPreview.src = savedLogo;
        logoPreview.style.display = "block";
        if(logoPlaceholder) logoPlaceholder.style.display = "none";
    }

    logoInput.addEventListener("change", function () {
        const file = logoInput.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) { alert("Please select an image file."); logoInput.value = ""; return; }
        const reader = new FileReader();
        reader.onload = function (event) {
            const logo = event.target.result;
            if(logoPreview){ logoPreview.src = logo; logoPreview.style.display = "block"; }
            if(logoPlaceholder) logoPlaceholder.style.display = "none";
            // Logo turant save - Optional hai, agar nahi lagaya to khali rahega
            localStorage.setItem("restaurantpro_logo", logo);
            syncSidebar();
        };
        reader.readAsDataURL(file);
    });

    if(removeButton){
        removeButton.addEventListener("click", function () {
            localStorage.removeItem("restaurantpro_logo");
            if(logoPreview){ logoPreview.src = ""; logoPreview.style.display = "none"; }
            if(logoPlaceholder) logoPlaceholder.style.display = "block";
            logoInput.value = "";
            syncSidebar();
            alert("Logo hata diya gaya! Ab bill pe sirf Naam aayega.");
        });
    }
}
