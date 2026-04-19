// ==========================================
// 1. IMPORTS
// ==========================================

import { ridersAPI } from './api/ridersAPI.js';
import { ordersAPI } from './api/ordersAPI.js';

// ==========================================
// 2. DOM SELECTORS
// ==========================================

const availableTableBody = document.querySelector("#available-table tbody");
const selectedTableBody  = document.querySelector("#selected-table tbody");
const riderWelcome       = document.getElementById("rider-welcome");

// ==========================================
// 3. STATE
// ==========================================

let currentSection = null;
let currentRider   = null;

// ==========================================
// 4. INITIALIZATION
// ==========================================

window.onload = async () => {
  currentSection = document.getElementById("section-available");
  if (currentSection) currentSection.classList.add("active");
  setActiveNav("nav-available");

  await loadRiderInfo();

  loadAvailableOrders();
  loadSelectedOrders();
  loadRiderProfile();
};

// ==========================================
// 5. NAVIGATION
// ==========================================

function showRiderSection(sectionId, navId) {
  if (sectionId === "Logout") {
    logoutRider();
    return;
  }

  const nextSection = document.getElementById(sectionId);
  if (!nextSection) return;

  if (!currentSection) {
    currentSection = nextSection;
    nextSection.classList.add("active");
    setActiveNav(navId);
    return;
  }

  if (currentSection === nextSection) return;

  currentSection.classList.remove("active");
  currentSection.classList.add("exit");

  nextSection.classList.remove("exit");
  nextSection.classList.add("active");

  setTimeout(() => {
    currentSection.classList.remove("exit");
  }, 400);

  currentSection = nextSection;
  setActiveNav(navId);
}

function setActiveNav(navId) {
  document.querySelectorAll(".rider-sidebar h1").forEach(item => {
    item.style.backgroundColor = "";
    item.style.color           = "#e0f3f7";
  });

  const nav = document.getElementById(navId);
  if (!nav) return;
  nav.style.backgroundColor = "rgb(228, 227, 216)";
  nav.style.color           = "#000";
}

// Nav Listeners
document.getElementById("nav-available").onclick = () =>
  showRiderSection("section-available", "nav-available");

document.getElementById("nav-selected").onclick = () => {
  showRiderSection("section-selected", "nav-selected");
  loadSelectedOrders();
};

document.getElementById("nav-account").onclick = () =>
  showRiderSection("section-account", "nav-account");

document.getElementById("nav-logout").onclick = () =>
  showRiderSection("Logout", "nav-logout");

// ==========================================
// 6. LOAD RIDER INFO (sets currentRider)
// ==========================================

async function loadRiderInfo() {
  try {
    const rider = await ridersAPI('getMe');
    if (!rider || rider.status === 'fail') {
      alert("Session expired or invalid. Redirecting to login...");
      window.location.replace("/index.html");
      return;
    }
    currentRider = rider;
    if (riderWelcome) riderWelcome.textContent = `Welcome, ${rider.username}`;
  } catch (err) {
    console.error("Failed to load rider info:", err);
    alert("Error loading rider info: " + err.message);
    window.location.replace("/index.html");
  }
}

// ==========================================
// 7. LOAD RIDER PROFILE (account section)
// ==========================================

async function loadRiderProfile() {
  try {
    const rider = currentRider || await ridersAPI('getMe');
    if (!rider || rider.status === 'fail') return;

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || "Not provided";
    };

    const usernameEl = document.getElementById('rider_username');
    if (usernameEl) usernameEl.textContent = `Username: ${rider.username}`;

    set('rider-phone',        rider.phone);
    set('rider-licence',      rider.license_link);
    set('rider-photo',        rider.photo_link);
    set('rider-joining-date', rider.joining_date);

  } catch (err) {
    console.error("Failed to load rider profile:", err);
    alert("Error loading profile details: " + err.message);
  }
}

// ==========================================
// 8. AVAILABLE ORDERS TABLE
// ==========================================

async function loadAvailableOrders() {
  try {
    const orders = await ordersAPI('getAvailable');
    availableTableBody.innerHTML = "";

    if (!Array.isArray(orders) || orders.length === 0) {
      availableTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;">No available orders right now.</td>
        </tr>`;
      return;
    }

    orders.forEach(order => {
      const address = [order.street, order.area, order.city, order.state]
        .filter(Boolean)
        .join(", ");

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${order.food_item_name}</td>
        <td>${order.customer_username}</td>
        <td>${order.customer_phone || "-"}</td>
        <td>${address              || "-"}</td>
        <td>${order.payment_method}</td>
        <td>${order.price}৳</td>
        <td>
          <button class="btn-select" onclick="selectOrder('${order.id}')">Select</button>
        </td>
      `;
      availableTableBody.appendChild(row);
    });

  } catch (err) {
    console.error("Error loading available orders:", err);
    alert("Error fetching available orders: " + err.message);
  }
}

// ==========================================
// 9. SELECT ORDER (rider accepts it)
// ==========================================

window.selectOrder = async (orderId) => {
  if (!currentRider) {
    alert("Please wait, loading your profile...");
    return;
  }

  if (!confirm("Accept this order?")) return;

  try {
    const result = await ordersAPI('accept', { id: orderId });

    if (result?.status === 'ok') {
      alert("✅ Order accepted!");
      loadAvailableOrders();
      loadSelectedOrders();
    } else {
      alert("❌ Failed to accept order: " + (result?.message || "Server Error"));
    }
  } catch (err) {
    console.error("Accept order error:", err);
    alert("❌ Cannot connect to server: " + err.message);
  }
};

// ==========================================
// 10. SELECTED ORDERS TABLE
// ==========================================

async function loadSelectedOrders() {
  try {
    const orders = await ordersAPI('getMyDeliveries');
    selectedTableBody.innerHTML = "";

    if (!Array.isArray(orders) || orders.length === 0) {
      selectedTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;">No orders selected yet.</td>
        </tr>`;
      return;
    }

    orders.forEach(order => {
      const address = [order.street, order.area, order.city, order.state]
        .filter(Boolean)
        .join(", ");

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${order.food_item_name}</td>
        <td>${order.customer_username}</td>
        <td>${order.customer_phone || "-"}</td>
        <td>${address              || "-"}</td>
        <td>${order.payment_method}</td>
        <td>${order.price}৳</td>
        <td>
          <button class="btn-done" onclick="doneOrder('${order.id}')">Done</button>
        </td>
      `;
      selectedTableBody.appendChild(row);
    });

  } catch (err) {
    console.error("Error loading selected orders:", err);
    alert("Error fetching your selected orders: " + err.message);
  }
}

// ==========================================
// 11. DONE ORDER (deliver + delete)
// ==========================================

window.doneOrder = async (orderId) => {
  if (!confirm("Mark this order as delivered")) return;

  try {
    const deliverResult = await ordersAPI('deliver', { id: orderId });

    if (deliverResult?.status === 'ok') {
      alert("✅ Order marked delivered");
      loadSelectedOrders();
    } else {
      alert("❌ Failed to mark as delivered: " + (deliverResult?.message || "Server Error"));
    }
  } catch (err) {
    console.error("Done order error:", err);
    alert("❌ Error marking order as done: " + err.message);
  }
};

// ==========================================
// 12. LOGOUT
// ==========================================

async function logoutRider() {
  try {
    const res = await ridersAPI('logout');
    if (res?.status === 'ok') {
      window.location.replace("/index.html");
    } else {
      alert("Logout failed: " + (res?.message || "Unknown error"));
    }
  } catch (err) {
    console.error("Logout error:", err);
    alert("Could not connect to server for logout: " + err.message);
  }
}