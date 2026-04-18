const express   = require('express');
const path      = require('path');
const session   = require('express-session');
const fs        = require('fs');
const { connectDB } = require('./config/db');

// Route Imports
const adminRoutes = require('./routes/adminroutes'); // ⬅️ New Admin Route
const userRoutes  = require('./routes/userroutes');
const foodRoutes  = require('./routes/foodroutes');
const riderRoutes = require('./routes/riderroutes');
const orderRoutes = require('./routes/orderroutes');

const app  = express();
const PORT = 3000;

// Ensure upload directory exists
if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// 1. Core Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Session Initialization (CRITICAL: Must be above routes)
app.use(session({
  secret:            'foodbyte-secret-key',
  resave:            true,         
  saveUninitialized: false,
  rolling:           true,          
  cookie:            { 
    secure:   false,
    httpOnly: true,                
    Age:  60 * 1000
  }
}));



app.use(express.static(path.join(__dirname, 'frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


function isAdmin(req) {
  return !!(req.session && req.session.isAdmin === true);
}
app.use((req, res, next) => {
  req.isAdmin = () => isAdmin(req);
  next();
});

// 5. API Routes
app.use('/api/admin',  adminRoutes);  // ⬅️ Added for Admin Login/Logout
app.use('/api/users',  userRoutes);
app.use('/api/food',   foodRoutes);
app.use('/api/riders', riderRoutes);
app.use('/api/orders', orderRoutes);

// 6. Database Connection & Server Start
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error("❌ Failed to start server:", err);
});