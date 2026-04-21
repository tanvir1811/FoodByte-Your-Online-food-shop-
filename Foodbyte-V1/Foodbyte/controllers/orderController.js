const orderService = require('../services/orderService');

const placeOrder = async (req, res) => {
  try {
    const customerUsername = req.session.user?.username;
    if (!customerUsername) return res.status(401).json({ status: 'fail', message: 'Not logged in.' });

    const result = await orderService.place(customerUsername, req.body);
    res.status(201).json({ status: 'ok', order_id: result.insertId });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAll();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ status: 'fail', message: err.message });
  }
};

const getOrder = async (req, res) => {
  try {
    const order = await orderService.getById(req.params.id);
    res.json(order);
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const customerUsername = req.session.user?.username;
    if (!customerUsername) return res.status(401).json({ status: 'fail', message: 'Not logged in.' });

    const orders = await orderService.getMyOrders(customerUsername);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ status: 'fail', message: err.message });
  }
};

const getAvailableOrders = async (req, res) => {
  try {
    const orders = await orderService.getAvailable();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ status: 'fail', message: err.message });
  }
};

const getMyDeliveries = async (req, res) => {
  try {
    const riderUsername = req.session.user?.username;
    if (!riderUsername) return res.status(401).json({ status: 'fail', message: 'Not logged in.' });

    const orders = await orderService.getMyDeliveries(riderUsername);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ status: 'fail', message: err.message });
  }
};

const acceptOrder = async (req, res) => {
  try {
    const riderUsername = req.session.user?.username;
    if (!riderUsername) return res.status(401).json({ status: 'fail', message: 'Not logged in.' });

    await orderService.accept(req.params.id, riderUsername);
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

const deliverOrder = async (req, res) => {
  try {
    const riderUsername = req.session.user?.username;
    if (!riderUsername) return res.status(401).json({ status: 'fail', message: 'Not logged in.' });

    await orderService.deliver(req.params.id, riderUsername);
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const customerUsername = req.session.user?.username;
    if (!customerUsername) return res.status(401).json({ status: 'fail', message: 'Not logged in.' });

    await orderService.cancel(req.params.id, customerUsername);
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    await orderService.delete(req.params.id);
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'fail', message: err.message });
  }
};

module.exports = {
  placeOrder, getAllOrders, getOrder,
  getMyOrders, getAvailableOrders, getMyDeliveries,
  acceptOrder, deliverOrder, cancelOrder, deleteOrder
};