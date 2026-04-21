// ============================================================
// 1. IMPORTS
// ============================================================

import { foodAPI }   from './api/foodAPI.js';
import { ridersAPI } from './api/ridersAPI.js';
import { ordersAPI } from './api/ordersAPI.js';

// ============================================================
// 2. NAVIGATION
// ============================================================

function logoutAdmin() {
  window.location.replace("/index.html");
}

function showSection(sectionId, navId) {
  if (sectionId === "Logout") {
    logoutAdmin();
    return;
  }

  document.querySelectorAll(".section").forEach(sec => sec.style.display = "none");
  document.querySelectorAll(".sidebar h1").forEach(nav => nav.style.backgroundColor = "");

  const targetSection = document.getElementById(sectionId);
  const targetNav     = document.getElementById(navId);

  if (targetSection) targetSection.style.display = "block";
  if (targetNav)     targetNav.style.backgroundColor = "rgb(76, 104, 241)";
}

document.getElementById("nav-add-food").onclick = () => {
  resetFoodForm();
  showSection("food-add-section", "nav-add-food");
};

document.getElementById("nav-view-food").onclick = () => {
  showSection("food-view-section", "nav-view-food");
  loadFoodTable();
};

document.getElementById("nav-register-rider").onclick = () => {
  resetRiderForm();
  showSection("rider-register-section", "nav-register-rider");
};

document.getElementById("nav-view-riders").onclick = () => {
  showSection("rider-view-section", "nav-view-riders");
  loadRidersTable();
};

document.getElementById("nav-view-orders").onclick = () => {
  showSection("orders-view-section", "nav-view-orders");
  loadOrdersTable();
};

document.getElementById("nav-logout").onclick = () => showSection("Logout", "nav-logout");

// Show default section on load
showSection("food-add-section", "nav-add-food");


// ============================================================
// 3. FOOD FORM ELEMENTS
// ============================================================

const btnAddFood      = document.getElementById("btn-add-food");
const inputFoodName   = document.getElementById("food-name");
const inputFoodPrice  = document.getElementById("food-price");
const inputFoodDesc   = document.getElementById("food-desc");
const inputPaymentNum = document.getElementById("admin-payment-number");
const inputPaymentAcc = document.getElementById("admin-payment-account");
const inputFoodImage  = document.getElementById("food-image");
const foodTableBody   = document.querySelector("#food-table tbody");

// ============================================================
// 4. FOOD MODE FLAG
// ============================================================

let foodMode      = 'add';
let currentFoodId = null;

// ============================================================
// 5. FOOD HELPERS
// ============================================================

function getFormValues() {
  return {
    food_name:       inputFoodName.value.trim(),
    price:           inputFoodPrice.value.trim(),
    description:     inputFoodDesc.value.trim(),
    payment_number:  inputPaymentNum.value.trim(),
    payment_account: inputPaymentAcc.value,
    image:           inputFoodImage.files[0],
  };
}

function validateForm({ food_name, price, payment_number, payment_account }) {
  if (!food_name || !price || isNaN(price) || !payment_number || !payment_account) {
    alert("Please fill all required fields correctly.");
    return false;
  }
  return true;
}

function clearFoodForm() {
  inputFoodName.value   = "";
  inputFoodPrice.value  = "";
  inputFoodDesc.value   = "";
  inputPaymentNum.value = "";
  inputPaymentAcc.value = "";
  inputFoodImage.value  = "";
}

function resetFoodForm() {
  clearFoodForm();
  foodMode      = 'add';
  currentFoodId = null;
  btnAddFood.textContent = "Add Food";
  btnAddFood.disabled    = false;
}

function setFoodButtonState(label, disabled = false) {
  btnAddFood.textContent = label;
  btnAddFood.disabled    = disabled;
}

// ============================================================
// 6. FOOD BUTTON CLICK — single listener, mode-driven
// ============================================================

btnAddFood.addEventListener("click", async () => {
  if (foodMode === 'add') {
    await addFoodItem();
  } else if (foodMode === 'update') {
    await updateFoodItem();
  }
});

// ============================================================
// 7. ADD FOOD
// ============================================================

