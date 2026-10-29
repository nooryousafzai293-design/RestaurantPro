/* ==========================================
   RESTAURANTPRO - MENU WITH SUPABASE - FIXED
========================================== */
const SUPABASE_URL = "https://ryixnwawmtglcibjmhjh.supabase.co";
const SUPABASE_KEY = "sb_publishable_zcD4aBCDk1yz8RFD1JoBqA_aToCuo7k";

let supabaseClient;
if (window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

let editingCategoryId = null;
let editingFoodId = null;

function getRestaurantId() {
  return localStorage.getItem("restaurantpro_restaurant_id") || localStorage.getItem("restaurant_id");
}

document.addEventListener("DOMContentLoaded", function () {
    const RID = getRestaurantId();
    if(!RID){ location.href="login.html"; return; }
    renderCategories();
    renderCategoryFilter();
    renderFoodItems();
    setupSearch();
});

function setupSearch(){
    const search=document.getElementById("menuSearch");
    const filter=document.getElementById("categoryFilter");
    if(search) search.addEventListener("input", renderFoodItems);
    if(filter) filter.addEventListener("change", renderFoodItems);
}

/* CATEGORIES */
async function getCategories(){
    const RID = getRestaurantId();
    const {data} = await supabaseClient.from("categories").select("*").eq("restaurant_id", RID).order("created_at");
    return data || [];
}
async function renderCategories(){
    const container=document.getElementById("categoryContainer");
    const count=document.getElementById("categoryCount");
    const categories=await getCategories();
    container.innerHTML="";
    count.textContent=categories.length + (categories.length===1?" Category":" Categories");
    if(categories.length===0){
        container.innerHTML=`<div class="empty-menu"><div>📂</div><h3>No Categories Yet</h3><p>Create your first category.</p></div>`;
        return;
    }
    const foods=await getFoods();
    categories.forEach(function(category){
        const foodCount=foods.filter(f=>f.category_id===category.id).length;
        const card=document.createElement("div");
        card.className="category-card";
        card.innerHTML=`
            <div class="category-icon">${escapeHTML(category.icon)}</div>
            <div class="category-info"><h3>${escapeHTML(category.name)}</h3><span>${foodCount} ${foodCount===1?" item":" items"}</span></div>
            <div class="category-actions">
                <button type="button" onclick="editCategory('${category.id}')" title="Edit">✏️</button>
                <button type="button" onclick="deleteCategory('${category.id}')" title="Delete">🗑️</button>
            </div>`;
        container.appendChild(card);
    });
}
async function renderCategoryFilter(){
    const filter=document.getElementById("categoryFilter");
    if(!filter) return;
    const currentValue=filter.value;
    filter.innerHTML=`<option value="all">All Categories</option>`;
    const categories=await getCategories();
    categories.forEach(function(category){
        const option=document.createElement("option");
        option.value=category.id;
        option.textContent=category.name;
        filter.appendChild(option);
    });
    if([...filter.options].some(o=>o.value===currentValue)) filter.value=currentValue;
}

/* FOODS */
async function getFoods(){
    const RID = getRestaurantId();
    const {data} = await supabaseClient.from("menu_items").select("*").eq("restaurant_id", RID).order("created_at",{ascending:false});
    return data || [];
}
async function renderFoodItems(){
    const container=document.getElementById("foodContainer");
    const count=document.getElementById("foodItemCount");
    const search= (document.getElementById("menuSearch")?.value || "").toLowerCase().trim();
    const selectedCategory=document.getElementById("categoryFilter")?.value || "all";
    let foods=await getFoods();
    const categories=await getCategories();
    if(search) foods=foods.filter(f=>f.name.toLowerCase().includes(search));
    if(selectedCategory!=="all") foods=foods.filter(f=>f.category_id===selectedCategory);
    container.innerHTML="";
    count.textContent=foods.length + (foods.length===1?" Item":" Items");
    if(foods.length===0){
        container.innerHTML=`<div class="empty-menu"><div>🍽️</div><h3>No Food Items Found</h3><p>Add your first food item.</p></div>`;
        return;
    }
    foods.forEach(function(food){
        const category=categories.find(c=>c.id===food.category_id);
        const categoryName=category?category.name:"Unknown Category";
        let priceHTML="";
        (food.options||[]).forEach(function(option){
            priceHTML+=`<div class="price-row"><span>${escapeHTML(option.name)}</span><strong>Rs. ${Number(option.price).toLocaleString()}</strong></div>`;
        });
        const card=document.createElement("div");
        card.className="food-card";
        card.innerHTML=`
            <div class="food-card-top"><div class="food-icon">${escapeHTML(food.icon||"🍽️")}</div>
            <div class="food-actions"><button type="button" onclick="editFood('${food.id}')">✏️</button><button type="button" onclick="deleteFood('${food.id}')">🗑️</button></div></div>
            <h3>${escapeHTML(food.name)}</h3><span class="food-category">${escapeHTML(categoryName)}</span>
            ${food.description?`<p class="food-description">${escapeHTML(food.description)}</p>`:""}
            <div class="price-list">${priceHTML}</div>`;
        container.appendChild(card);
    });
}

/* MODALS */
function openCategoryModal(){ editingCategoryId=null; document.getElementById("categoryModalTitle").textContent="Add Category"; document.getElementById("categoryName").value=""; document.getElementById("categoryIcon").value=""; document.getElementById("categoryModal").classList.add("show"); }
function closeCategoryModal(){ document.getElementById("categoryModal").classList.remove("show"); }
async function saveCategory(){
    const RID = getRestaurantId();
    const name=document.getElementById("categoryName").value.trim();
    const icon=document.getElementById("categoryIcon").value.trim()||"🍽️";
    if(!name){ alert("Please enter category name."); return; }
    if(editingCategoryId){ await supabaseClient.from("categories").update({name,icon}).eq("id",editingCategoryId); }
    else{ await supabaseClient.from("categories").insert({restaurant_id:RID,name,icon}); }
    closeCategoryModal(); renderCategories(); renderCategoryFilter(); renderFoodItems();
}
async function editCategory(id){
    const {data} = await supabaseClient.from("categories").select("*").eq("id",id).single();
    if(!data) return;
    editingCategoryId=id;
    document.getElementById("categoryModalTitle").textContent="Edit Category";
    document.getElementById("categoryName").value=data.name;
    document.getElementById("categoryIcon").value=data.icon;
    document.getElementById("categoryModal").classList.add("show");
}
async function deleteCategory(id){
    const foods=await getFoods();
    const count=foods.filter(f=>f.category_id===id).length;
    if(!confirm("Delete category?"+(count>0?"\nThis will delete "+count+" items also.":""))) return;
    if(count>0) await supabaseClient.from("menu_items").delete().eq("category_id",id);
    await supabaseClient.from("categories").delete().eq("id",id);
    renderCategories(); renderCategoryFilter(); renderFoodItems();
}

async function openFoodModal(){
    const cats=await getCategories();
    if(cats.length===0){ alert("Please create a category first."); openCategoryModal(); return; }
    editingFoodId=null;
    document.getElementById("foodModalTitle").textContent="Add Food Item";
    document.getElementById("foodName").value=""; document.getElementById("foodDescription").value="";
    loadFoodCategories();
    document.getElementById("priceOptionsContainer").innerHTML="";
    addPriceOption();
    document.getElementById("foodModal").classList.add("show");
}
function closeFoodModal(){ document.getElementById("foodModal").classList.remove("show"); }
async function loadFoodCategories(selectedId=""){
    const select=document.getElementById("foodCategory");
    select.innerHTML="";
    const categories=await getCategories();
    categories.forEach(function(category){
        const option=document.createElement("option");
        option.value=category.id; option.textContent=category.name;
        if(category.id===selectedId) option.selected=true;
        select.appendChild(option);
    });
}
function addPriceOption(optionName="",optionPrice=""){
    const container=document.getElementById("priceOptionsContainer");
    const row=document.createElement("div");
    row.className="price-option-row";
    row.innerHTML=`<input type="text" class="option-name" placeholder="Half / Full" value="${escapeAttribute(optionName)}"><input type="number" class="option-price" placeholder="Price" min="0" step="1" value="${escapeAttribute(optionPrice)}"><button type="button" class="remove-option">🗑️</button>`;
    row.querySelector(".remove-option").addEventListener("click",function(){ row.remove(); });
    container.appendChild(row);
}
async function saveFoodItem(){
    const RID = getRestaurantId();
    const name=document.getElementById("foodName").value.trim();
    const categoryId=document.getElementById("foodCategory").value;
    const description=document.getElementById("foodDescription").value.trim();
    const rows=document.querySelectorAll(".price-option-row");
    const options=[];
    rows.forEach(function(row){
        const n=row.querySelector(".option-name").value.trim();
        const p=row.querySelector(".option-price").value;
        if(n && p!=="" && Number(p)>=0) options.push({name:n,price:Number(p)});
    });
    if(!name){ alert("Please enter food item name."); return; }
    if(!categoryId){ alert("Please select a category."); return; }
    if(options.length===0){ alert("Please add at least one price option."); return; }
    if(editingFoodId){ await supabaseClient.from("menu_items").update({name,category_id:categoryId,description,options}).eq("id",editingFoodId); }
    else{ await supabaseClient.from("menu_items").insert({restaurant_id:RID,name,category_id:categoryId,description,options,icon:"🍽️"}); }
    closeFoodModal(); renderFoodItems(); renderCategories();
}
async function editFood(id){
    const {data:food} = await supabaseClient.from("menu_items").select("*").eq("id",id).single();
    if(!food) return;
    editingFoodId=id;
    document.getElementById("foodModalTitle").textContent="Edit Food Item";
    document.getElementById("foodName").value=food.name;
    document.getElementById("foodDescription").value=food.description||"";
    await loadFoodCategories(food.category_id);
    const container=document.getElementById("priceOptionsContainer");
    container.innerHTML="";
    (food.options||[]).forEach(function(option){ addPriceOption(option.name,option.price); });
    document.getElementById("foodModal").classList.add("show");
}
async function deleteFood(id){
    if(!confirm("Delete this food?")) return;
    await supabaseClient.from("menu_items").delete().eq("id",id);
    renderCategories(); renderFoodItems();
}
function escapeHTML(value){ return String(value).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"); }
function escapeAttribute(value){ return String(value).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#039;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
document.addEventListener("click",function(event){ if(event.target.id==="categoryModal") closeCategoryModal(); if(event.target.id==="foodModal") closeFoodModal(); });
document.addEventListener("keydown",function(event){ if(event.key!=="Escape") return; closeCategoryModal(); closeFoodModal(); });
