import { Request, Response } from 'express';
import sql from 'mssql';
import { dbConfig } from '../config';

export interface ServiceOrder {
  ServiceOrderID?: number;
  AccountName: string;
  Location: string;
  CCARole: string;
  HiringManager: number;
  RequiredFrom: string;
  ClientEvaluation: string;
  SOState: string;
  AssignedToResource?: number;
  Grade: string;
  skills?: ServiceOrderSkill[];
}

export interface ServiceOrderSkill {
  SOSkillID?: number;
  ServiceOrderID?: number;
  SkillID: number;
  SkillName?: string;
  SkillDescription?: string;
  Mandatory: boolean;
  SkillLevel: number;
}

export interface Skill {
  SkillID: number;
  SkillName: string;
  SkillDescription: string;
}

export interface Grade {
  GradeID: number;
  Grade: string;
  GradeDescription: string;
}

export class ServiceOrderController {
  
  // Get all employees for HiringManager dropdown
  async getAllSupervisors(req: Request, res: Response): Promise<void> {
    try {
      console.log('Attempting to connect to database for getAllEmployees...');
      const pool = await sql.connect(dbConfig);
      console.log('Database connection successful for getAllEmployees');
      
      const query = `
        SELECT 
          EmployeeID,
          FirstName + ' ' + LastName as FullName,
          EmailID
        FROM Employee WITH (NOLOCK)
        WHERE EmployeeID IS NOT NULL 
          AND FirstName IS NOT NULL 
          AND LastName IS NOT NULL
        ORDER BY FirstName, LastName ASC
      `;

      const result = await pool.request().query(query);
      console.log(`Found ${result.recordset.length} employees`);

      const employees = result.recordset.map((record: any) => ({
        EmployeeID: record.EmployeeID,
        FullName: record.FullName || '',
        EmailID: record.EmailID || ''
      }));

      res.json({
        success: true,
        data: employees,
        count: employees.length
      });

    } catch (error) {
      console.error('Error fetching employees:', error);
      console.error('Database config:', { ...dbConfig, password: '***' });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch employees',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get all grades for Grade dropdown
  async getAllGrades(req: Request, res: Response): Promise<void> {
    try {
      console.log('Attempting to connect to database for getAllGrades...');
      const pool = await sql.connect(dbConfig);
      console.log('Database connection successful for getAllGrades');
      
      const query = `
        SELECT 
          GradeID,
          Grade,
          GradeDescription
        FROM Grade WITH (NOLOCK)
        ORDER BY Grade ASC
      `;

      const result = await pool.request().query(query);
      console.log(`Found ${result.recordset.length} grades`);

      const grades = result.recordset.map((record: any) => ({
        GradeID: record.GradeID,
        Grade: record.Grade || '',
        GradeDescription: record.GradeDescription || ''
      }));

      res.json({
        success: true,
        data: grades,
        count: grades.length
      });

    } catch (error) {
      console.error('Error fetching grades:', error);
      console.error('Database config:', { ...dbConfig, password: '***' });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch grades',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get all available skills
  async getAllSkills(req: Request, res: Response): Promise<void> {
    try {
      console.log('Attempting to connect to database for getAllSkills...');
      const pool = await sql.connect(dbConfig);
      console.log('Database connection successful for getAllSkills');
      
      const query = `
        SELECT SkillID, SkillName, SkillDescription
        FROM Skill WITH (NOLOCK)
        ORDER BY SkillName ASC
      `;

      const result = await pool.request().query(query);
      console.log(`Found ${result.recordset.length} skills`);

      const skills: Skill[] = result.recordset.map((record: any) => ({
        SkillID: record.SkillID,
        SkillName: record.SkillName || '',
        SkillDescription: record.SkillDescription || ''
      }));

      res.json({
        success: true,
        data: skills,
        count: skills.length
      });

    } catch (error) {
      console.error('Error fetching skills:', error);
      console.error('Database config:', { ...dbConfig, password: '***' });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch skills',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Create a new skill
  async createSkill(req: Request, res: Response): Promise<void> {
    try {
      const { SkillName, SkillDescription } = req.body;

      if (!SkillName) {
        res.status(400).json({
          success: false,
          message: 'SkillName is required'
        });
        return;
      }

      const pool = await sql.connect(dbConfig);
      
      // Check if skill already exists
      const checkQuery = `SELECT SkillID FROM Skill WHERE SkillName = @skillName`;
      const checkResult = await pool.request()
        .input('skillName', sql.VarChar, SkillName)
        .query(checkQuery);

      if (checkResult.recordset.length > 0) {
        res.status(400).json({
          success: false,
          message: 'Skill with this name already exists'
        });
        return;
      }

      // Get the next SkillID
      const maxSkillIdQuery = `SELECT ISNULL(MAX(SkillID), 0) + 1 as NextSkillID FROM Skill`;
      const maxSkillIdResult = await pool.request().query(maxSkillIdQuery);
      const newSkillId = maxSkillIdResult.recordset[0].NextSkillID;

      const query = `
        INSERT INTO Skill (SkillID, SkillName, SkillDescription)
        VALUES (@skillId, @skillName, @skillDescription)
      `;

      await pool.request()
        .input('skillId', sql.Int, newSkillId)
        .input('skillName', sql.VarChar, SkillName)
        .input('skillDescription', sql.VarChar, SkillDescription || '')
        .query(query);

      res.json({
        success: true,
        message: 'Skill created successfully',
        data: { 
          SkillID: newSkillId,
          SkillName,
          SkillDescription: SkillDescription || ''
        }
      });

    } catch (error) {
      console.error('Error creating skill:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create skill',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // Get all service orders (for admin/management view)
  async getAllServiceOrders(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.params;
      console.log('getAllServiceOrders called with email:', email);
      
      if (!email) {
        console.log('No email provided');
        res.status(400).json({ 
          success: false, 
          message: 'Email is required' 
        });
        return;
      }

      console.log('Attempting to connect to database for getAllServiceOrders...');
      const pool = await sql.connect(dbConfig);
      console.log('Database connection successful for getAllServiceOrders');
      
      // First verify the user exists
      const employeeQuery = `
        SELECT EmployeeID, 
               FirstName + ' ' + LastName as Name, 
               EmailID as Email 
        FROM Employee 
        WHERE EmailID = @email
      `;

      console.log('Checking if employee exists with email:', email);
      const employeeResult = await pool.request()
        .input('email', sql.VarChar, email)
        .query(employeeQuery);

      if (employeeResult.recordset.length === 0) {
        console.log('Employee not found for email:', email);
        res.status(404).json({
          success: false,
          message: 'Employee not found with the provided email'
        });
        return;
      }

      console.log('Employee found:', employeeResult.recordset[0]);

      // Query to get all service orders with their skills
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
          sos.SOSkillID,
          sos.SkillID,
          sos.Mandatory,
          sos.SkillLevel,
          s.SkillName,
          s.SkillDescription
        FROM ServiceOrder so WITH (NOLOCK)
        LEFT JOIN ServiceOrderSkills sos WITH (NOLOCK) ON so.ServiceOrderID = sos.ServiceOrderID
        LEFT JOIN Skill s WITH (NOLOCK) ON sos.SkillID = s.SkillID
        ORDER BY so.ServiceOrderID DESC, s.SkillName ASC
      `;

      console.log('Executing service orders query...');
      const result = await pool.request().query(query);
      console.log(`Found ${result.recordset.length} service order records`);

      // Group results by ServiceOrderID
      const serviceOrdersMap = new Map<number, ServiceOrder>();
      
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
            skills: []
          });
        }
        
        // Add skill data if it exists
        if (record.SkillID) {
          const serviceOrder = serviceOrdersMap.get(serviceOrderId)!;
          serviceOrder.skills!.push({
            SOSkillID: record.SOSkillID,
            ServiceOrderID: record.ServiceOrderID,
            SkillID: record.SkillID,
            SkillName: record.SkillName || '',
            SkillDescription: record.SkillDescription || '',
            Mandatory: record.Mandatory,
            SkillLevel: record.SkillLevel
          });
        }
      });

      const serviceOrders = Array.from(serviceOrdersMap.values());
      console.log(`Returning ${serviceOrders.length} service orders`);

      res.json({
        success: true,
        data: serviceOrders,
        count: serviceOrders.length
      });

    } catch (error) {
      console.error('Error fetching all service orders:', error);
      console.error('Database config:', { ...dbConfig, password: '***' });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch service orders',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Create a new service order
  async createServiceOrder(req: Request, res: Response): Promise<void> {
    try {
      console.log('Create service order request received');
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      
      const {
        AccountName,
        Location,
        CCARole,
        HiringManager,
        RequiredFrom,
        ClientEvaluation,
        SOState,
        AssignedToResource,
        Grade,
        skills
      } = req.body;

      console.log('Extracted fields:', {
        AccountName,
        Location,
        CCARole,
        HiringManager,
        RequiredFrom,
        ClientEvaluation,
        SOState,
        AssignedToResource,
        Grade,
        skillsCount: skills ? skills.length : 0
      });

      // Validate required fields
      if (!AccountName || !Location || !CCARole || !HiringManager || !RequiredFrom || !Grade) {
        console.log('Validation failed - missing required fields');
        res.status(400).json({
          success: false,
          message: 'Missing required fields: AccountName, Location, CCARole, HiringManager, RequiredFrom, Grade'
        });
        return;
      }

      console.log('Validation passed, connecting to database...');
      const pool = await sql.connect(dbConfig);
      console.log('Database connection successful');
      
      // Start transaction
      const transaction = new sql.Transaction(pool);
      await transaction.begin();
      console.log('Transaction started');

      try {
        // Get the next ServiceOrderID by finding the maximum existing ID
        console.log('Getting next ServiceOrderID...');
        const maxIdQuery = `SELECT ISNULL(MAX(ServiceOrderID), 0) + 1 as NextServiceOrderID FROM ServiceOrder`;
        const maxIdResult = await new sql.Request(transaction).query(maxIdQuery);
        const newServiceOrderId = maxIdResult.recordset[0].NextServiceOrderID;
        console.log('Next ServiceOrderID will be:', newServiceOrderId);

        // Insert service order with explicit ServiceOrderID
        const serviceOrderQuery = `
          INSERT INTO ServiceOrder (
            ServiceOrderID, AccountName, Location, CCARole, HiringManager, 
            RequiredFrom, ClientEvaluation, SOState, AssignedToResource, Grade
          )
          VALUES (
            @ServiceOrderID, @AccountName, @Location, @CCARole, @HiringManager,
            @RequiredFrom, @ClientEvaluation, @SOState, @AssignedToResource, @Grade
          )
        `;

        console.log('Executing service order insert query...');
        console.log('Parameters:', {
          ServiceOrderID: newServiceOrderId,
          AccountName,
          Location,
          CCARole,
          HiringManager,
          RequiredFrom,
          ClientEvaluation: ClientEvaluation || '',
          SOState: SOState || 'Open',
          AssignedToResource: AssignedToResource || null,
          Grade
        });

        await new sql.Request(transaction)
          .input('ServiceOrderID', sql.Int, newServiceOrderId)
          .input('AccountName', sql.VarChar, AccountName)
          .input('Location', sql.VarChar, Location)
          .input('CCARole', sql.VarChar, CCARole)
          .input('HiringManager', sql.Int, HiringManager)
          .input('RequiredFrom', sql.Date, RequiredFrom)
          .input('ClientEvaluation', sql.Text, ClientEvaluation || '')
          .input('SOState', sql.VarChar, SOState || 'Open')
          .input('AssignedToResource', sql.Int, AssignedToResource || null)
          .input('Grade', sql.VarChar, Grade)
          .query(serviceOrderQuery);

        console.log('Service order created with ID:', newServiceOrderId);

        // Insert skills if provided
        if (skills && Array.isArray(skills) && skills.length > 0) {
          console.log(`Inserting ${skills.length} skills...`);
          for (const skill of skills) {
            console.log('Inserting skill:', skill);
            
            // Get the next SOSkillID
            const maxSOSkillIdQuery = `SELECT ISNULL(MAX(SOSkillID), 0) + 1 as NextSOSkillID FROM ServiceOrderSkills`;
            const maxSOSkillIdResult = await new sql.Request(transaction).query(maxSOSkillIdQuery);
            const newSOSkillId = maxSOSkillIdResult.recordset[0].NextSOSkillID;
            console.log('Next SOSkillID will be:', newSOSkillId);
            
            const skillQuery = `
              INSERT INTO ServiceOrderSkills (SOSkillID, ServiceOrderID, SkillID, Mandatory, SkillLevel)
              VALUES (@soSkillId, @serviceOrderId, @skillId, @mandatory, @skillLevel)
            `;

            await new sql.Request(transaction)
              .input('soSkillId', sql.Int, newSOSkillId)
              .input('serviceOrderId', sql.Int, newServiceOrderId)
              .input('skillId', sql.Int, skill.SkillID)
              .input('mandatory', sql.Bit, skill.Mandatory)
              .input('skillLevel', sql.Int, skill.SkillLevel)
              .query(skillQuery);
          }
          console.log('All skills inserted successfully');
        }

        await transaction.commit();
        console.log('Transaction committed successfully');

        res.json({
          success: true,
          message: 'Service order created successfully',
          data: { ServiceOrderID: newServiceOrderId }
        });

      } catch (transactionError) {
        console.error('Transaction error:', transactionError);
        await transaction.rollback();
        console.log('Transaction rolled back');
        throw transactionError;
      }

    } catch (error) {
      console.error('Error creating service order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create service order',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update an existing service order
  async updateServiceOrder(req: Request, res: Response): Promise<void> {
    try {
      const { serviceOrderId } = req.params;
      const {
        AccountName,
        Location,
        CCARole,
        HiringManager,
        RequiredFrom,
        ClientEvaluation,
        SOState,
        AssignedToResource,
        Grade,
        skills
      } = req.body;

      if (!serviceOrderId) {
        res.status(400).json({
          success: false,
          message: 'Service Order ID is required'
        });
        return;
      }

      const pool = await sql.connect(dbConfig);
      
      // Check if service order exists
      const checkQuery = `SELECT ServiceOrderID FROM ServiceOrder WHERE ServiceOrderID = @serviceOrderId`;
      const checkResult = await pool.request()
        .input('serviceOrderId', sql.Int, parseInt(serviceOrderId))
        .query(checkQuery);

      if (checkResult.recordset.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Service order not found'
        });
        return;
      }

      // Start transaction
      const transaction = new sql.Transaction(pool);
      await transaction.begin();

      try {
        // Update service order
        const updateQuery = `
          UPDATE ServiceOrder SET
            AccountName = @AccountName,
            Location = @Location,
            CCARole = @CCARole,
            HiringManager = @HiringManager,
            RequiredFrom = @RequiredFrom,
            ClientEvaluation = @ClientEvaluation,
            SOState = @SOState,
            AssignedToResource = @AssignedToResource,
            Grade = @Grade
          WHERE ServiceOrderID = @serviceOrderId
        `;

        await new sql.Request(transaction)
          .input('serviceOrderId', sql.Int, parseInt(serviceOrderId))
          .input('AccountName', sql.VarChar, AccountName)
          .input('Location', sql.VarChar, Location)
          .input('CCARole', sql.VarChar, CCARole)
          .input('HiringManager', sql.Int, HiringManager)
          .input('RequiredFrom', sql.Date, RequiredFrom)
          .input('ClientEvaluation', sql.Text, ClientEvaluation || '')
          .input('SOState', sql.VarChar, SOState || 'Open')
          .input('AssignedToResource', sql.Int, AssignedToResource || null)
          .input('Grade', sql.VarChar, Grade)
          .query(updateQuery);

        // Handle skills update if provided
        if (skills && Array.isArray(skills)) {
          // Delete existing skills
          const deleteSkillsQuery = `DELETE FROM ServiceOrderSkills WHERE ServiceOrderID = @serviceOrderId`;
          await new sql.Request(transaction)
            .input('serviceOrderId', sql.Int, parseInt(serviceOrderId))
            .query(deleteSkillsQuery);

          // Insert new skills
          for (const skill of skills) {
            // Get the next SOSkillID
            const maxSOSkillIdQuery = `SELECT ISNULL(MAX(SOSkillID), 0) + 1 as NextSOSkillID FROM ServiceOrderSkills`;
            const maxSOSkillIdResult = await new sql.Request(transaction).query(maxSOSkillIdQuery);
            const newSOSkillId = maxSOSkillIdResult.recordset[0].NextSOSkillID;
            
            const skillQuery = `
              INSERT INTO ServiceOrderSkills (SOSkillID, ServiceOrderID, SkillID, Mandatory, SkillLevel)
              VALUES (@soSkillId, @serviceOrderId, @skillId, @mandatory, @skillLevel)
            `;

            await new sql.Request(transaction)
              .input('soSkillId', sql.Int, newSOSkillId)
              .input('serviceOrderId', sql.Int, parseInt(serviceOrderId))
              .input('skillId', sql.Int, skill.SkillID)
              .input('mandatory', sql.Bit, skill.Mandatory)
              .input('skillLevel', sql.Int, skill.SkillLevel)
              .query(skillQuery);
          }
        }

        await transaction.commit();

        res.json({
          success: true,
          message: 'Service order updated successfully'
        });

      } catch (transactionError) {
        await transaction.rollback();
        throw transactionError;
      }

    } catch (error) {
      console.error('Error updating service order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update service order',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Delete a service order
  async deleteServiceOrder(req: Request, res: Response): Promise<void> {
    try {
      const { serviceOrderId } = req.params;

      if (!serviceOrderId) {
        res.status(400).json({
          success: false,
          message: 'Service Order ID is required'
        });
        return;
      }

      const pool = await sql.connect(dbConfig);
      
      // Check if service order exists
      const checkQuery = `SELECT ServiceOrderID FROM ServiceOrder WHERE ServiceOrderID = @serviceOrderId`;
      const checkResult = await pool.request()
        .input('serviceOrderId', sql.Int, parseInt(serviceOrderId))
        .query(checkQuery);

      if (checkResult.recordset.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Service order not found'
        });
        return;
      }

      // Check if there are any priority matching records for this service order
      const matchingQuery = `SELECT COUNT(*) as MatchCount FROM PriorityMatchingList WHERE ServiceOrderID = @serviceOrderId`;
      const matchingResult = await pool.request()
        .input('serviceOrderId', sql.Int, parseInt(serviceOrderId))
        .query(matchingQuery);

      const hasMatches = matchingResult.recordset[0].MatchCount > 0;

      if (hasMatches) {
        res.status(400).json({
          success: false,
          message: 'Cannot delete service order with existing priority matching records. Please remove matching records first.'
        });
        return;
      }

      const query = `DELETE FROM ServiceOrder WHERE ServiceOrderID = @serviceOrderId`;

      await pool.request()
        .input('serviceOrderId', sql.Int, parseInt(serviceOrderId))
        .query(query);

      res.json({
        success: true,
        message: 'Service order deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting service order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete service order',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get a specific service order by ID
  async getServiceOrderById(req: Request, res: Response): Promise<void> {
    try {
      const { serviceOrderId } = req.params;

      if (!serviceOrderId) {
        res.status(400).json({
          success: false,
          message: 'Service Order ID is required'
        });
        return;
      }

      const pool = await sql.connect(dbConfig);
      
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
          sos.SOSkillID,
          sos.SkillID,
          sos.Mandatory,
          sos.SkillLevel,
          s.SkillName,
          s.SkillDescription
        FROM ServiceOrder so WITH (NOLOCK)
        LEFT JOIN ServiceOrderSkills sos WITH (NOLOCK) ON so.ServiceOrderID = sos.ServiceOrderID
        LEFT JOIN Skill s WITH (NOLOCK) ON sos.SkillID = s.SkillID
        WHERE so.ServiceOrderID = @serviceOrderId
        ORDER BY s.SkillName ASC
      `;

      const result = await pool.request()
        .input('serviceOrderId', sql.Int, parseInt(serviceOrderId))
        .query(query);

      if (result.recordset.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Service order not found'
        });
        return;
      }

      const firstRecord = result.recordset[0];
      const serviceOrder: ServiceOrder = {
        ServiceOrderID: firstRecord.ServiceOrderID,
        AccountName: firstRecord.AccountName || '',
        Location: firstRecord.Location || '',
        CCARole: firstRecord.CCARole || '',
        HiringManager: firstRecord.HiringManager,
        RequiredFrom: firstRecord.RequiredFrom ? new Date(firstRecord.RequiredFrom).toISOString().split('T')[0] : '',
        ClientEvaluation: firstRecord.ClientEvaluation || '',
        SOState: firstRecord.SOState || '',
        AssignedToResource: firstRecord.AssignedToResource,
        Grade: firstRecord.Grade || '',
        skills: []
      };

      // Add skills if they exist
      result.recordset.forEach((record: any) => {
        if (record.SkillID) {
          serviceOrder.skills!.push({
            SOSkillID: record.SOSkillID,
            ServiceOrderID: record.ServiceOrderID,
            SkillID: record.SkillID,
            SkillName: record.SkillName || '',
            SkillDescription: record.SkillDescription || '',
            Mandatory: record.Mandatory,
            SkillLevel: record.SkillLevel
          });
        }
      });

      res.json({
        success: true,
        data: serviceOrder
      });

    } catch (error) {
      console.error('Error fetching service order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch service order',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
