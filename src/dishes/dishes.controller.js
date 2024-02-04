const path = require("path");

const dishes = require("../data/dishes-data");
const nextId = require("../utils/nextId");

// Handler for listing all dishes
function list(req, res) {
  res.json({ data: dishes });
}

// Validation middleware for creating a dish
function validateDish(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const errors = [];

  if (!name) errors.push("Dish must include a name");
  if (!description) errors.push("Dish must include a description");
  if (!price) errors.push("Dish must include a price");
  if (price <= 0 || !Number.isInteger(price)) errors.push("Dish must have a price that is an integer greater than 0");
  if (!image_url) errors.push("Dish must include an image_url");

  if (errors.length) {
    return next({ status: 400, message: errors.join(", ") });
  }

  next();
}

// Handler for creating a new dish
function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(), // Assign a new ID
    name,
    description,
    price,
    image_url,
  };

  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

module.exports = {
  list,
  create,
  validateDish, 
};