async function addFoodItem() {
  const values = getFormValues();
  if (!validateForm(values)) return;

  setFoodButtonState("Adding...", true);

  try {
    const result = await foodAPI('add', values);
    if (result?.status === 'ok') {
      alert("✅ Food added successfully!");
      clearFoodForm();
    } else {
      alert("❌ Failed to add food: " + (result?.message || "Server Error"));
    }
  } catch (err) {
    console.error("Add food error:", err);
    alert("❌ Cannot connect to server. " + (err.message || err));
  } finally {
    setFoodButtonState("Add Food", false);
  }
}

// ============================================================
// 8. UPDATE FOOD
// ============================================================

async function updateFoodItem() {
  const values = getFormValues();
  if (!validateForm(values)) return;

  setFoodButtonState("Updating...", true);

  try {
    const result = await foodAPI('update', { id: currentFoodId, ...values });
    if (result?.status === 'ok') {
      alert("✅ Food updated successfully!");
      resetFoodForm();
      showSection("food-view-section", "nav-view-food");
      loadFoodTable();
    } else {
      alert("❌ Failed to update: " + (result?.message || "Server Error"));
    }
  } catch (err) {
    console.error("Update food error:", err);
    alert("❌ Cannot connect to server. " + (err.message || err));
  } finally {
    setFoodButtonState("Add Food", false);
    foodMode = 'add';
  }
}

// ============================================================
// 9. VIEW FOOD TABLE
// ============================================================

