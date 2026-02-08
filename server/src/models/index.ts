import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME || '',
    process.env.DB_USER || '',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        dialect: 'postgres',
        logging: false, // Set to console.log if you want to see SQL queries
        define: {
            timestamps: false, // The existing schema doesn't seem to have timestamps
            freezeTableName: true, // Use the exact table names from the SQL script
        },
    }
);

export default sequelize;
