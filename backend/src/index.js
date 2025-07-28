import express from 'express'
import authRouter from './routes/auth.route.js';
import dotenv from "dotenv"
import { connectDB } from './database/connect.js';
import cookieParser from 'cookie-parser'

dotenv.config();

const App = express();
App.use(express.json({limit: '16kb'}));
App.use(express.urlencoded({extended: true, limit: '16kb'}));
App.use(cookieParser())
App.use(express.static('public'))
const port = process.env.PORT


connectDB().then(()=>{
    App.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
});

App.use('/api/auth', authRouter);