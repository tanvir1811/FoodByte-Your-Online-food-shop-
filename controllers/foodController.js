const foodService = require('../services/foodService');

const addFood = async (req, res) => {
  try {
    const result = await foodService.add(req.body, req.file);
    res.status(201).json({ status: 'ok', food_id: result.insertId });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

const getAllFood = async (req, res) => {
  try {
    const items = await foodService.getAll();
    res.json(items);
  } catch (err) {
    res.status(500).json({ status: 'fail', message: err.message });
  }
};

const getFood = async (req, res) => {
  try {
    const item = await foodService.getById(req.params.id);
    res.json(item);
  } catch (err) {
    res.status(404).json({ status: 'fail', message: err.message });
  }
};

const updateFood = async (req, res) => {
  try {
    const updated = await foodService.update(req.params.id, req.body, req.file); 
    res.json({ status: 'ok', food: updated });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

const deleteFood = async (req, res) => {
  try {
    await foodService.delete(req.params.id);
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'fail', message: err.message });
  }
};

module.exports = { addFood, getAllFood, getFood, updateFood, deleteFood };