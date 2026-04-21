// ==========================================
// 1. IMPORTS
// ==========================================
import { usersAPI }  from './api/usersAPI.js';
import { foodAPI }   from './api/foodAPI.js';
import { ordersAPI } from './api/ordersAPI.js';

// ==========================================
// 2. DOM SELECTORS
// ==========================================

// Layout Sections
const dashboard      = document.getElementById("customer-dashboard");
const homeSection    = document.getElementById("customer-home");
const cart           = document.getElementById("customer-cart");
const order          = document.getElementById("customer-orders");
const account        = document.getElementById("customer-myaccount");

// Navigation Items
const hometxt        = document.getElementById("customer-hometxt");
const accounttxt     = document.getElementById("customer-accounttxt");
const ordertxt       = document.getElementById("customer-order-txt");
const logouttxt      = document.getElementById("customer-logouttxt");

// Buttons & Actions
const editButton     = document.getElementById("customer-editButton");
const saveButton     = document.getElementById("customer-saveButton");
const addtocartbtn   = document.getElementById("addtocart");
const nextSlide1     = document.getElementById("nextSlide");
const prevSlide1     = document.getElementById("prevSlide");
const backtohome     = document.getElementById("backtohome");
const confirmBtn     = document.getElementById("confirmorder");

// Specific Containers & Elements
const fieldsets      = document.querySelectorAll("#customer-myaccount fieldset");
const fooddiv        = document.getElementById("food-div");
const foodname       = document.getElementById("customer-foodname");
const cartdetails    = document.getElementById("customer-cartdetails");
const orderTableBody = document.getElementById("customer-order-table-body");

// Address/Payment Logic Elements
const useSavedRadio    = document.getElementById('useaddress');
const newAddressRadio  = document.getElementById('newaddress');
const addressFieldset  = document.getElementById('customer-cart-addressFieldset');
const paymentSelect    = document.getElementById('payment-method-select');
const onlineInfoDiv    = document.getElementById('online-payment-info');
const paymentFieldset  = document.getElementById('customer-cart-payment-details');

// ==========================================
// 3. STATE VARIABLES
// ==========================================
let foodList        = [];
let foodIndex       = 0;
let maybeselectfood;
let currentUser     = null;

// ==========================================
// 4. INITIALIZATION (WINDOW LOAD)
// ==========================================

window.onload = async function () {
  openselected(homeSection, hometxt);
  await loadCustomerInfo();
  loadFoodItems();
  loadAccount();
};

// ==========================================
// 5. NAVIGATION LOGIC
// ==========================================

function closeall() {
  homeSection.style.display = "none";
  order.style.display       = "none";
  cart.style.display        = "none";
  account.style.display     = "none";

  [accounttxt, hometxt, ordertxt].forEach(el => {
    if (el) {
      el.style.backgroundColor      = "";
      el.style.color                = "";
      el.style.fontWeight           = "";
      el.style.backdropFilter       = "";
      el.style.webkitBackdropFilter = "";
    }
  });
}

function openselected(selectedcustomerdiv, navItem) {
  if (!selectedcustomerdiv || !navItem) return;

  dashboard.style.display = "flex";
  closeall();

  navItem.style.backgroundColor      = "rgba(249, 123, 98, 0.6)";
  navItem.style.color                = "#232203";
  navItem.style.fontWeight           = "bolder";
  navItem.style.backdropFilter       = "blur(5px)";
  navItem.style.webkitBackdropFilter = "blur(5px)";

  selectedcustomerdiv.style.display = "block";
}

// Navigation Listeners
hometxt.addEventListener("click",  () => openselected(homeSection, hometxt));
ordertxt.addEventListener("click", () => {
  openselected(order, ordertxt);
  loadMyOrders();
});
accounttxt.addEventListener("click", () => {
  openselected(account, accounttxt);
  loadAccount();
});

// ==========================================
// 6. FOOD BROWSING & SLIDER LOGIC
// ==========================================

async function loadFoodItems() {
  try {
    foodList = await foodAPI("getAll");

    if (foodList.length === 0) {
      document.getElementById("customer-foodname").innerText       = "No food available";
      document.getElementById("customer-foodPrice").innerText      = "";
      document.getElementById("customer-foodDetails-p").innerText  = "";
      document.getElementById("addtocart").style.display="none";
      return;
    }

    foodIndex = 0;
    displayFood(foodIndex);
  } catch (err) {
    console.error("Error loading food:", err);
    alert("❌ Could not load food items. " + (err.message || err));
  }
}

function displayFood(index) {
  const food = foodList[index];
  if (!food) return;
  maybeselectfood = index;

  document.getElementById("customer-foodname").innerText       = food.food_name;
  document.getElementById("customer-foodPrice").innerText      = food.price + "৳";
  document.getElementById("customer-foodDetails-p").innerText  = food.description || "No description available";
  document.getElementById("addtocart").style.display="block";
  const photoDiv = document.getElementById("food-photo-customer");
  if (food.image_path) {
    photoDiv.style.backgroundImage    = `url('/uploads/${food.image_path}')`;
    photoDiv.style.backgroundSize     = "cover";
    photoDiv.style.backgroundPosition = "center";
  } else {
    photoDiv.style.backgroundImage = "none";
  }
}

