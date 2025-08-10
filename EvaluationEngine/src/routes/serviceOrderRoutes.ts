import express, { Router } from 'express';
import { ServiceOrderController } from '../controllers/serviceOrderController';

const serviceOrderController = new ServiceOrderController();

export function setServiceOrderRoutes(app: Router) {
    // Supervisors for HiringManager dropdown
    app.get('/api/supervisors', 
        serviceOrderController.getAllSupervisors.bind(serviceOrderController)
    );

    // Grades for Grade dropdown
    app.get('/api/grades', 
        serviceOrderController.getAllGrades.bind(serviceOrderController)
    );

    // Skills management
    app.get('/api/skills', 
        serviceOrderController.getAllSkills.bind(serviceOrderController)
    );

    app.post('/api/skills', 
        serviceOrderController.createSkill.bind(serviceOrderController)
    );

    // Get all service orders for management
    app.get('/api/service-orders/all/:email', 
        serviceOrderController.getAllServiceOrders.bind(serviceOrderController)
    );

    // Get a specific service order by ID
    app.get('/api/service-orders/:serviceOrderId', 
        serviceOrderController.getServiceOrderById.bind(serviceOrderController)
    );

    // Create a new service order
    app.post('/api/service-orders', 
        serviceOrderController.createServiceOrder.bind(serviceOrderController)
    );

    // Update an existing service order
    app.put('/api/service-orders/:serviceOrderId', 
        serviceOrderController.updateServiceOrder.bind(serviceOrderController)
    );

    // Delete a service order
    app.delete('/api/service-orders/:serviceOrderId', 
        serviceOrderController.deleteServiceOrder.bind(serviceOrderController)
    );
}
