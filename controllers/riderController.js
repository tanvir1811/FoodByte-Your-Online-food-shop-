const riderService = require('../services/riderService');

// ============================================================
// LOGIN
// ============================================================

const loginRider = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ status: 'fail', message: 'Username and password required.' });
    }

    const rider = await riderService.login(username, password);
    req.session.user = { id: rider.id, username: rider.username, role: 'rider' };

    res.json({ status: 'ok', message: 'Login successful' });

  } catch (err) {
    res.status(401).json({ status: 'fail', message: err.message });
  }
};

// ============================================================
// LOGOUT
// ============================================================

const logoutRider = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ status: 'fail', message: 'Logout failed.' });
    res.clearCookie('connect.sid');
    res.json({ status: 'ok', message: 'Logged out successfully.' });
  });
};

// ============================================================
// REGISTER
// ============================================================

const registerRider = async (req, res) => {
  try {
    await riderService.register(req.body);
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// ============================================================
// GET ALL
// ============================================================

const getAllRiders = async (req, res) => {
  try {
    const riders = await riderService.getAll();
    res.json(riders);
  } catch (err) {
    res.status(500).json({ status: 'fail', message: err.message });
  }
};

// ============================================================
// GET ONE
// ============================================================

const getRider = async (req, res) => {
  try {
    const rider = await riderService.getById(req.params.id);
    res.json(rider);
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err.message });
  }
};

// ============================================================
// UPDATE PROFILE (rider updates  by admin )
// ============================================================

const updateRider = async (req, res) => {
  try {
    const id = req.params.id; // ✅ ONLY from URL

    if (!id) {
      return res.status(400).json({ status: 'fail', message: 'Rider ID is required.' });
    }

    const updated = await riderService.updateProfile(id, req.body);

    res.json({ status: 'ok', rider: updated });

  } catch (err) {
    res.status(500).json({ status: 'fail', message: err.message });
  }
};

// ============================================================
// UPDATE STATUS (admin updates rider status)
// ============================================================

const updateRiderStatus = async (req, res) => {
  try {
    await riderService.updateStatus(req.params.id, req.body.status);
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// ============================================================
// DELETE
// ============================================================

const deleteRider = async (req, res) => {
  try {
    await riderService.delete(req.params.id);
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'fail', message: err.message });
  }
};

// ============================================================
// EXPORTS
// ============================================================

const getRiderMe = async (req, res) => {
  try {
    const id = req.session.user?.id;
    if (!id) return res.status(401).json({ status: 'fail', message: 'Not logged in.' });

    const rider = await riderService.getById(id);
    res.json(rider);
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err.message });
  }
};


module.exports = {
  loginRider,
  logoutRider,
  getRiderMe,       // ← add
  registerRider,
  getAllRiders,
  getRider,
  updateRider,
  updateRiderStatus,
  deleteRider,
};