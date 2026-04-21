const bcrypt = require('bcrypt');
const usersDB = require('../db/usersDB');

const userService = {
  async register(data) {
    const { username, password } = data;
    if (!username || !password) throw new Error('Username and password are required.');
    if (username.trim().length < 3) throw new Error('Username must be at least 3 characters.');
    if (password.length < 6) throw new Error('Password must be at least 6 characters.');

    const existing = await usersDB.getByUsername(username.trim());
    if (existing) throw new Error('Username already exists.');

    const hashed = await bcrypt.hash(password, 10);
    return usersDB.create({ username: username.trim(), password: hashed });
  },

  async login(username, password) {
    const user = await usersDB.getByUsername(username.trim());
    if (!user) throw new Error('Invalid username or password.');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error('Invalid username or password.');

    return user;
  },

  async getAll() {
    return usersDB.getAll();
  },

  async getById(id) {
    const user = await usersDB.getById(id);
    if (!user) throw new Error('User not found.');
    return user;
  },

  async updateProfile(id, data) {
    await usersDB.update(id, data);
    return usersDB.getById(id);
  },

  async delete(id) {
    const user = await usersDB.getById(id);
    if (!user) throw new Error('User not found.');
    await usersDB.delete(id);
  }
};

module.exports = userService;