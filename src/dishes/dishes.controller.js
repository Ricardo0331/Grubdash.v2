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



function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);

    if (foundDish) {
        res.locals.dish = foundDish;
        return next();
    }

    next({ status: 404, message: `Dish does not exist: ${dishId}.` });
}


//Get request to retrieve a sinlge dish 
function read(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    return res.json({ data: foundDish });
  }
  next({ status: 404, message: `Dish id not found: ${dishId}` });
}



// PUT request to update an existing dish 
function update(req, res, next) {
    const dish = res.locals.dish;
    const { data: { id, name, description, price, image_url } = {} } = req.body;

    //Validation: if ID is provided in the body, it must match the DishID in the route
    if (id && id !== dish.id) {
        return next({ status: 400, message: `Dish id does not match route id. Dish: ${id}, Route: ${dish.id}` });
    }


    //update dish properties
    dish.name = name;
    dish.description = description;
    dish.price = price; 
    dish.image_url = image_url;

    res.json({ data: dish });
}

// Handler for disallowed methods
function methodNotAllowed(req, res, next) {
    next({ status: 405, message: `Method not allowed: ${req.method}` });
  }
  



  module.exports = {
    list,
    create,
    read,
    update,
    validateDish,
    dishExists,
    methodNotAllowed,
  };
  
