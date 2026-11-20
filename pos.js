// POS - FIXED - Menu from Supabase
const SUPABASE_URL = "https://ryixnwawmtglcibjmhjh.supabase.co";
const SUPABASE_KEY = "sb_publishable_zcD4aBCDk1yz8RFD1JoBqA_aToCuo7k";
let supabaseClient = null;
if (window.supabase) supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function getRestaurantId(){
  return localStorage.getItem("restaurantpro_restaurant_id") || localStorage.getItem("restaurant_id") || localStorage.getItem("currentRestaurantId");
}

let allFoods = [];
let allCategories = [];
let selectedCategory = "all";
let cart = [];
let selectedPayment = "cash";
let pendingFood = null;

document.addEventListener("DOMContentLoaded", async () => {
  const rid = getRestaurantId();
  if(!rid){ window.location.href="login.html"; return; }
  await loadPOSData();
  setupPOSListeners();
});

function setupPOSListeners(){
  const search = document.getElementById("posSearch");
  if(search) search.addEventListener("input", () => renderProducts());
  const disc = document.getElementById("discount");
  if(disc) disc.addEventListener("input", updateBill);
  const tax = document.getElementById("taxRate");
  if(tax) tax.addEventListener("input", updateBill);
  document.querySelectorAll(".payment-method").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      document.querySelectorAll(".payment-method").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      selectedPayment = btn.dataset.payment;
    });
  });
  const orderType = document.getElementById("orderType");
  if(orderType) orderType.addEventListener("change", ()=>{
    document.getElementById("tableField").style.display = orderType.value==="dine-in" ? "block" : "none";
  });
}

async function loadPOSData(){
  const rid = getRestaurantId();
  const { data: cats } = await supabaseClient.from("categories").select("*").eq("restaurant_id", rid).order("created_at");
  const { data: foods } = await supabaseClient.from("menu_items").select("*").eq("restaurant_id", rid).order("created_at", {ascending:false});
  allCategories = cats || [];
  allFoods = foods || [];
  renderCategories();
  renderProducts();
  try{
    const { data: custs } = await supabaseClient.from("customers").select("phone").eq("restaurant_id", rid);
    const list = document.getElementById("customerPhoneList");
    if(list && custs) list.innerHTML = custs.map(c=>`<option value="${c.phone}">`).join("");
  }catch(e){}
}

function renderCategories(){
  const wrap = document.getElementById("posCategories");
  if(!wrap) return;
  let html = `<button class="pos-cat-btn ${selectedCategory==="all"?"active":""}" onclick="filterCategory('all')">All</button>`;
  allCategories.forEach(c=>{
    html += `<button class="pos-cat-btn ${selectedCategory===c.id?"active":""}" onclick="filterCategory('${c.id}')">${c.name}</button>`;
  });
  wrap.innerHTML = html;
}
function filterCategory(id){ selectedCategory = id; renderCategories(); renderProducts(); }

function renderProducts(){
  const box = document.getElementById("posProducts");
  if(!box) return;
  const q = (document.getElementById("posSearch")?.value || "").toLowerCase();
  let list = allFoods.filter(f => (selectedCategory==="all" || f.category_id===selectedCategory) && f.name.toLowerCase().includes(q));
  if(list.length===0){ box.innerHTML = `<p style="padding:20px">No items found. Please add items in Menu first.</p>`; return; }
  box.innerHTML = list.map(f=>{
    const opts = f.options || [];
    const firstPrice = opts.length ? opts[0].price : 0;
    return `<div class="pos-product-card" onclick="openPriceModal('${f.id}')">
      <div class="pos-product-emoji">🍽️</div>
      <h4>${f.name}</h4>
      <span>${opts.length ? opts.map(o=>o.name).join(" / ") : ""}</span>
      <strong>Rs. ${Number(firstPrice).toLocaleString()}</strong>
    </div>`;
  }).join("");
}

function openPriceModal(foodId){
  const food = allFoods.find(f=>String(f.id)===String(foodId));
  if(!food) return;
  pendingFood = food;
  const opts = food.options || [];
  document.getElementById("priceModalFoodName").textContent = food.name;
  const box = document.getElementById("priceOptions");
  if(opts.length===0){
    addToCart(food, {name:"Standard", price:0});
    return;
  }
  if(opts.length===1){ addToCart(food, opts[0]); return; }
  box.innerHTML = opts.map(o=>`<button class="price-option-btn" onclick="selectPriceOption('${o.name}', ${o.price})">${o.name} - Rs. ${Number(o.price).toLocaleString()}</button>`).join("");
  document.getElementById("priceModal").classList.add("show");
  document.getElementById("priceModal").style.display = "flex";
}
function selectPriceOption(name, price){
  if(pendingFood) addToCart(pendingFood, {name, price});
  closePriceModal();
}
function closePriceModal(){
  const m = document.getElementById("priceModal");
  if(m){ m.classList.remove("show"); m.style.display="none"; }
}

function addToCart(food, opt){
  const found = cart.find(i=>i.foodId===food.id && i.variant===opt.name);
  if(found) found.qty++;
  else cart.push({foodId:food.id, name:food.name, variant:opt.name, price:Number(opt.price), qty:1});
  renderCart();
}

