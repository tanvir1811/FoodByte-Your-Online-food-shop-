const bcrypt = require('bcrypt');
const ridersDB = require('../db/ridersDB');

const riderService = {
  async register(data) {
    const { username, password, confirmPassword, phone, license_link, photo_link, joining_date } = data;
    if (!username || !password) throw new Error('Username and password are required.');
    if (password !== confirmPassword) throw new Error('Passwords do not match.');

    const existing = await ridersDB.getByUsername(username.trim());
    if (existing) throw new Error('Username already taken.');

    const hashed = await bcrypt.hash(password, 10);
    return ridersDB.create({ username: username.trim(), password: hashed, phone, license_link, photo_link, joining_date });
  },

  async login(username, password) {
    const rider = await ridersDB.getByUsername(username.trim());
    if (!rider) throw new Error('Invalid credentials.');
    if (rider.status === 'inactive') throw new Error('Account is inactive. Contact admin.');

    const match = await bcrypt.compare(password, rider.password);
    if (!match) throw new Error('Invalid credentials.');

    return rider;
  },

  async getAll() {
    return ridersDB.getAll();
  },

  async getById(id) {
    const rider = await ridersDB.getById(id);
    if (!rider) throw new Error('Rider not found.');
    return rider;
  },

  async updateProfile(id, data) {
  try {
    // If password is provided → hash it
    if (data.password && data.password.trim() !== "") {
      const saltRounds = 10;
      data.password = await bcrypt.hash(data.password, saltRounds);
    } else {
      // If no password → remove it so DB doesn't overwrite
      delete data.password;
    }

    await ridersDB.update(id, data);
    return await ridersDB.getById(id);

  } catch (err) {
    throw new Error("Failed to update rider: " + err.message);
  }
},

  async updateStatus(id, status) {
    const allowed = ['active', 'inactive'];
    if (!allowed.includes(status)) throw new Error('Invalid status.');
    await ridersDB.updateStatus(id, status);
  },

  async delete(id) {
    const rider = await ridersDB.getById(id);
    if (!rider) throw new Error('Rider not found.');
    await ridersDB.delete(id);
  }
};

module.exports = riderService;