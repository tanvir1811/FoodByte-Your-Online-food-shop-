const { getDB } = require('../config/db');

const usersDB = {
  async create(data) {
    const db = getDB();
    const { username, password } = data;
    const [result] = await db.execute(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, password, 'customer']
    );
    return result;
  },

  async getAll() {
    const db = getDB();
    const [rows] = await db.execute(
      'SELECT id, username, email, phone, street, area, city, state, zip, landmark, instructions FROM users ORDER BY id DESC'
    );
    return rows;
  },

  async getById(id) {
    const db = getDB();
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  async getByUsername(username) {
    const db = getDB();
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  },

  async update(id, data) {
    const db = getDB();
    const { email, phone, street, area, city, state, zip, landmark, instructions } = data;
    await db.execute(
      'UPDATE users SET email=?, phone=?, street=?, area=?, city=?, state=?, zip=?, landmark=?, instructions=? WHERE id=?',
      [email, phone, street, area, city, state, zip, landmark, instructions, id]
    );
  },

  async delete(id) {
    const db = getDB();
    await db.execute('DELETE FROM users WHERE id = ?', [id]);
  }
};

module.exports = usersDB;