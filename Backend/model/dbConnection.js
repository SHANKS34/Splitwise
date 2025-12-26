import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const dbURI = process.env.DB_URL;
    if (!dbURI) {
      console.error('Error: DB_URL environment variable is not defined.');
      process.exit(1);
    }
    
    await mongoose.connect(dbURI);
    
    console.log('MongoDB connected successfully.');

  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;