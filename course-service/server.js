import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import connectToDatabase from './src/db/db.js';

connectToDatabase();


app.listen(3002, () => {
    console.log('Server is running on port 3002');
});