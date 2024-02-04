const router = require("express").Router();
const controller = require("./dishes.controller")

router.route("/dishes")
    .get(controller.list)
    .post(controller.validateDish, controller.create);

    router.route("/dishes/:dishId")
    .get(controller.read)  // Handler for GET request
    .put(controller.validateDish, controller.dishExists, controller.update)  // Validation and update handlers
    .all(controller.methodNotAllowed); 

module.exports = router;
