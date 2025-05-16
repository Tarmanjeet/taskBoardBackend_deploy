const express = require("express");
const automationRouter = express.Router();
const { triggerAutomation } = require("../controllers/automationController");

automationRouter.post("/trigger", triggerAutomation);

module.exports = automationRouter;
