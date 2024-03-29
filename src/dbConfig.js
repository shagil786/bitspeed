const pg = require("pg");
require("dotenv").config();

const pool = new pg.Pool({connectionString: `postgres://avnadmin:AVNS_vwAPO4U2-PU4nR-T2vG@pg-340a2961-shagilhmx-7748.a.aivencloud.com:22780/defaultdb?sslmode=require&sslrootcert=./src/ca.pem`});
async function setupDatabase() {
    const enumCheckQuery = `
    SELECT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'link_precedence_enum'
    );
`;

    const result = await pool.query(enumCheckQuery);
    const enumExists = result.rows[0].exists;

    if (!enumExists) {
        const createEnumQuery = `
        CREATE TYPE link_precedence_enum AS ENUM ('primary', 'secondary');
    `;
        await pool.query(createEnumQuery);
    }

    const createContactTable = `
    CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        phoneNumber VARCHAR,
        linkedId INT,
        email VARCHAR,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        deletedAt TIMESTAMP,
        linkPrecedence link_precedence_enum
    );
`;

    try {
        await pool.query(createContactTable);

        console.log("Database tables created or already exist.");
    } catch (error) {
        console.error("Error setting up database tables:", error);
        throw error;
    }
}

module.exports = { pool, setupDatabase };