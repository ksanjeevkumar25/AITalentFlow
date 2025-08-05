"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceOrderController = void 0;
const mssql_1 = __importDefault(require("mssql"));
const config_1 = require("../config");
class ServiceOrderController {
    // Get all employees for HiringManager dropdown
    getAllSupervisors(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Attempting to connect to database for getAllEmployees...');
                const pool = yield mssql_1.default.connect(config_1.dbConfig);
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
                const result = yield pool.request().query(query);
                console.log(`Found ${result.recordset.length} employees`);
                const employees = result.recordset.map((record) => ({
                    EmployeeID: record.EmployeeID,
                    FullName: record.FullName || '',
                    EmailID: record.EmailID || ''
                }));
                res.json({
                    success: true,
                    data: employees,
                    count: employees.length
                });
            }
            catch (error) {
                console.error('Error fetching employees:', error);
                console.error('Database config:', Object.assign(Object.assign({}, config_1.dbConfig), { password: '***' }));
                res.status(500).json({
                    success: false,
                    message: 'Failed to fetch employees',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    // Get all grades for Grade dropdown
    getAllGrades(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Attempting to connect to database for getAllGrades...');
                const pool = yield mssql_1.default.connect(config_1.dbConfig);
                console.log('Database connection successful for getAllGrades');
                const query = `
        SELECT 
          GradeID,
          Grade,
          GradeDescription
        FROM Grade WITH (NOLOCK)
        ORDER BY Grade ASC
      `;
                const result = yield pool.request().query(query);
                console.log(`Found ${result.recordset.length} grades`);
                const grades = result.recordset.map((record) => ({
                    GradeID: record.GradeID,
                    Grade: record.Grade || '',
                    GradeDescription: record.GradeDescription || ''
                }));
                res.json({
                    success: true,
                    data: grades,
                    count: grades.length
                });
            }
            catch (error) {
                console.error('Error fetching grades:', error);
                console.error('Database config:', Object.assign(Object.assign({}, config_1.dbConfig), { password: '***' }));
                res.status(500).json({
                    success: false,
                    message: 'Failed to fetch grades',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    // Get all available skills
    getAllSkills(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Attempting to connect to database for getAllSkills...');
                const pool = yield mssql_1.default.connect(config_1.dbConfig);
                console.log('Database connection successful for getAllSkills');
                const query = `
        SELECT SkillID, SkillName, SkillDescription
        FROM Skill WITH (NOLOCK)
        ORDER BY SkillName ASC
      `;
                const result = yield pool.request().query(query);
                console.log(`Found ${result.recordset.length} skills`);
                const skills = result.recordset.map((record) => ({
                    SkillID: record.SkillID,
                    SkillName: record.SkillName || '',
                    SkillDescription: record.SkillDescription || ''
                }));
                res.json({
                    success: true,
                    data: skills,
                    count: skills.length
                });
            }
            catch (error) {
                console.error('Error fetching skills:', error);
                console.error('Database config:', Object.assign(Object.assign({}, config_1.dbConfig), { password: '***' }));
                res.status(500).json({
                    success: false,
                    message: 'Failed to fetch skills',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    // Create a new skill
    createSkill(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { SkillName, SkillDescription } = req.body;
                if (!SkillName) {
                    res.status(400).json({
                        success: false,
                        message: 'SkillName is required'
                    });
                    return;
                }
                const pool = yield mssql_1.default.connect(config_1.dbConfig);
                // Check if skill already exists
                const checkQuery = `SELECT SkillID FROM Skill WHERE SkillName = @skillName`;
                const checkResult = yield pool.request()
                    .input('skillName', mssql_1.default.VarChar, SkillName)
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
                const maxSkillIdResult = yield pool.request().query(maxSkillIdQuery);
                const newSkillId = maxSkillIdResult.recordset[0].NextSkillID;
                const query = `
        INSERT INTO Skill (SkillID, SkillName, SkillDescription)
        VALUES (@skillId, @skillName, @skillDescription)
      `;
                yield pool.request()
                    .input('skillId', mssql_1.default.Int, newSkillId)
                    .input('skillName', mssql_1.default.VarChar, SkillName)
                    .input('skillDescription', mssql_1.default.VarChar, SkillDescription || '')
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
            }
            catch (error) {
                console.error('Error creating skill:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to create skill',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    // Get all service orders (for admin/management view)
    getAllServiceOrders(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const pool = yield mssql_1.default.connect(config_1.dbConfig);
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
                const employeeResult = yield pool.request()
                    .input('email', mssql_1.default.VarChar, email)
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
                const result = yield pool.request().query(query);
                console.log(`Found ${result.recordset.length} service order records`);
                // Group results by ServiceOrderID
                const serviceOrdersMap = new Map();
                result.recordset.forEach((record) => {
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
                        const serviceOrder = serviceOrdersMap.get(serviceOrderId);
                        serviceOrder.skills.push({
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
            }
            catch (error) {
                console.error('Error fetching all service orders:', error);
                console.error('Database config:', Object.assign(Object.assign({}, config_1.dbConfig), { password: '***' }));
                res.status(500).json({
                    success: false,
                    message: 'Failed to fetch service orders',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    // Create a new service order
    createServiceOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Create service order request received');
                console.log('Request body:', JSON.stringify(req.body, null, 2));
                const { AccountName, Location, CCARole, HiringManager, RequiredFrom, ClientEvaluation, SOState, AssignedToResource, Grade, skills } = req.body;
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
                const pool = yield mssql_1.default.connect(config_1.dbConfig);
                console.log('Database connection successful');
                // Start transaction
                const transaction = new mssql_1.default.Transaction(pool);
                yield transaction.begin();
                console.log('Transaction started');
                try {
                    // Get the next ServiceOrderID by finding the maximum existing ID
                    console.log('Getting next ServiceOrderID...');
                    const maxIdQuery = `SELECT ISNULL(MAX(ServiceOrderID), 0) + 1 as NextServiceOrderID FROM ServiceOrder`;
                    const maxIdResult = yield new mssql_1.default.Request(transaction).query(maxIdQuery);
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
                    yield new mssql_1.default.Request(transaction)
                        .input('ServiceOrderID', mssql_1.default.Int, newServiceOrderId)
                        .input('AccountName', mssql_1.default.VarChar, AccountName)
                        .input('Location', mssql_1.default.VarChar, Location)
                        .input('CCARole', mssql_1.default.VarChar, CCARole)
                        .input('HiringManager', mssql_1.default.Int, HiringManager)
                        .input('RequiredFrom', mssql_1.default.Date, RequiredFrom)
                        .input('ClientEvaluation', mssql_1.default.Text, ClientEvaluation || '')
                        .input('SOState', mssql_1.default.VarChar, SOState || 'Open')
                        .input('AssignedToResource', mssql_1.default.Int, AssignedToResource || null)
                        .input('Grade', mssql_1.default.VarChar, Grade)
                        .query(serviceOrderQuery);
                    console.log('Service order created with ID:', newServiceOrderId);
                    // Insert skills if provided
                    if (skills && Array.isArray(skills) && skills.length > 0) {
                        console.log(`Inserting ${skills.length} skills...`);
                        for (const skill of skills) {
                            console.log('Inserting skill:', skill);
                            // Get the next SOSkillID
                            const maxSOSkillIdQuery = `SELECT ISNULL(MAX(SOSkillID), 0) + 1 as NextSOSkillID FROM ServiceOrderSkills`;
                            const maxSOSkillIdResult = yield new mssql_1.default.Request(transaction).query(maxSOSkillIdQuery);
                            const newSOSkillId = maxSOSkillIdResult.recordset[0].NextSOSkillID;
                            console.log('Next SOSkillID will be:', newSOSkillId);
                            const skillQuery = `
              INSERT INTO ServiceOrderSkills (SOSkillID, ServiceOrderID, SkillID, Mandatory, SkillLevel)
              VALUES (@soSkillId, @serviceOrderId, @skillId, @mandatory, @skillLevel)
            `;
                            yield new mssql_1.default.Request(transaction)
                                .input('soSkillId', mssql_1.default.Int, newSOSkillId)
                                .input('serviceOrderId', mssql_1.default.Int, newServiceOrderId)
                                .input('skillId', mssql_1.default.Int, skill.SkillID)
                                .input('mandatory', mssql_1.default.Bit, skill.Mandatory)
                                .input('skillLevel', mssql_1.default.Int, skill.SkillLevel)
                                .query(skillQuery);
                        }
                        console.log('All skills inserted successfully');
                    }
                    yield transaction.commit();
                    console.log('Transaction committed successfully');
                    res.json({
                        success: true,
                        message: 'Service order created successfully',
                        data: { ServiceOrderID: newServiceOrderId }
                    });
                }
                catch (transactionError) {
                    console.error('Transaction error:', transactionError);
                    yield transaction.rollback();
                    console.log('Transaction rolled back');
                    throw transactionError;
                }
            }
            catch (error) {
                console.error('Error creating service order:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to create service order',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    // Update an existing service order
    updateServiceOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { serviceOrderId } = req.params;
                const { AccountName, Location, CCARole, HiringManager, RequiredFrom, ClientEvaluation, SOState, AssignedToResource, Grade, skills } = req.body;
                if (!serviceOrderId) {
                    res.status(400).json({
                        success: false,
                        message: 'Service Order ID is required'
                    });
                    return;
                }
                const pool = yield mssql_1.default.connect(config_1.dbConfig);
                // Check if service order exists
                const checkQuery = `SELECT ServiceOrderID FROM ServiceOrder WHERE ServiceOrderID = @serviceOrderId`;
                const checkResult = yield pool.request()
                    .input('serviceOrderId', mssql_1.default.Int, parseInt(serviceOrderId))
                    .query(checkQuery);
                if (checkResult.recordset.length === 0) {
                    res.status(404).json({
                        success: false,
                        message: 'Service order not found'
                    });
                    return;
                }
                // Start transaction
                const transaction = new mssql_1.default.Transaction(pool);
                yield transaction.begin();
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
                    yield new mssql_1.default.Request(transaction)
                        .input('serviceOrderId', mssql_1.default.Int, parseInt(serviceOrderId))
                        .input('AccountName', mssql_1.default.VarChar, AccountName)
                        .input('Location', mssql_1.default.VarChar, Location)
                        .input('CCARole', mssql_1.default.VarChar, CCARole)
                        .input('HiringManager', mssql_1.default.Int, HiringManager)
                        .input('RequiredFrom', mssql_1.default.Date, RequiredFrom)
                        .input('ClientEvaluation', mssql_1.default.Text, ClientEvaluation || '')
                        .input('SOState', mssql_1.default.VarChar, SOState || 'Open')
                        .input('AssignedToResource', mssql_1.default.Int, AssignedToResource || null)
                        .input('Grade', mssql_1.default.VarChar, Grade)
                        .query(updateQuery);
                    // Handle skills update if provided
                    if (skills && Array.isArray(skills)) {
                        // Delete existing skills
                        const deleteSkillsQuery = `DELETE FROM ServiceOrderSkills WHERE ServiceOrderID = @serviceOrderId`;
                        yield new mssql_1.default.Request(transaction)
                            .input('serviceOrderId', mssql_1.default.Int, parseInt(serviceOrderId))
                            .query(deleteSkillsQuery);
                        // Insert new skills
                        for (const skill of skills) {
                            // Get the next SOSkillID
                            const maxSOSkillIdQuery = `SELECT ISNULL(MAX(SOSkillID), 0) + 1 as NextSOSkillID FROM ServiceOrderSkills`;
                            const maxSOSkillIdResult = yield new mssql_1.default.Request(transaction).query(maxSOSkillIdQuery);
                            const newSOSkillId = maxSOSkillIdResult.recordset[0].NextSOSkillID;
                            const skillQuery = `
              INSERT INTO ServiceOrderSkills (SOSkillID, ServiceOrderID, SkillID, Mandatory, SkillLevel)
              VALUES (@soSkillId, @serviceOrderId, @skillId, @mandatory, @skillLevel)
            `;
                            yield new mssql_1.default.Request(transaction)
                                .input('soSkillId', mssql_1.default.Int, newSOSkillId)
                                .input('serviceOrderId', mssql_1.default.Int, parseInt(serviceOrderId))
                                .input('skillId', mssql_1.default.Int, skill.SkillID)
                                .input('mandatory', mssql_1.default.Bit, skill.Mandatory)
                                .input('skillLevel', mssql_1.default.Int, skill.SkillLevel)
                                .query(skillQuery);
                        }
                    }
                    yield transaction.commit();
                    res.json({
                        success: true,
                        message: 'Service order updated successfully'
                    });
                }
                catch (transactionError) {
                    yield transaction.rollback();
                    throw transactionError;
                }
            }
            catch (error) {
                console.error('Error updating service order:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to update service order',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    // Delete a service order
    deleteServiceOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { serviceOrderId } = req.params;
                if (!serviceOrderId) {
                    res.status(400).json({
                        success: false,
                        message: 'Service Order ID is required'
                    });
                    return;
                }
                const pool = yield mssql_1.default.connect(config_1.dbConfig);
                // Check if service order exists
                const checkQuery = `SELECT ServiceOrderID FROM ServiceOrder WHERE ServiceOrderID = @serviceOrderId`;
                const checkResult = yield pool.request()
                    .input('serviceOrderId', mssql_1.default.Int, parseInt(serviceOrderId))
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
                const matchingResult = yield pool.request()
                    .input('serviceOrderId', mssql_1.default.Int, parseInt(serviceOrderId))
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
                yield pool.request()
                    .input('serviceOrderId', mssql_1.default.Int, parseInt(serviceOrderId))
                    .query(query);
                res.json({
                    success: true,
                    message: 'Service order deleted successfully'
                });
            }
            catch (error) {
                console.error('Error deleting service order:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to delete service order',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
    // Get a specific service order by ID
    getServiceOrderById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { serviceOrderId } = req.params;
                if (!serviceOrderId) {
                    res.status(400).json({
                        success: false,
                        message: 'Service Order ID is required'
                    });
                    return;
                }
                const pool = yield mssql_1.default.connect(config_1.dbConfig);
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
                const result = yield pool.request()
                    .input('serviceOrderId', mssql_1.default.Int, parseInt(serviceOrderId))
                    .query(query);
                if (result.recordset.length === 0) {
                    res.status(404).json({
                        success: false,
                        message: 'Service order not found'
                    });
                    return;
                }
                const firstRecord = result.recordset[0];
                const serviceOrder = {
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
                result.recordset.forEach((record) => {
                    if (record.SkillID) {
                        serviceOrder.skills.push({
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
            }
            catch (error) {
                console.error('Error fetching service order:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to fetch service order',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        });
    }
}
exports.ServiceOrderController = ServiceOrderController;
