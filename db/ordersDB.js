const { getDB } = require('../config/db');

const ordersDB = {
  async create(data) {
    const db = getDB();
    const {
      food_item_name, price,
      payment_method, sender_number, transaction_id,
      customer_username, customer_phone,
      street, area, city, state, zip, landmark, instructions
    } = data;

    const [result] = await db.execute(
      `INSERT INTO orders
        (food_item_name, price, payment_method, sender_number, transaction_id,
         customer_username, customer_phone,
         street, area, city, state, zip, landmark, instructions)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [food_item_name, price, payment_method, sender_number, transaction_id,
       customer_username, customer_phone,
       street, area, city, state, zip, landmark, instructions]
    );
    return result;
  },

  async getAll() {
    const db = getDB();
    const [rows] = await db.execute('SELECT * FROM orders ORDER BY created_at DESC');
    return rows;
  },

  async getById(id) {
    const db = getDB();
    const [rows] = await db.execute('SELECT * FROM orders WHERE id = ?', [id]);
    return rows[0];
  },

  async getByCustomer(customer_username) {
    const db = getDB();
    const [rows] = await db.execute(
      'SELECT * FROM orders WHERE customer_username = ? ORDER BY created_at DESC',
      [customer_username]
    );
    return rows;
  },

  async getAvailable() {
    const db = getDB();
    const [rows] = await db.execute(
      "SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at ASC"
    );
    return rows;
  },

  async getByRider(rider_username) {
    const db = getDB();
    const [rows] = await db.execute(
      "SELECT * FROM orders WHERE rider_username = ? AND status != 'delivered' ORDER BY created_at DESC",
      [rider_username]
    );
    return rows;
  },

  async assignRider(id, rider_username, rider_phone) {
    const db = getDB();
    await db.execute(
      "UPDATE orders SET rider_username=?, rider_phone=?, status='assigned' WHERE id=?",
      [rider_username, rider_phone, id]
    );
  },

  async updateStatus(id, status) {
    const db = getDB();
    await db.execute(
      'UPDATE orders SET status=? WHERE id=?',
      [status, id]
    );
  },

  async delete(id) {
    const db = getDB();
    await db.execute('DELETE FROM orders WHERE id = ?', [id]);
  }
};

module.exports = ordersDB;