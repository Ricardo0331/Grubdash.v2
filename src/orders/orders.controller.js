const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");



function list (req, res) {
    res.json({ data: orders });
}


function create(req, res) {
    const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        dishes,
    };
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
}


function validateOrder(req, res, next) {
    const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
  
    if (!deliverTo) return next({ status: 400, message: "Order must include a deliverTo" });
    if (!mobileNumber) return next({ status: 400, message: "Order must include a mobileNumber" });
    if (!dishes) return next({ status: 400, message: "Order must include a dish" });
    if (!Array.isArray(dishes) || dishes.length === 0) return next({ status: 400, message: "Order must include at least one dish" });
  
    dishes.forEach((dish, index) => {
      if (!dish.quantity || typeof dish.quantity !== 'number' || dish.quantity <= 0) {
        return next({ status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0` });
      }
    });
  
    next();
  }
  


  function orderExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);


    if (foundOrder) {
        res.locals.order = foundOrder;
        return next();
    }

    next({ status: 404, message: `Order does not exist: ${orderId}.` });
  }



  function read(req, res) {
    res.json({ data: res.locals.order });
  }
  
  function update(req, res) {
    const order = res.locals.order;
    const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
  
    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.dishes = dishes;
  
    res.json({ data: order });
  }
  
  function validateUpdate(req, res, next) {
    const { orderId } = req.params;
    const { data: { id } = {} } = req.body;
  
    if (id && id !== orderId) {
      return next({ status: 400, message: `Order id does not match route id. Order: ${id}, Route: ${orderId}` });
    }
  
    next();
  }
  
  function validateDelete(req, res, next) {
    const order = res.locals.order;
    if (order.status !== "pending") {
      return next({ status: 400, message: "An order cannot be deleted unless it is pending." });
    }
  
    next();
  }
  
  function deleteOrder(req, res) {
    const index = orders.findIndex((order) => order.id === res.locals.order.id);
    orders.splice(index, 1);
    res.sendStatus(204);
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
  