import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

// Update the notkiyan user to have admin role
mongoose.connect(process.env.MONGO_URI || '').then(async () => {
    const result = await mongoose.connection.db.collection('MANAusers').updateOne(
        { email: 'charanems@gmail.com' },
        { $set: { role: 'admin' } }
    );
    console.log('Updated notkiyan to admin:', result.modifiedCount > 0 ? 'Success' : 'No change');
    process.exit(0);
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
