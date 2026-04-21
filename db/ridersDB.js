const { getDB } = require('../config/db');

const ridersDB = {
  async create(data) {
    const db = getDB();
    const { username, password, phone, license_link, photo_link, joining_date } = data;
    const [result] = await db.execute(
      'INSERT INTO riders (username, password, phone, license_link, photo_link, joining_date) VALUES (?, ?, ?, ?, ?, ?)',
      [username, password, phone, license_link, photo_link, joining_date]
    );
    return result;
  },

  async getAll() {
    const db = getDB();
    const [rows] = await db.execute(
      'SELECT id, username, phone, license_link, photo_link, joining_date, status FROM riders ORDER BY id DESC'
    );
    return rows;
  },

  async getById(id) {
    const db = getDB();
    const [rows] = await db.execute('SELECT * FROM riders WHERE id = ?', [id]);
    return rows[0];
  },

  async getByUsername(username) {
    const db = getDB();
    const [rows] = await db.execute('SELECT * FROM riders WHERE username = ?', [username]);
    return rows[0];
  },

  async update(id, data) {
    const db = getDB();
    const { phone, license_link, photo_link } = data;
    await db.execute(
      'UPDATE riders SET phone=?, license_link=?, photo_link=? WHERE id=?',
      [phone, license_link, photo_link, id]
    );
  },

  async updateStatus(id, status) {
    const db = getDB();
    await db.execute('UPDATE riders SET status=? WHERE id=?', [status, id]);
  },

  async delete(id) {
    const db = getDB();
    await db.execute('DELETE FROM riders WHERE id = ?', [id]);
  }
};

module.exports = ridersDB;