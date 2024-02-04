const path = require("path");

const orders = require(path.resolve("src/data/orders-data"));

const nextId = require("../utils/nextId");

function list(req, res) {
    res.json({ data: orders });
}

// Creates a new order
function create(req, res) {
    const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;

    // Creating a new order object with a unique ID
    const newOrder = {
        id: nextId(),
        deliverTo, 
        mobileNumber, 
        dishes, 
    };

    // Adds the new order to the orders array
    orders.push(newOrder);

    res.status(201).json({ data: newOrder });
}

// Middleware to validate the incoming order request
function validateOrder(req, res, next) {
    const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;

    // Validation checks for order fields
    if (!deliverTo) return next({ status: 400, message: "Order must include a deliverTo" });
    if (!mobileNumber) return next({ status: 400, message: "Order must include a mobileNumber" });
    if (!dishes) return next({ status: 400, message: "Order must include a dish" });
    if (!Array.isArray(dishes) || dishes.length === 0) return next({ status: 400, message: "Order must include at least one dish" });

    // Validating each dish in the order
    dishes.forEach((dish, index) => {
      if (!dish.quantity || typeof dish.quantity !== 'number' || dish.quantity <= 0) {
        return next({ status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0` });
      }
    });

    next();
}

// Middleware to check if an order exists by its ID
function orderExists(req, res, next) {
    const { orderId } = req.params; // Extracting the orderId from request parameters
    const foundOrder = orders.find((order) => order.id === orderId);

    if (foundOrder) {
        res.locals.order = foundOrder;
        return next();
    }

    // If the order is not found, return a 404 error
    next({ status: 404, message: `Order does not exist: ${orderId}.` });
}

// Reads and returns a single order
function read(req, res) {
    res.json({ data: res.locals.order });
}

// Updates an existing order
function update(req, res, next) {
  const { orderId } = req.params; // Extracting the orderId from request parameters
  const updatedOrder = req.body.data; // The updated order data from the request body

  // Finding the index of the order to be updated
  const foundIndex = orders.findIndex((order) => order.id === orderId);

  // If the order is not found, return a 404 error
  if (foundIndex === -1) {
    return next({ status: 404, message: `Order id not found: ${orderId}` });
  }

  if (updatedOrder.id && updatedOrder.id !== orderId) {
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${updatedOrder.id}, Route: ${orderId}`,
    });
  }

  // Validating the status of the updated order
  if (!updatedOrder.status || updatedOrder.status === "invalid") {
    return next({ status: 400, message: "Order must have a valid status." });
  }

  orders[foundIndex] = { ...updatedOrder, id: orderId };

  res.json({ data: orders[foundIndex] });
}

// Middleware to validate the ID in the order update request
function validateUpdate(req, res, next) {
  const { orderId } = req.params; 
  const { data: { id } = {} } = req.body; 

  if (id && id !== orderId) {
    return next({ status: 400, message: `Order id does not match route id. Order: ${id}, Route: ${orderId}` });
  }

  next();
}

// Middleware to validate if an order can be deleted
function validateDelete(req, res, next) {
  const order = res.locals.order; 

  if (order.status !== "pending") {
    return next({ status: 400, message: "An order cannot be deleted unless it is pending." });
  }

  next();
}

// Deletes an existing order
function deleteOrder(req, res) {
  const index = orders.findIndex((order) => order.id === res.locals.order.id); // Finding the index of the order to be deleted
  orders.splice(index, 1); // Removing the order from the orders array
  res.sendStatus(204); // Responding with a 204 status code indicating successful deletion
}

module.exports = {
  list,
  create,
  read,
  update,
  delete: deleteOrder,
  validateOrder,
  orderExists,
  validateUpdate,
  validateDelete,
};
