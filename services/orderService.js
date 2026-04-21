const ordersDB = require('../db/ordersDB');
const usersDB  = require('../db/usersDB');
const ridersDB = require('../db/ridersDB');

const orderService = {

  async place(customerUsername, data) {
    const {
      food_item_name, price,
      payment_method, sender_number, transaction_id,
      street, area, city, state, zip, landmark, instructions
    } = data;

    // Fetch customer phone from DB
    const customer = await usersDB.getByUsername(customerUsername);
    if (!customer) throw new Error('Customer not found.');

    return ordersDB.create({
      food_item_name,
      price,
      payment_method,
      sender_number:    sender_number  || null,
      transaction_id:   transaction_id || null,
      customer_username: customerUsername,
      customer_phone:    customer.phone,
      street, area, city, state, zip, landmark, instructions
    });
  },

  async getAll() {
    return ordersDB.getAll();
  },

  async getById(id) {
    const order = await ordersDB.getById(id);
    if (!order) throw new Error('Order not found.');
    return order;
  },

  async getMyOrders(customerUsername) {
    return ordersDB.getByCustomer(customerUsername);
  },

  async getAvailable() {
    return ordersDB.getAvailable();
  },

  async getMyDeliveries(riderUsername) {
    return ordersDB.getByRider(riderUsername);
  },

  async accept(orderId, riderUsername) {
    const order = await ordersDB.getById(orderId);
    if (!order) throw new Error('Order not found.');
    if (order.status !== 'pending') throw new Error('Order is no longer available.');

    // Fetch rider phone from DB
    const rider = await ridersDB.getByUsername(riderUsername);
    if (!rider) throw new Error('Rider not found.');

    await ordersDB.assignRider(orderId, riderUsername, rider.phone);
  },

  async deliver(orderId, riderUsername) {
    const order = await ordersDB.getById(orderId);
    if (!order) throw new Error('Order not found.');
    if (order.rider_username !== riderUsername) throw new Error('Not your order.');
    await ordersDB.updateStatus(orderId, 'delivered');
  },

  async cancel(orderId, customerUsername) {
    const order = await ordersDB.getById(orderId);
    if (!order) throw new Error('Order not found.');
    if (order.customer_username !== customerUsername) throw new Error('Not your order.');
    if (order.status === 'delivered') throw new Error('Cannot cancel a delivered order.');
    await ordersDB.updateStatus(orderId, 'cancelled');
  },

  async delete(id) {
    const order = await ordersDB.getById(id);
    if (!order) throw new Error('Order not found.');
    await ordersDB.delete(id);
  }
};

module.exports = orderService;