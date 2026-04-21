const foodDB = require('../db/foodDB');

const foodService = {
  async add(data, file) {
    const { food_name, price, description, payment_number, payment_account } = data;
    if (!food_name || !price) throw new Error('Food name and price are required.');

    const image_path = file ? file.filename : null;
    return foodDB.create({ food_name, price, description, image_path, payment_number, payment_account });
  },

  async getAll() {
    return foodDB.getAll();
  },

  async getById(id) {
    const food = await foodDB.getById(id);
    if (!food) throw new Error('Food item not found.');
    return food;
  },

  async update(id, data ,file)  {
    const food = await foodDB.getById(id);
    if (!food) throw new Error('Food item not found.');
    await foodDB.update(id, data ,file);
    return foodDB.getById(id);
   

  },

  async delete(id) {
    const food = await foodDB.getById(id);
    if (!food) throw new Error('Food item not found.');
    await foodDB.delete(id);
  }
};

module.exports = foodService;