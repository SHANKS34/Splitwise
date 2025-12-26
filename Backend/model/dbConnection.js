import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const dbURI = process.env.MONGO_URI;
    console.log("DB" , dbURI)
    if (!dbURI) {
      console.error('Error: DB_URL environment variable is not defined.');
      process.exit(1);
    }
    
    await mongoose.connect(dbURI);
    
    console.log('MongoDB connected successfully.');

  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

export default connectDB;