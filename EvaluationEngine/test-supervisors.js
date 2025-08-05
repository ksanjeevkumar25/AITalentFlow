// Test script to check the supervisors endpoint
const express = require('express');
const sql = require('mssql');
const { dbConfig } = require('./src/config');

async function testSupervisorsEndpoint() {
    try {
        console.log('Testing supervisors endpoint...');
        console.log('Database config:', { ...dbConfig, password: '***' });
        
        const pool = await sql.connect(dbConfig);
        console.log('Database connection successful');
        
        const query = `
            SELECT DISTINCT
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
        console.log('Sample employees:', result.recordset.slice(0, 3));
        
        await pool.close();
        console.log('Test completed successfully');
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testSupervisorsEndpoint();
