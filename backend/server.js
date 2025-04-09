import express from 'express';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import 'dotenv/config'
import connectDB from './src/db/db.js';
import authRouter from './src/routes/auth.route.js';
import userRouter from './src/routes/user.router.js';

const app = express();
const port = process.env.PORT || 3000;

connectDB(); 



app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials:true}));
app.use('/api/auth',authRouter);
app.use('/api/user', userRouter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
