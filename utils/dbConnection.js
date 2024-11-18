import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);

    console.log(`Cluster connection: ${connection.connection.host}`);
  } catch (error) {
    console.error(
      `An error occurred while connecting. Details: ${error.message}`
    );
    process.exit(1);
  }
};

export default connectDB;
