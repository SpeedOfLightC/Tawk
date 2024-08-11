import dotenv from 'dotenv';
import connectDB from './db/index.js';
import { app } from './app.js';
import setupSocket from './socket.js';


dotenv.config({
    path: './.env'
});


connectDB()
.then(() => {
    const server = app.listen(process.env.PORT || 5000, () => {
        console.log(`App is running on port ${process.env.PORT}`);
    })

    setupSocket(server);
})
.catch((error) => {
    console.log(`App connection failed !! ${error}`);
}) 