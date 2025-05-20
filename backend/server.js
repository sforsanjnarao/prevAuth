import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import 'dotenv/config'
import connectDB from './src/db/db.js';
import authRouter from './src/routes/auth.route.js';
import userRouter from './src/routes/user.router.js';
import vaultRouter from './src/routes/vault.route.js';
import fakerDataRouter from './src/routes/fakerData.route.js'; 
import appTracker from './src/routes/appTracker.js'

const app = express();
const port = process.env.PORT || 3000;

connectDB(); 


// ['https://prevauth.vercel.app' || 'http://localhost:5173']
app.use(express.json());
app.use(cookieParser({withCredentials: true}));
app.use(cors({origin: 'http://localhost:5173',credentials:true}));
app.use('/api/auth',authRouter);
app.use('/api/user', userRouter);
app.use('/api/vault', vaultRouter);
app.use('/api/fakedata', fakerDataRouter);
app.use('/api/tracker',appTracker)

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
