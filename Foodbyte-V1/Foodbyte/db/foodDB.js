const { getDB } = require('../config/db');
const fs        = require('fs');
const path      = require('path');   
function deleteImageFile(image_path) {
  if (!image_path) return;
  const fullPath = path.join(__dirname, '../uploads', image_path);
  fs.unlink(fullPath, (err) => {
    if (err && err.code !== 'ENOENT') {  
      console.error('Failed to delete image file:', err);
    }
  });
}

const foodDB = {
  async create(data) {
    const db = getDB();
    const { food_name, price, description, image_path, payment_number, payment_account } = data;
    const [result] = await db.execute(
      'INSERT INTO food_items (food_name, price, description, image_path, payment_number, payment_account) VALUES (?, ?, ?, ?, ?, ?)',
      [food_name, price, description, image_path, payment_number, payment_account]
    );
    return result;
  },

  async getAll() {
    const db = getDB();
    const [rows] = await db.execute('SELECT * FROM food_items ORDER BY created_at DESC');
    return rows;
  },

  async getById(id) {
    const db = getDB();
    const [rows] = await db.execute('SELECT * FROM food_items WHERE id = ?', [id]);
    return rows[0];
  },

  async update(id, data, file) {
    const db = getDB();
    const { food_name, price, description, payment_number, payment_account } = data;

    if (file) {
      
      const [rows] = await db.execute('SELECT image_path FROM food_items WHERE id = ?', [id]);
      const oldImage = rows[0]?.image_path;

      
      await db.execute(
        'UPDATE food_items SET food_name=?, price=?, description=?, payment_number=?, payment_account=?, image_path=? WHERE id=?',
        [food_name, price, description, payment_number, payment_account, file.filename, id]
      );

      
      deleteImageFile(oldImage);

    } else {
    
      await db.execute(
        'UPDATE food_items SET food_name=?, price=?, description=?, payment_number=?, payment_account=? WHERE id=?',
        [food_name, price, description, payment_number, payment_account, id]
      );
    }
  },

  async delete(id) {
    const db = getDB();

   
    const [rows] = await db.execute('SELECT image_path FROM food_items WHERE id = ?', [id]);
    const oldImage = rows[0]?.image_path;

   
    await db.execute('DELETE FROM food_items WHERE id = ?', [id]);

    deleteImageFile(oldImage);
  }
};

module.exports = foodDB;