"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPriorityMatchingRoutes = void 0;
const express_1 = require("express");
const priorityMatchingController_1 = require("../controllers/priorityMatchingController");
const router = (0, express_1.Router)();
const priorityMatchingController = new priorityMatchingController_1.PriorityMatchingController();
function setPriorityMatchingRoutes(app) {
    // Get priority matching records for an employee by ID
    app.get('/priority-matching/employee/:employeeId', priorityMatchingController.getEmployeeMatchings.bind(priorityMatchingController));
    // Get priority matching records for an employee by email
    app.get('/priority-matching/email/:email', priorityMatchingController.getEmployeeMatchingsByEmail.bind(priorityMatchingController));
    // Get service orders where employee is hiring manager
    app.get('/service-orders/hiring-manager/:email', priorityMatchingController.getServiceOrdersByHiringManager.bind(priorityMatchingController));
    // Update associate willingness
    app.put('/priority-matching/:matchingListId/willingness', priorityMatchingController.updateAssociateWillingness.bind(priorityMatchingController));
    // Allocate resource to service order
    app.post('/api/service-orders/allocate', priorityMatchingController.allocateResourceToServiceOrder.bind(priorityMatchingController));
}
exports.setPriorityMatchingRoutes = setPriorityMatchingRoutes;
