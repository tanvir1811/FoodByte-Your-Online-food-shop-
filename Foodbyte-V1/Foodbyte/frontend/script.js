import { adminAPI } from './api/adminAPI.js';
import { ridersAPI } from './api/ridersAPI.js';
import { usersAPI } from './api/usersAPI.js';

/**
 * UI ELEMENTS
 */
const logindiv     = document.getElementById("logindiv");
const registerdiv  = document.getElementById("registerdiv");
const registertxt  = document.getElementById("registertxt");
const dlogin       = document.getElementById("dlogin");
const form         = document.getElementById("form");
const registerform = document.getElementById("registerform");
const setpass      = document.getElementById("regpassword1");
const confirmpass  = document.getElementById("regpassword2");

/**
 * PAGE NAVIGATION
 */
function openloginpage(){
     logindiv.style.display = "block"; registerdiv.style.display = "none"; }


function openregisterpage(){ 
    registerdiv.style.display = "block"; logindiv.style.display = "none"; 

}

if (registertxt) registertxt.addEventListener("click", openregisterpage);
if (dlogin)      dlogin.addEventListener("click", openloginpage);

/**
 * REGISTRATION LOGIC
 */
if (registerform) {
    registerform.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("regUsername").value;
        const password = setpass.value;
        const role     = "customer"; 

        if (password !== confirmpass.value) {
            alert("Passwords do not match");
            return;
        }

        try {
            const data = await usersAPI("register", { username, password });

            if (data.status === "ok") {
                alert("Registration successful!");
                registerform.reset();
                openloginpage();
            } else {
                alert(data.message || "Registration failed");
            }
        } catch (err) {
            console.error(err);
            alert(err.message || err);
        }
    });
}

/**
 * LOGIN LOGIC
 */
if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("Username").value;
        const password = document.getElementById("password").value;
        const role     = document.getElementById("selectrole").value;

        try {
            let data;

            if (role === 'admin') {
                data = await adminAPI('login', { username, password });
            } else if (role === 'rider') {
                data = await ridersAPI('login', { username, password });
            } else {
                data = await usersAPI('login', { username, password });
            }

            if (data.status === "ok") {
                const redirectMap = {
                    customer: "/customer.html",
                    admin:    "/Admin.html",
                    rider:    "/rider.html",
                };
                window.location.href = redirectMap[role];
            } else {
                alert(data.message || "Login failed");
            }
        } catch (err) {
            alert(err.message || err);
        }
    });
}