// Dashboard - Live Supabase
const SB_URL = "https://ryixnwawmtglcibjmhjh.supabase.co";
const SB_KEY = "sb_publishable_zcD4aBCDk1yz8RFD1JoBqA_aToCuo7k";
let sbDash = null;
if(window.supabase) sbDash = window.supabase.createClient(SB_URL, SB_KEY);

function getRid(){
  return localStorage.getItem("restaurantpro_restaurant_id") || localStorage.getItem("restaurant_id") || localStorage.getItem("currentRestaurantId");
}

document.addEventListener("DOMContentLoaded", loadDashboard);

async function loadDashboard(){
  if(!sbDash) return;

  const rid = getRid();
  // 1. Menu Items + Tables
  let menuQ = sbDash.from("menu_items").select("id");
  let tableQ = sbDash.from("tables").select("id");
  let orderQ = sbDash.from("orders").select("*").order("created_at", {ascending:false});
  if(rid){
    menuQ = menuQ.eq("restaurant_id", rid);
    tableQ = tableQ.eq("restaurant_id", rid);
    orderQ = orderQ.eq("restaurant_id", rid);
  }
  const { data: menu } = await menuQ;
  const { data: tables } = await tableQ;
  const { data: orders, error } = await orderQ;
  if(error){ console.log("Dashboard Error:", error.message); return; }

  const all = orders || [];
  document.getElementById("menuCount").textContent = menu ? menu.length : 0;
  document.getElementById("tablesCount").textContent = tables ? tables.length : 0;

  // 2. Today's Sales - Pakistan date ke hisab se
  const todayPK = new Date().toLocaleDateString('en-CA', {timeZone:'Asia/Karachi'}); // YYYY-MM-DD
  const todays = all.filter(o => {
    const d = new Date(o.created_at).toLocaleDateString('en-CA', {timeZone:'Asia/Karachi'});
    return d === todayPK;
  });
  const sales = todays.reduce((s,o)=> s + Number(o.total||0), 0);
  document.getElementById("todaysSales").textContent = "Rs. " + sales.toLocaleString();
  document.getElementById("todaysOrders").textContent = todays.length;

  // 3. Order Status - New=pending, Preparing, Ready, Completed
  const c = (st) => all.filter(o => (o.status||"pending").toLowerCase() === st).length;
  document.getElementById("newOrders").textContent = c("pending");
  document.getElementById("preparingOrders").textContent = c("preparing");
  document.getElementById("readyOrders").textContent = c("ready");
  document.getElementById("completedOrders").textContent = c("completed");

  // 4. Recent Orders
  const recentEl = document.getElementById("recentOrders");
  if(all.length===0){
    recentEl.innerHTML = "<p style='padding:15px;color:#888'>No orders yet. POS se pehla order karo.</p>";
  } else {
    recentEl.innerHTML = all.slice(0,5).map(o=>`
      <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #eee;">
        <div><b>${o.customer_name||"Walk-in"}</b><br><small>${o.order_type||""} • ${o.status||"pending"} • ${new Date(o.created_at).toLocaleTimeString()}</small></div>
        <b>Rs.${Number(o.total||0).toLocaleString()}</b>
      </div>`).join("");
  }

  // 5. Popular Items - orders ke andar se items nikal ke
  let popular = {};
  all.forEach(o=>{
    let items = o.items;
    if(typeof items==="string"){ try{ items=JSON.parse(items); }catch(e){ items=[]; } }
    (items||[]).forEach(it=>{
      const key = it.name + (it.variant ? " ("+it.variant+")" : "");
      popular[key] = (popular[key]||0) + Number(it.qty||1);
    });
  });
  let sorted = Object.entries(popular).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const popEl = document.getElementById("popularItems");
  if(sorted.length===0){
    popEl.innerHTML = "<p style='padding:15px;color:#888'>No sales yet.</p>";
  } else {
    popEl.innerHTML = sorted.map(([name,qty])=>`
      <div style="display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #eee;">
        <span>🍽️ ${name}</span><b>${qty} sold</b>
      </div>`).join("");
  }
}
