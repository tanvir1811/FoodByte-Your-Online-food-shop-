const userService = require('../services/userService');


const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await userService.login(username, password);

    if (user) {
      req.session.user = {
        id: user.id,
        username: user.username,
        role: 'customer'
      };
      req.session.isAdmin = false; 

      res.json({ status: 'ok', role: 'customer', user: req.session.user });
    } else {
      res.status(401).json({ status: 'fail', message: 'Invalid username or password' });
    }
  } catch (err) {
    res.status(500).json({ status: 'fail', message: err.message });
  }
};

// ── NEW: Logout Handler ──────────────────────────────────────
const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ status: 'fail', message: 'Logout failed' });
    }
    res.clearCookie('connect.sid'); // Ensure the cookie is removed from the browser
    res.json({ status: 'ok', message: 'Logged out successfully' });
  });
};

// ── Updated: Get User (Handles "me" or specific ID) ──────────
const getUser = async (req, res) => {
  try {
    // If frontend sends 'me', use the ID from the current session
    const targetId = req.params.id === 'me' ? req.session.user?.id : req.params.id;
    
    if (!targetId) {
      return res.status(401).json({ status: 'fail', message: 'Not authenticated' });
    }

    const user = await userService.getById(targetId);
    res.json(user);
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err.message });
  }
};

// ── Existing Handlers ────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ status: 'fail', message: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const id = req.session.user?.id;
    if (!id) return res.status(401).json({ status: 'fail', message: 'Not logged in.' });
    const updated = await userService.updateProfile(id, req.body);
    req.session.user = { ...req.session.user, ...req.body };
    res.json({ status: 'ok', user: updated });
  } catch (err) {
    res.status(500).json({ status: 'fail', message: err.message });
  }
};

const createUser = async (req, res) => {
  try {
    const userData = { ...req.body, role: 'customer' };
    const result = await userService.register(userData);
    res.status(201).json({ status: 'ok', user_id: result.insertId });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await userService.delete(req.params.id);
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'fail', message: err.message });
  }
};

const getUserMe = async (req, res) => {
  try {
    const id = req.session.user?.id;
    if (!id) return res.status(401).json({ status: 'fail', message: 'Not logged in.' });
    const user = await userService.getById(id);
    res.json(user);
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err.message });
  }
};
// Export ALL functions
module.exports = { 
  loginUser, 
  logoutUser, // 👈 Added
  createUser, 
  getAllUsers, 
  getUser, 
  getUserMe,
  updateUser, 
  deleteUser 
};