async function loadFoodTable() {
  try {
    const foodList = await foodAPI("getAll");
    foodTableBody.innerHTML = "";

    foodList.forEach(food => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${food.food_name}</td>
        <td>${food.price}৳</td>
        <td>${food.payment_number}</td>
        <td>${food.payment_account}</td>
        <td><div class="desc-cell">${food.description || ""}</div></td>
        <td>
          ${food.image_path
            ? `<img src="/uploads/${food.image_path}" width="50">`
            : "No Image"}
        </td>
        <td>
          <button class="btn-edit"   onclick="modify('${food.id}')">Modify</button>
          <button class="btn-delete" onclick="deleteFood('${food.id}')">Delete</button>
        </td>
      `;
      foodTableBody.appendChild(row);
    });
  } catch (err) {
    console.error("Error loading food table:", err);
    alert("❌ Could not load food table. " + (err.message || err));
  }
}

// ============================================================
// 10. DELETE FOOD
// ============================================================

window.deleteFood = async (fid) => {
  if (!confirm("Are you sure you want to permanently delete this item?")) return;

  try {
    const result = await foodAPI('delete', { id: fid });
    if (result?.status === "ok") {
      alert("✅ Item deleted!");
      loadFoodTable();
    } else {
      alert("❌ Failed to delete: " + (result?.message || "Server Error"));
    }
  } catch (err) {
    console.error("Delete error:", err);
    alert("❌ Cannot connect to server. " + (err.message || err));
  }
};

// ============================================================
// 11. MODIFY FOOD (load into form)
// ============================================================

window.modify = async (idfood) => {
  showSection("food-add-section", "nav-view-food");

  try {
    const food = await foodAPI('getOne', { id: idfood });

    inputFoodName.value   = food.food_name;
    inputFoodPrice.value  = food.price;
    inputFoodDesc.value   = food.description;
    inputPaymentNum.value = food.payment_number;
    inputPaymentAcc.value = food.payment_account;

    foodMode      = 'update';
    currentFoodId = idfood;
    setFoodButtonState("Update Food", false);

  } catch (err) {
    console.error("Error loading food for edit:", err);
    alert("❌ Could not load food item. " + (err.message || err));
  }
};


// ============================================================
// 12. RIDER FORM ELEMENTS
// ============================================================

const riderRegBtn    = document.getElementById("btn-register-rider");
const riderTableBody = document.querySelector("#riders-table tbody");

// ============================================================
// 13. RIDER MODE FLAG
// ============================================================

let riderMode      = 'register';
let currentRiderId = null;

// ============================================================
// 14. RIDER HELPERS
// ============================================================

function getRiderFormValues() {
  const statusElement = document.querySelector('input[name="rider-status"]:checked');
  return {
    username:        document.getElementById('rider-name').value.trim(),
    phone:           document.getElementById('rider-phone').value.trim(),
    password:        document.getElementById('rider-password').value.trim(),
    confirmPassword: document.getElementById('rider-vehicle').value.trim(),
    license_link:    document.getElementById('rider-license').value.trim(),
    photo_link:      document.getElementById('rider-photo').value.trim(),
    joining_date:    document.getElementById('rider-joining').value,
    status:          statusElement ? statusElement.value : 'active',
  };
}

function validateRiderForm({ username, phone, password, confirmPassword, joining_date }) {
  if (!username || !phone || !password || !joining_date) {
    alert("Please fill in all required fields (Name, Phone, Password, and Date).");
    return false;
  }
  if (password !== confirmPassword) {
    alert("Passwords do not match! Please check again.");
    return false;
  }
  return true;
}

function clearRiderForm() {
  document.getElementById('rider-name').value     = "";
  document.getElementById('rider-phone').value    = "";
  document.getElementById('rider-password').value = "";
  document.getElementById('rider-vehicle').value  = "";
  document.getElementById('rider-license').value  = "";
  document.getElementById('rider-photo').value    = "";
  document.getElementById('rider-joining').value  = "";
  const defaultStatus = document.querySelector('input[name="rider-status"]');
  if (defaultStatus) defaultStatus.checked = true;
}

function resetRiderForm() {
  clearRiderForm();
  riderMode      = 'register';
  currentRiderId = null;
  document.getElementById('fieldset-child').style.display = "none";
  riderRegBtn.textContent = "Register Rider";
  riderRegBtn.disabled    = false;
}

function setRiderBtnState(label, disabled = false) {
  riderRegBtn.textContent = label;
  riderRegBtn.disabled    = disabled;
}

// ============================================================
// 15. RIDER BUTTON CLICK — single listener, mode-driven
// ============================================================

riderRegBtn.addEventListener("click", async () => {
  if (riderMode === 'register') {
    await register_a_rider();
  } else if (riderMode === 'update') {
    await updateRiderStatus();
  }
});

// ============================================================
// 16. REGISTER RIDER
// ============================================================

async function register_a_rider() {
  const values = getRiderFormValues();
  if (!validateRiderForm(values)) return;

  setRiderBtnState("Registering...", true);

  try {
    const response = await ridersAPI('register', values);
    if (response?.status === 'ok') {
      alert("✅ Rider registered successfully!");
      clearRiderForm();
    } else {
      alert("❌ Registration failed: " + (response?.message || "Unknown server error"));
    }
  } catch (err) {
    console.error("Fatal Error in register_a_rider:", err);
    alert("🚨 Could not connect to the server. " + (err.message || err));
  } finally {
    setRiderBtnState("Register Rider", false);
  }
}

// ============================================================
// 17. UPDATE RIDER STATUS
// ============================================================

async function updateRiderStatus() {
  const statusEl      = document.querySelector('input[name="rider-status"]:checked');
  const updatedStatus = statusEl ? statusEl.value : null;

  if (!updatedStatus) {
    alert("Please select a status.");
    return;
  }

  setRiderBtnState("Updating...", true);

  try {
    const result = await ridersAPI('updateStatus', { id: currentRiderId, status: updatedStatus });
    if (result?.status === 'ok') {
      alert("✅ Rider updated successfully!");
      resetRiderForm();
      showSection("rider-view-section", "nav-view-riders");
      loadRidersTable();
    } else {
      alert("❌ Failed to update: " + (result?.message || "Server Error"));
    }
  } catch (err) {
    console.error("Update rider error:", err);
    alert("❌ Cannot connect to server. " + (err.message || err));
  } finally {
    setRiderBtnState("Register Rider", false);
    riderMode = 'register';
  }
}

// ============================================================
// 18. LOAD RIDERS TABLE
// ============================================================

async function loadRidersTable() {
  try {
    const riderList = await ridersAPI('getAll');
    riderTableBody.innerHTML = "";

    if (!Array.isArray(riderList) || riderList.length === 0) {
      riderTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;">No riders registered yet.</td>
        </tr>`;
      return;
    }

    riderList.forEach(rider => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${rider.username}</td>
        <td>${rider.phone || "-"}</td>
        <td>
          ${rider.license_link
            ? `<a href="${rider.license_link}" target="_blank">View License</a>`
            : "-"}
        </td>
        <td>
          ${rider.photo_link
            ? `<a href="${rider.photo_link}" target="_blank">View Photo</a>`
            : "-"}
        </td>
        <td>${rider.joining_date || "-"}</td>
        <td>
          <span class="status-badge status-${rider.status}">
            ${rider.status}
          </span>
        </td>
        <td>
          <button class="btn-edit"   onclick="modifyRider('${rider.id}')">Modify</button>
          <button class="btn-delete" onclick="deleteRider('${rider.id}')">Delete</button>
        </td>
      `;
      riderTableBody.appendChild(row);
    });
  } catch (err) {
    console.error("Error loading riders table:", err);
    alert("❌ Could not load riders table. " + (err.message || err));
  }
}

// ============================================================
// 19. DELETE RIDER
// ============================================================

window.deleteRider = async (rid) => {
  if (!confirm("Are you sure you want to permanently delete this rider?")) return;

  try {
    const result = await ridersAPI('delete', { id: rid });
    if (result?.status === "ok") {
      alert("✅ Rider deleted!");
      loadRidersTable();
    } else {
      alert("❌ Failed to delete: " + (result?.message || "Server Error"));
    }
  } catch (err) {
    console.error("Delete rider error:", err);
    alert("❌ Cannot connect to server. " + (err.message || err));
  }
};

// ============================================================
// 20. MODIFY RIDER (load into form)
// ============================================================

window.modifyRider = async (idRider) => {
  showSection("rider-register-section", "nav-register-rider");

  try {
    const rider = await ridersAPI('getOne', { id: idRider });

    document.getElementById('rider-name').value     = rider.username;
    document.getElementById('rider-phone').value    = rider.phone        || "";
    document.getElementById('rider-license').value  = rider.license_link || "";
    document.getElementById('rider-photo').value    = rider.photo_link   || "";
    document.getElementById('rider-joining').value  = rider.joining_date || "";
    document.getElementById('rider-password').value = "";
    document.getElementById('rider-vehicle').value  = "";

    const statusFieldset = document.getElementById('fieldset-child');
    statusFieldset.style.display = "block";
    const statusRadio = document.querySelector(
      `input[name="rider-status"][value="${rider.status}"]`
    );
    if (statusRadio) statusRadio.checked = true;

    riderMode      = 'update';
    currentRiderId = idRider;
    setRiderBtnState("Update Rider", false);

  } catch (err) {
    console.error("Error loading rider for edit:", err);
    alert("❌ Could not load rider. " + (err.message || err));
  }
};

// ============================================================
// 21. ORDERS TABLE
// ============================================================

const ordersTableBody = document.querySelector("#orders-table tbody");

async function loadOrdersTable() {
  try {
    const orders = await ordersAPI('getAll');
    ordersTableBody.innerHTML = "";

    if (!Array.isArray(orders) || orders.length === 0) {
      ordersTableBody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align:center;">No orders yet.</td>
        </tr>`;
      return;
    }

    orders.forEach(order => {
      const address = [order.street, order.area, order.city, order.state]
        .filter(Boolean).join(", ");

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${order.food_item_name}</td>
        <td>${order.customer_username}</td>
        <td>${order.customer_phone    || "-"}</td>
        <td>${address                 || "-"}</td>
        <td>${order.payment_method} , ${order.sender_number || "No number"} , ${order.transaction_id || "NO transaction Id"}</td>
        <td>${order.price}৳</td>
        <td>${order.rider_username    || "Not assigned"}</td>
        <td>${order.rider_phone       || "-"}</td>
        <td>
          <span class="status-badge status-${order.status}">
            ${order.status}
          </span>
        </td>
        <td>
          <button class="btn-delete" onclick="deleteOrder('${order.id}')">Delete</button>
        </td>
      `;
      ordersTableBody.appendChild(row);
    });
  } catch (err) {
    console.error("Error loading orders table:", err);
    alert("❌ Could not load orders table. " + (err.message || err));
  }
}

// ============================================================
// 22. DELETE ORDER (admin)
// ============================================================

window.deleteOrder = async (oid) => {
  if (!confirm("Are you sure you want to permanently delete this order?")) return;

  try {
    const result = await ordersAPI('delete', { id: oid });
    if (result?.status === "ok") {
      alert("✅ Order deleted!");
      loadOrdersTable();
    } else {
      alert("❌ Failed to delete: " + (result?.message || "Server Error"));
    }
  } catch (err) {
    console.error("Delete order error:", err);
    alert("❌ Cannot connect to server. " + (err.message || err));
  }
};