import { Request, Response } from 'express';
import sql from 'mssql';
import { dbConfig } from '../config';

export interface PriorityMatching {
  MatchingListID: number;
  ServiceOrderID: number;
  EmployeeID: number;
  MatchingIndexScore: number;
  Remarks: string;
  Priority: number;
  AssociateWilling: boolean;
  // ServiceOrder fields
  AccountName?: string;
  Location?: string;
  CCARole?: string;
  HiringManager?: number;
  RequiredFrom?: string;
  ClientEvaluation?: string;
  SOState?: string;
  AssignedToResource?: number;
  RequiredGrade?: string;
  EmployeeGrade?: string;
  EmployeeName?: string;
}

export interface ServiceOrderWithMatches {
  ServiceOrderID: number;
  AccountName: string;
  Location: string;
  CCARole: string;
  HiringManager: number;
  RequiredFrom: string;
  ClientEvaluation: string;
  SOState: string;
  AssignedToResource: number;
  Grade: string;
  // Priority matching data
  matches: Array<{
    MatchingListID: number;
    EmployeeID: number;
    EmployeeName: string;
    MatchingIndexScore: number;
    Remarks: string;
    Priority: number;
    AssociateWilling: boolean;
    EmployeeGrade: string;
  }>;
  totalMatches: number;
}

export class PriorityMatchingController {
  
  // Get priority matching records for a specific employee
  async getEmployeeMatchings(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      
      if (!employeeId) {
        res.status(400).json({ 
          success: false, 
          message: 'Employee ID is required' 
        });
        return;
      }

      const pool = await sql.connect(dbConfig);
      
      // Query to get priority matching records with service order details
      const query = `
        SELECT TOP 50
          pml.MatchingListID,
          pml.ServiceOrderID,
          pml.EmployeeID,
          pml.MatchingIndexScore,
          pml.Remarks,
          pml.Priority,
          pml.AssociateWilling,
          so.AccountName,
          so.Location,
          so.CCARole,
          so.HiringManager,
          so.RequiredFrom,
          so.ClientEvaluation,
          so.SOState,
          so.AssignedToResource,
          so.Grade as RequiredGrade,
          emp.Grade as EmployeeGrade,
          emp.FirstName + ' ' + emp.LastName as EmployeeName
        FROM PriorityMatchingList pml WITH (NOLOCK)
        INNER JOIN ServiceOrder so WITH (NOLOCK) ON pml.ServiceOrderID = so.ServiceOrderID
        INNER JOIN Employee emp WITH (NOLOCK) ON pml.EmployeeID = emp.EmployeeID
        WHERE pml.EmployeeID = @employeeId
          AND so.AssignedToResource IS NULL
          AND so.Grade = emp.Grade
        ORDER BY pml.Priority ASC, pml.MatchingIndexScore DESC
      `;

      const result = await pool.request()
        .input('employeeId', sql.Int, parseInt(employeeId))
        .query(query);

      const matchings: PriorityMatching[] = result.recordset.map((record: any) => ({
        MatchingListID: record.MatchingListID,
        ServiceOrderID: record.ServiceOrderID,
        EmployeeID: record.EmployeeID,
        MatchingIndexScore: record.MatchingIndexScore,
        Remarks: record.Remarks || '',
        Priority: record.Priority,
        AssociateWilling: record.AssociateWilling,
        AccountName: record.AccountName || '',
        Location: record.Location || '',
        CCARole: record.CCARole || '',
        HiringManager: record.HiringManager,
        RequiredFrom: record.RequiredFrom ? new Date(record.RequiredFrom).toISOString().split('T')[0] : '',
        ClientEvaluation: record.ClientEvaluation || '',
        SOState: record.SOState || '',
        AssignedToResource: record.AssignedToResource,
        RequiredGrade: record.RequiredGrade || '',
        EmployeeGrade: record.EmployeeGrade || '',
        EmployeeName: record.EmployeeName || ''
      }));

      res.json({
        success: true,
        data: matchings,
        count: matchings.length
      });

    } catch (error) {
      console.error('Error fetching employee matchings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch priority matching records',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get priority matching records by email (for logged-in user)
  async getEmployeeMatchingsByEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;
      
      if (!email) {
        res.status(400).json({ 
          success: false, 
          message: 'Email is required' 
        });
        return;
      }

      const pool = await sql.connect(dbConfig);
      
      // First get employee ID from email
      const employeeQuery = `
        SELECT EmployeeID, 
               FirstName + ' ' + LastName as Name, 
               EmailID as Email 
        FROM Employee 
        WHERE EmailID = @email
      `;

      const employeeResult = await pool.request()
        .input('email', sql.VarChar, email)
        .query(employeeQuery);

      if (employeeResult.recordset.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Employee not found with the provided email'
        });
        return;
      }

