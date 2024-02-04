const router = require("express").Router();
const controller = require("./orders.controller");

router.route("/orders")
  .get(controller.list)
  .post(controller.validateOrder, controller.create);

router.route("/orders/:orderId")
  .get(controller.orderExists, controller.read)
  .put(controller.orderExists, controller.validateOrder, controller.validateUpdate, controller.update)
  .delete(controller.orderExists, controller.validateDelete, controller.delete);

module.exports = router;