function nextSlide() {
  if (foodList.length === 0) return;
  slidingEffectforward(fooddiv);
  setTimeout(() => {
    foodIndex = (foodIndex + 1) % foodList.length;
    displayFood(foodIndex);
  }, 200);
}

function prevSlide() {
  if (foodList.length === 0) return;
  slidingEffectbackward(fooddiv);
  setTimeout(() => {
    foodIndex = (foodIndex - 1 + foodList.length) % foodList.length;
    displayFood(foodIndex);
  }, 200);
}

function slidingEffectforward(el) {
  if (!el) return;
  el.style.transition = "transform 0.4s ease";
  el.style.transform  = "translateX(-120%)";
  setTimeout(() => {
    el.style.transition = "none";
    el.style.transform  = "translateX(120%)";
    requestAnimationFrame(() => {
      el.style.transition = "transform 0.4s ease";
      el.style.transform  = "translateX(0)";
    });
  }, 300);
}

function slidingEffectbackward(el) {
  if (!el) return;
  el.style.transition = "transform 0.4s ease";
  el.style.transform  = "translateX(120%)";
  setTimeout(() => {
    el.style.transition = "none";
    el.style.transform  = "translateX(-120%)";
    requestAnimationFrame(() => {
      el.style.transition = "transform 0.4s ease";
      el.style.transform  = "translateX(0)";
    });
  }, 300);
}

nextSlide1.addEventListener("click", () => nextSlide());
prevSlide1.addEventListener("click", () => prevSlide());

// ==========================================
// 7. CART & ORDERING LOGIC
// ==========================================

function foodshowoncart(index2) {
  const food2 = foodList[index2];
  document.getElementById("customer-cart-food-name").innerText           = food2.food_name;
  document.getElementById("customer-cart-food-price").innerText          = food2.price + "৳";
  document.getElementById("customer-cart-food-details").innerText        = food2.description || "No description available";
  document.getElementById("customer-cart-payment-number").innerText      = "Payment number: " + (food2.payment_number || "N/A");
  document.getElementById("customer-cart-number-accounttname").innerText = "Account type: " + (food2.payment_account || "N/A");
}

addtocartbtn.addEventListener("click", () => {
  openselected(cart, hometxt);
  foodshowoncart(maybeselectfood);
});

backtohome.addEventListener("click", () => {
  openselected(homeSection, hometxt);
});

// ==========================================
// 8. ADDRESS & PAYMENT TOGGLES
// ==========================================

useSavedRadio.addEventListener('change', async () => {
  if (useSavedRadio.checked) {
    addressFieldset.disabled = false;
    await fillSavedAddress();
  }
});

newAddressRadio.addEventListener('change', () => {
  if (newAddressRadio.checked) {
    addressFieldset.disabled = false;
    clearCartAddressFields();
  }
});

async function fillSavedAddress() {
  try {
    const user = await usersAPI("getMe");
    if (user && user.status !== 'fail') {
      document.getElementById('customer-cart-street').value       = user.street       || "";
      document.getElementById('customer-cart-area').value         = user.area         || "";
      document.getElementById('customer-cart-city').value         = user.city         || "";
      document.getElementById('customer-cart-state').value        = user.state        || "";
      document.getElementById('customer-cart-zip').value          = user.zip          || "";
      document.getElementById('customer-cart-landmark').value     = user.landmark     || "";
      document.getElementById('customer-cart-instructions').value = user.instructions || "";
    }
  } catch (err) {
    console.error("Error fetching account address:", err);
    alert("❌ Could not load saved address. " + (err.message || err));
  }
}

function clearCartAddressFields() {
  ['street', 'area', 'city', 'state', 'zip', 'landmark', 'instructions'].forEach(f => {
    const el = document.getElementById(`customer-cart-${f}`);
    if (el) el.value = "";
  });
}

paymentSelect.addEventListener('change', () => {
  if (paymentSelect.value === 'cod') {
    onlineInfoDiv.style.display = 'none';
    document.getElementById("customer-transaction-id").value = "";
    document.getElementById("customer-sender-number").value  = "";
    paymentFieldset.disabled = true;
  } else {
    onlineInfoDiv.style.display = 'block';
    paymentFieldset.disabled    = false;
  }
});

// ==========================================
// 9. ACCOUNT & SESSION MANAGEMENT
// ==========================================

async function loadCustomerInfo() {
  try {
    const user = await usersAPI('getMe');
    if (!user || user.status === 'fail') {
      window.location.replace("/index.html");
      return;
    }
    currentUser = user;

    const usernameEl = document.getElementById("customer-username-display");
    if (usernameEl) usernameEl.textContent = user.username;

  } catch (err) {
    console.error("Failed to load customer info:", err);
    alert("❌ Failed to load customer info. " + (err.message || err));
  }
}

