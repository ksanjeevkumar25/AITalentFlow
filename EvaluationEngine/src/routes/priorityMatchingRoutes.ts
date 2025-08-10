import express, { Router } from 'express';
import { PriorityMatchingController } from '../controllers/priorityMatchingController';

const router = Router();
const priorityMatchingController = new PriorityMatchingController();

export function setPriorityMatchingRoutes(app: Router) {
    // Get priority matching records for an employee by ID
    app.get('/priority-matching/employee/:employeeId', 
        priorityMatchingController.getEmployeeMatchings.bind(priorityMatchingController)
    );
    
    // Get priority matching records for an employee by email
    app.get('/priority-matching/email/:email', 
        priorityMatchingController.getEmployeeMatchingsByEmail.bind(priorityMatchingController)
    );
    
    // Get service orders where employee is hiring manager
    app.get('/service-orders/hiring-manager/:email', 
        priorityMatchingController.getServiceOrdersByHiringManager.bind(priorityMatchingController)
    );
    
    // Update associate willingness
    app.put('/priority-matching/:matchingListId/willingness', 
        priorityMatchingController.updateAssociateWillingness.bind(priorityMatchingController)
    );
    
    // Allocate resource to service order
    app.post('/api/service-orders/allocate', 
        priorityMatchingController.allocateResourceToServiceOrder.bind(priorityMatchingController)
    );
}