      const employee = employeeResult.recordset[0];
      const employeeId = employee.EmployeeID;

      // Query to get priority matching records with service order details
      const query = `
        SELECT TOP 50
          pml.MatchingListID,
          pml.ServiceOrderID,
          pml.EmployeeID,
          pml.MatchingIndexScore,
          pml.Remarks,
          pml.Priority,
          pml.AssociateWilling,
          so.AccountName,
          so.Location,
          so.CCARole,
          so.HiringManager,
          so.RequiredFrom,
          so.ClientEvaluation,
          so.SOState,
          so.AssignedToResource,
          so.Grade as RequiredGrade,
          emp.Grade as EmployeeGrade,
          emp.FirstName + ' ' + emp.LastName as EmployeeName
        FROM PriorityMatchingList pml WITH (NOLOCK)
        INNER JOIN ServiceOrder so WITH (NOLOCK) ON pml.ServiceOrderID = so.ServiceOrderID
        INNER JOIN Employee emp WITH (NOLOCK) ON pml.EmployeeID = emp.EmployeeID
        WHERE pml.EmployeeID = @employeeId
          AND so.AssignedToResource IS NULL
          AND so.Grade = emp.Grade
        ORDER BY pml.Priority ASC, pml.MatchingIndexScore DESC
      `;

      const result = await pool.request()
        .input('employeeId', sql.Int, employeeId)
        .query(query);

      const matchings: PriorityMatching[] = result.recordset.map((record: any) => ({
        MatchingListID: record.MatchingListID,
        ServiceOrderID: record.ServiceOrderID,
        EmployeeID: record.EmployeeID,
        MatchingIndexScore: record.MatchingIndexScore,
        Remarks: record.Remarks || '',
        Priority: record.Priority,
        AssociateWilling: record.AssociateWilling,
        AccountName: record.AccountName || '',
        Location: record.Location || '',
        CCARole: record.CCARole || '',
        HiringManager: record.HiringManager,
        RequiredFrom: record.RequiredFrom ? new Date(record.RequiredFrom).toISOString().split('T')[0] : '',
        ClientEvaluation: record.ClientEvaluation || '',
        SOState: record.SOState || '',
        AssignedToResource: record.AssignedToResource,
        RequiredGrade: record.RequiredGrade || '',
        EmployeeGrade: record.EmployeeGrade || '',
        EmployeeName: record.EmployeeName || ''
      }));