async function loadAccount() {
  try {
    const user = await usersAPI("getMe");
    if (!user || user.status === 'fail') {
      window.location.replace("/index.html");
      return;
    }

    ["email", "phone", "street", "area", "city", "state", "zip", "landmark", "instructions"]
      .forEach(f => {
        const el = document.getElementById(`customer-${f}`);
        if (el) el.value = user[f] || "";
      });

    const userinfo = document.getElementById("customer-userinfo");
    if (userinfo) userinfo.textContent = `Welcome, ${user.username}`;

  } catch (err) {
    console.error("Error loading account:", err);
    alert("❌ Could not load account. " + (err.message || err));
  }
}

if (editButton && saveButton) {
  editButton.addEventListener("click", () => {
    fieldsets.forEach(f => f.disabled = false);
    editButton.style.display = "none";
    saveButton.style.display = "inline-block";
  });

  saveButton.addEventListener("click", async () => {
    const updatedData = {};
    ["email", "phone", "street", "area", "city", "state", "zip", "landmark", "instructions"]
      .forEach(f => {
        const el = document.getElementById(`customer-${f}`);
        if (el) updatedData[f] = el.value;
      });

    try {
      const response = await usersAPI("updateMe", updatedData);
      if (response.status === "ok") {
        alert("Account updated successfully!");
        fieldsets.forEach(f => f.disabled = true);
        saveButton.style.display = "none";
        editButton.style.display = "inline-block";
      } else {
        alert(response.message || "Failed to update account.");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("❌ Could not update account. " + (err.message || err));
    }
  });
}

if (logouttxt) {
  logouttxt.addEventListener("click", async () => {
    try {
      await usersAPI("logout");
    } catch (err) {
      console.error("Logout error:", err);
      alert("❌ Logout error. " + (err.message || err));
    } finally {
      window.location.replace("/index.html");
    }
  });
}

// ==========================================
// 10. PLACE ORDER
// ==========================================

const getOrderData = () => {
  return {
    food_item_name:    document.getElementById("customer-cart-food-name").innerText,
    price:             document.getElementById("customer-cart-food-price").innerText.replace(/[^0-9]/g, ''),
    street:            document.getElementById("customer-cart-street").value,
    area:              document.getElementById("customer-cart-area").value,
    city:              document.getElementById("customer-cart-city").value,
    state:             document.getElementById("customer-cart-state").value,
    zip:               document.getElementById("customer-cart-zip").value,
    landmark:          document.getElementById("customer-cart-landmark").value,
    instructions:      document.getElementById("customer-cart-instructions").value,
    payment_method:    document.getElementById("payment-method-select").value,
    sender_number:     document.getElementById("customer-sender-number").value,
    transaction_id:    document.getElementById("customer-transaction-id").value,
    customer_username: currentUser?.username,
    customer_phone:    currentUser?.phone,
  };
};

if (confirmBtn) {
  confirmBtn.addEventListener("click", async () => {
    const data = getOrderData();

    if (!data.food_item_name || !data.price || !data.payment_method) {
      alert("Please complete your order details.");
      return;
    }

    if (!data.customer_username) {
      alert("Please wait, loading your profile...");
      return;
    }

    confirmBtn.disabled    = true;
    confirmBtn.textContent = "Placing Order...";

    try {
      const result = await ordersAPI('place', data);
      if (result?.status === 'ok') {
        alert("✅ Order placed successfully!");
        openselected(order, ordertxt);
        loadMyOrders();
      } else {
        alert("❌ Failed to place order: " + (result?.message || "Server Error"));
      }
    } catch (err) {
      console.error("Order error:", err);
      alert("❌ Cannot connect to server. " + (err.message || err));
    } finally {
      confirmBtn.disabled    = false;
      confirmBtn.textContent = "Confirm Order";
    }
  });
}

// ==========================================
// 11. LOAD MY ORDERS TABLE
// ==========================================

async function loadMyOrders() {
  try {
    const orders = await ordersAPI('getMyOrders');
    console.log("My orders:", orders);

    if (!Array.isArray(orders)) {
      console.error("Expected array but got:", orders);
      return;
    }

    orderTableBody.innerHTML = "";

    if (orders.length === 0) {
      orderTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;">No orders yet.</td>
        </tr>`;
      return;
    }

    orders.forEach(ord => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${ord.food_item_name}</td>
        <td>${ord.price}৳</td>
        <td>${ord.rider_phone    || "Rider not selected yet"}</td>
        <td>${ord.rider_username || "Rider not selected yet"}</td>
        <td>${ord.payment_method}</td>
        <td>${ord.status}</td>
      `;
      orderTableBody.appendChild(row);
    });

  } catch (err) {
    console.error("Error loading orders:", err);
    alert("❌ Could not load orders. " + (err.message || err));
  }
}