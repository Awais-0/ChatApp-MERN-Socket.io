import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log("Database connected succesfully. Host: "+ conn.connections[0].host);
    } catch (error) {
        console.error("Failed to connect to database");
    }
}