function renderCart(){
  const box = document.getElementById("cartItems");
  document.getElementById("cartItemCount").textContent = cart.reduce((s,i)=>s+i.qty,0) + " items";
  if(cart.length===0){ box.innerHTML = `<p style="text-align:center;color:#999;padding:20px">Cart is empty</p>`; updateBill(); return; }
  box.innerHTML = cart.map((item,idx)=>`
    <div class="cart-item">
      <div><strong>${item.name}</strong><br><small>${item.variant} - Rs. ${item.price}</small></div>
      <div class="qty-controls">
        <button onclick="changeQty(${idx},-1)">-</button><span>${item.qty}</span><button onclick="changeQty(${idx},1)">+</button>
      </div>
      <strong>Rs. ${(item.price*item.qty).toLocaleString()}</strong>
      <button onclick="removeCartItem(${idx})">×</button>
    </div>`).join("");
  updateBill();
}
function changeQty(idx, d){
  cart[idx].qty += d;
  if(cart[idx].qty<=0) cart.splice(idx,1);
  renderCart();
}
function removeCartItem(idx){ cart.splice(idx,1); renderCart(); }
function clearCart(){ cart=[]; renderCart(); }

function updateBill(){
  const sub = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const disc = Number(document.getElementById("discount")?.value || 0);
  const taxRate = Number(document.getElementById("taxRate")?.value || 0);
  const taxAmt = (sub - disc) * taxRate / 100;
  const grand = sub - disc + taxAmt;
  document.getElementById("subtotal").textContent = "Rs. " + sub.toLocaleString();
  document.getElementById("taxAmount").textContent = "Rs. " + Math.round(taxAmt).toLocaleString();
  document.getElementById("grandTotal").textContent = "Rs. " + Math.round(grand).toLocaleString();
  return {sub, disc, taxAmt, grand};
}

async function completeOrder(){
  if(cart.length===0){ alert("Cart is empty!"); return; }
  if(!confirm("Are you sure you want to complete this order?")) return;
  const rid = getRestaurantId();
  const {sub, disc, taxAmt, grand} = updateBill();
  const orderData = {
    restaurant_id: rid,
    order_type: document.getElementById("orderType").value,
    table_no: document.getElementById("tableNumber").value || null,
    customer_name: document.getElementById("customerName").value || "Walk-in",
    customer_phone: document.getElementById("customerPhone").value || null,
    items: cart,
    subtotal: sub, discount: disc, tax: taxAmt, total: grand,
    payment_method: selectedPayment,
    status: "pending",
    created_at: new Date().toISOString()
  };
  const { error } = await supabaseClient.from("orders").insert([orderData]);
  if(error){ alert("Order could not be saved: " + error.message); return; }
  // Print bill first, then clear cart
  printCurrentBill(orderData);
  alert("Order Completed! Sent to Kitchen. Total: Rs. " + Math.round(grand).toLocaleString());
  clearCart();
  document.getElementById("customerName").value="";
  document.getElementById("customerPhone").value="";
}

// PRINT - Only bill will print, not full page - ENGLISH
function printCurrentBill(lastOrder){
  const order = lastOrder || {
    customer_name: document.getElementById("customerName")?.value || "Walk-in",
    table_no: document.getElementById("tableNumber")?.value || "-",
    order_type: document.getElementById("orderType")?.value || "",
    payment_method: selectedPayment
  };
  if(cart.length===0 && !lastOrder){ alert("Please add items first"); return; }
  const {sub, disc, taxAmt, grand} = updateBill();
  const itemsHtml = cart.map(i=>`
    <tr><td>${i.name} (${i.variant})<br><small>${i.qty} x Rs.${i.price}</small></td>
    <td style="text-align:right">Rs.${(i.price*i.qty).toLocaleString()}</td></tr>`).join("");
  const billHtml = `
    <h2>RestaurantPro</h2>
    <p>Restaurant Management</p>
    <hr>
    <p style="text-align:left">Customer: ${order.customer_name}<br>
    Table: ${order.table_no} | Type: ${order.order_type}<br>
    Date: ${new Date().toLocaleString()}<br>
    Payment: ${order.payment_method}</p>
    <hr>
    <table>${itemsHtml}</table>
    <hr>
    <table>
      <tr><td>Subtotal</td><td style="text-align:right">Rs.${sub.toLocaleString()}</td></tr>
      <tr><td>Discount</td><td style="text-align:right">Rs.${disc}</td></tr>
      <tr><td>Tax</td><td style="text-align:right">Rs.${Math.round(taxAmt)}</td></tr>
      <tr><td><b>Grand Total</b></td><td style="text-align:right"><b>Rs.${Math.round(grand).toLocaleString()}</b></td></tr>
    </table>
    <hr>
    <p>Thank You! Visit Again</p>
  `;
  let area = document.getElementById("printBillArea");
  if(!area){
    area = document.createElement("div");
    area.id = "printBillArea";
    area.style.display = "none";
    document.body.appendChild(area);
  }
  area.innerHTML = billHtml;
  setTimeout(()=> window.print(), 200);
}

// LOGOUT - ENGLISH ONLY
async function doLogout(){
  if(!confirm("Are you sure you want to logout?")) return;
  try{ await supabaseClient.auth.signOut(); }catch(e){ console.log(e); }
  localStorage.clear();
  sessionStorage.clear();
  window.location.replace("login.html");
}
