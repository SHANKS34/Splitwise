import express from 'express';
import dotenv from 'dotenv';
import authRouter from './routes/authRouter.js';
import connectDB from './model/dbConnection.js';
import cors from 'cors';
import OtherRoutes  from './routes/OtherRoutes.js';
dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 8080;

app.use('/auth', authRouter);
app.use('/splitwise' , OtherRoutes);
app.get('/', (req, res) => {
    res.send("Auth server");
});

app.get('/groups', (req, res) => {
    console.log("ID", req.query);
    res.send({ message: "WORKING" });
});


app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});