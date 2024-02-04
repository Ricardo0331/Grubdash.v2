const router = require("express").Router();
const controller = require("./dishes.controller")

router.route("/dishes")
    .get(controller.list)
    .post(controller.validateDish, controller.create);



module.exports = router;