      res.json({
        success: true,
        data: matchings,
        count: matchings.length,
        employee: {
          id: employee.EmployeeID,
          name: employee.Name,
          email: employee.Email
        }
      });

    } catch (error) {
      console.error('Error fetching employee matchings by email:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch priority matching records',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update associate willingness
  async updateAssociateWillingness(req: Request, res: Response): Promise<void> {
    try {
      const { matchingListId } = req.params;
      const { associateWilling } = req.body;

      if (!matchingListId) {
        res.status(400).json({
          success: false,
          message: 'Matching List ID is required'
        });
        return;
      }

      const pool = await sql.connect(dbConfig);
      
      const query = `
        UPDATE PriorityMatchingList 
        SET AssociateWilling = @associateWilling
        WHERE MatchingListID = @matchingListId
      `;

      await pool.request()
        .input('matchingListId', sql.Int, parseInt(matchingListId))
        .input('associateWilling', sql.Bit, associateWilling)
        .query(query);

      res.json({
        success: true,
        message: 'Associate willingness updated successfully'
      });

    } catch (error) {
      console.error('Error updating associate willingness:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update associate willingness',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get service orders where the logged-in employee is the hiring manager
  async getServiceOrdersByHiringManager(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;
      
      if (!email) {
        res.status(400).json({ 
          success: false, 
          message: 'Email is required' 
        });
        return;
      }

      const pool = await sql.connect(dbConfig);
      
      // First get employee ID from email
      const employeeQuery = `
        SELECT EmployeeID, 
               FirstName + ' ' + LastName as Name, 
               EmailID as Email 
        FROM Employee 
        WHERE EmailID = @email
      `;

      const employeeResult = await pool.request()
        .input('email', sql.VarChar, email)
        .query(employeeQuery);

      if (employeeResult.recordset.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Employee not found with the provided email'
        });
        return;
      }

      const employee = employeeResult.recordset[0];
      const employeeId = employee.EmployeeID;

      // Query to get service orders where employee is hiring manager with priority matches
      const query = `
        SELECT 
          so.ServiceOrderID,
          so.AccountName,
          so.Location,
          so.CCARole,
          so.HiringManager,
          so.RequiredFrom,
          so.ClientEvaluation,
          so.SOState,
          so.AssignedToResource,
          so.Grade,
          pml.MatchingListID,
          pml.EmployeeID,
          pml.MatchingIndexScore,
          pml.Remarks,
          pml.Priority,
          pml.AssociateWilling,
          emp.Grade as EmployeeGrade,
          emp.FirstName + ' ' + emp.LastName as EmployeeName
        FROM ServiceOrder so WITH (NOLOCK)
        LEFT JOIN PriorityMatchingList pml WITH (NOLOCK) ON so.ServiceOrderID = pml.ServiceOrderID
        LEFT JOIN Employee emp WITH (NOLOCK) ON pml.EmployeeID = emp.EmployeeID
        WHERE so.HiringManager = @employeeId
        ORDER BY so.ServiceOrderID DESC, pml.Priority ASC, pml.MatchingIndexScore DESC
      `;

      const result = await pool.request()
        .input('employeeId', sql.Int, employeeId)
        .query(query);

      // Group the results by ServiceOrderID
      const serviceOrdersMap = new Map<number, ServiceOrderWithMatches>();
      
      result.recordset.forEach((record: any) => {
        const serviceOrderId = record.ServiceOrderID;
        
        if (!serviceOrdersMap.has(serviceOrderId)) {
          serviceOrdersMap.set(serviceOrderId, {
            ServiceOrderID: record.ServiceOrderID,
            AccountName: record.AccountName || '',
            Location: record.Location || '',
            CCARole: record.CCARole || '',
            HiringManager: record.HiringManager,
            RequiredFrom: record.RequiredFrom ? new Date(record.RequiredFrom).toISOString().split('T')[0] : '',
            ClientEvaluation: record.ClientEvaluation || '',
            SOState: record.SOState || '',
            AssignedToResource: record.AssignedToResource,
            Grade: record.Grade || '',
            matches: [],
            totalMatches: 0
          });
        }
        
        // Add priority matching data if it exists
        if (record.MatchingListID) {
          const serviceOrder = serviceOrdersMap.get(serviceOrderId)!;
          serviceOrder.matches.push({
            MatchingListID: record.MatchingListID,
            EmployeeID: record.EmployeeID,
            EmployeeName: record.EmployeeName || '',
            MatchingIndexScore: record.MatchingIndexScore,
            Remarks: record.Remarks || '',
            Priority: record.Priority,
            AssociateWilling: record.AssociateWilling,
            EmployeeGrade: record.EmployeeGrade || ''
          });
          serviceOrder.totalMatches = serviceOrder.matches.length;
        }
      });

      const serviceOrders = Array.from(serviceOrdersMap.values());

      res.json({
        success: true,
        data: serviceOrders,
        count: serviceOrders.length,
        employee: {
          id: employee.EmployeeID,
          name: employee.Name,
          email: employee.Email
        }
      });

    } catch (error) {
      console.error('Error fetching service orders by hiring manager:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch service orders',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Allocate a resource to a service order
  async allocateResourceToServiceOrder(req: Request, res: Response): Promise<void> {
    console.log('=== ALLOCATION REQUEST START ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    try {
      const { serviceOrderId, employeeId, userEmail } = req.body;
      
      console.log('Step 1: Validating input parameters');
      console.log('ServiceOrderID:', serviceOrderId, 'Type:', typeof serviceOrderId);
      console.log('EmployeeID:', employeeId, 'Type:', typeof employeeId);
      console.log('UserEmail:', userEmail, 'Type:', typeof userEmail);
      
      if (!serviceOrderId || !employeeId || !userEmail) {
        console.log('❌ VALIDATION FAILED: Missing required fields');
        res.status(400).json({ 
          success: false, 
          message: 'Service Order ID, Employee ID, and User Email are required' 
        });
        return;
      }

      console.log('Step 2: Establishing database connection');
      const pool = await sql.connect(dbConfig);
      console.log('✅ Database connection established');
      
      // Step 3: Check if ServiceOrder exists
      console.log('Step 3: Checking if Service Order exists');
      const serviceOrderExistsQuery = `
        SELECT ServiceOrderID, SOState, AssignedToResource, RequiredFrom, HiringManager
        FROM ServiceOrder
        WHERE ServiceOrderID = @serviceOrderId
      `;
      
      const serviceOrderExistsResult = await pool.request()
        .input('serviceOrderId', sql.Int, serviceOrderId)
        .query(serviceOrderExistsQuery);
        
      console.log('Service Order query result:', serviceOrderExistsResult.recordset);
      
      if (serviceOrderExistsResult.recordset.length === 0) {
        console.log('❌ Service Order not found');
        res.status(404).json({
          success: false,
          message: `Service Order #${serviceOrderId} not found in database`
        });
        return;
      }

      const serviceOrderData = serviceOrderExistsResult.recordset[0];
      console.log('✅ Service Order found:', serviceOrderData);

      // Step 4: Verify hiring manager permission
      console.log('Step 4: Verifying hiring manager permission');
      const hiringManagerQuery = `
        SELECT so.ServiceOrderID, so.HiringManager, emp.EmailID as HiringManagerEmail, emp.FirstName + ' ' + emp.LastName as HiringManagerName
        FROM ServiceOrder so
        INNER JOIN Employee emp ON so.HiringManager = emp.EmployeeID
        WHERE so.ServiceOrderID = @serviceOrderId
          AND emp.EmailID = @userEmail
      `;

      const hiringManagerResult = await pool.request()
        .input('serviceOrderId', sql.Int, serviceOrderId)
        .input('userEmail', sql.VarChar, userEmail)
        .query(hiringManagerQuery);

      console.log('Hiring manager check result:', hiringManagerResult.recordset);

      if (hiringManagerResult.recordset.length === 0) {
        console.log('❌ Permission denied - checking who the actual hiring manager is');
        
        const actualHiringManagerQuery = `
          SELECT so.ServiceOrderID, so.HiringManager, emp.EmailID as HiringManagerEmail, emp.FirstName + ' ' + emp.LastName as HiringManagerName
          FROM ServiceOrder so
          INNER JOIN Employee emp ON so.HiringManager = emp.EmployeeID
          WHERE so.ServiceOrderID = @serviceOrderId
        `;
        
        const actualHiringManagerResult = await pool.request()
          .input('serviceOrderId', sql.Int, serviceOrderId)
          .query(actualHiringManagerQuery);
          
        console.log('Actual hiring manager for this SO:', actualHiringManagerResult.recordset);
        
        res.status(403).json({
          success: false,
          message: `You do not have permission to allocate resources to this service order. Current user: ${userEmail}`
        });
        return;
      }

      console.log('✅ Hiring manager permission verified');

      // Step 5: Check service order state
      console.log('Step 5: Checking service order state');
      if (serviceOrderData.AssignedToResource) {
        console.log('❌ Service order already assigned to:', serviceOrderData.AssignedToResource);
        res.status(400).json({
          success: false,
          message: `Service order is already assigned to resource #${serviceOrderData.AssignedToResource}`
        });
        return;
      }

      if (serviceOrderData.SOState !== 'Open') {
        console.log('❌ Service order not in Open state. Current state:', serviceOrderData.SOState);
        res.status(400).json({
          success: false,
          message: `Service order is not in Open state. Current state: ${serviceOrderData.SOState}`
        });
        return;
      }

      console.log('✅ Service order is available for allocation');

      // Step 6: Check employee exists and is willing
      console.log('Step 6: Checking employee willingness');
      const employeeQuery = `
        SELECT pml.EmployeeID, pml.AssociateWilling, emp.FirstName + ' ' + emp.LastName as EmployeeName
        FROM PriorityMatchingList pml
        INNER JOIN Employee emp ON pml.EmployeeID = emp.EmployeeID
        WHERE pml.ServiceOrderID = @serviceOrderId 
          AND pml.EmployeeID = @employeeId
          AND pml.AssociateWilling = 1
      `;

      const employeeResult = await pool.request()
        .input('serviceOrderId', sql.Int, serviceOrderId)
        .input('employeeId', sql.Int, employeeId)
        .query(employeeQuery);

      console.log('Employee willingness check result:', employeeResult.recordset);

      if (employeeResult.recordset.length === 0) {
        console.log('❌ Employee not willing or not found - checking if employee exists in priority matching');
        
        const employeeExistsQuery = `
          SELECT pml.EmployeeID, pml.AssociateWilling, emp.FirstName + ' ' + emp.LastName as EmployeeName
          FROM PriorityMatchingList pml
          INNER JOIN Employee emp ON pml.EmployeeID = emp.EmployeeID
          WHERE pml.ServiceOrderID = @serviceOrderId 
            AND pml.EmployeeID = @employeeId
        `;
        
        const employeeExistsResult = await pool.request()
          .input('serviceOrderId', sql.Int, serviceOrderId)
          .input('employeeId', sql.Int, employeeId)
          .query(employeeExistsQuery);
          
        console.log('Employee exists check result:', employeeExistsResult.recordset);
          
        if (employeeExistsResult.recordset.length === 0) {
          console.log('❌ Employee not found in priority matching list');
          res.status(400).json({
            success: false,
            message: `Employee #${employeeId} is not in the priority matching list for Service Order #${serviceOrderId}`
          });
        } else {
          const employeeData = employeeExistsResult.recordset[0];
          console.log('❌ Employee found but not willing:', employeeData);
          res.status(400).json({
            success: false,
            message: `Employee ${employeeData.EmployeeName} is not willing for Service Order #${serviceOrderId}. Current willingness: ${employeeData.AssociateWilling}`
          });
        }
        return;
      }

      const employee = employeeResult.recordset[0];
      console.log('✅ Employee found and willing:', employee);

      // Step 7: Start database transaction
      console.log('Step 7: Starting database transaction');
      const transaction = new sql.Transaction(pool);
      await transaction.begin();
      console.log('✅ Transaction started');

      try {
        // Step 8: Update service order
        console.log('Step 8: Updating service order');
        const updateQuery = `
          UPDATE ServiceOrder 
          SET AssignedToResource = @employeeId,
              SOState = 'Assigned'
          WHERE ServiceOrderID = @serviceOrderId
        `;

        const updateResult = await transaction.request()
          .input('serviceOrderId', sql.Int, serviceOrderId)
          .input('employeeId', sql.Int, employeeId)
          .query(updateQuery);

        console.log('Service order update result:', updateResult);
        console.log('✅ Service order updated successfully');

        // Step 9: Get allocation ID and required date
        console.log('Step 9: Getting next allocation ID and required date');
        
        const allocationIdQuery = `SELECT ISNULL(MAX(AllocationID), 0) + 1 as NextAllocationID FROM Allocation`;
        const allocationIdResult = await transaction.request().query(allocationIdQuery);
        const nextAllocationId = allocationIdResult.recordset[0].NextAllocationID;
        console.log('Next AllocationID:', nextAllocationId);
        
        const requiredFromQuery = `SELECT RequiredFrom FROM ServiceOrder WHERE ServiceOrderID = @serviceOrderId`;
        const requiredFromResult = await transaction.request()
          .input('serviceOrderId', sql.Int, serviceOrderId)
          .query(requiredFromQuery);
        const requiredFromDate = requiredFromResult.recordset[0].RequiredFrom;
        console.log('Required From Date:', requiredFromDate);

        // Step 10: Insert allocation record
        console.log('Step 10: Inserting allocation record');
        const allocationQuery = `
          INSERT INTO Allocation (AllocationID, EmployeeID, ServiceOrderID, AllocationStartDate, AllocationEndDate)
          VALUES (@allocationId, @employeeId, @serviceOrderId, @allocationStartDate, NULL)
        `;

        const allocationResult = await transaction.request()
          .input('allocationId', sql.Int, nextAllocationId)
          .input('serviceOrderId', sql.Int, serviceOrderId)
          .input('employeeId', sql.Int, employeeId)
          .input('allocationStartDate', sql.DateTime, requiredFromDate)
          .query(allocationQuery);

        console.log('Allocation insert result:', allocationResult);
        console.log('✅ Allocation record inserted successfully');

        // Step 11: Update employee availability
        console.log('Step 11: Updating employee availability');
        const updateEmployeeQuery = `
          UPDATE Employee
          SET AvailableForDeployment = 0
          WHERE EmployeeID = @employeeId
        `;

        const updateEmployeeResult = await transaction.request()
          .input('employeeId', sql.Int, employeeId)
          .query(updateEmployeeQuery);

        console.log('Employee update result:', updateEmployeeResult);
        console.log('✅ Employee availability updated successfully');

        // Step 12: Commit transaction
        console.log('Step 12: Committing transaction');
        await transaction.commit();
        console.log('✅ Transaction committed successfully');

        console.log('=== ALLOCATION SUCCESS ===');
        res.json({
          success: true,
          message: `Successfully allocated ${employee.EmployeeName} to Service Order #${serviceOrderId}`,
          data: {
            serviceOrderId,
            employeeId,
            employeeName: employee.EmployeeName,
            allocationId: nextAllocationId,
            status: 'Assigned'
          }
        });

      } catch (transactionError) {
        console.log('❌ Transaction error occurred:', transactionError);
        console.log('Rolling back transaction...');
        
        try {
          await transaction.rollback();
          console.log('✅ Transaction rolled back successfully');
        } catch (rollbackError) {
          console.log('❌ Rollback failed:', rollbackError);
        }
        
        throw transactionError;
      }

    } catch (error) {
      console.log('=== ALLOCATION ERROR ===');
      console.error('Error allocating resource to service order:', error);
      console.error('Error type:', typeof error);
      console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('Request body was:', req.body);
      
      res.status(500).json({
        success: false,
        message: 'Failed to allocate resource',
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.name : 'Unknown',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : error) : undefined
      });
    }
  }
}
