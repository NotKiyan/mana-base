import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

mongoose.connect(process.env.MONGO_URI || '').then(async () => {
    const user = await mongoose.connection.db.collection('users').findOne({ email: 'admin@mananexus.com' });
    console.log('Admin user in DB:', JSON.stringify(user, null, 2));
    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
