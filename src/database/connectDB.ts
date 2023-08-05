import mongoose, { ConnectOptions } from 'mongoose';
import env from '../utils/env';

type MongooseOptionType = {
  useNewUrlParser: boolean;
  useUnifiedTopology: boolean;
};

const options: MongooseOptionType & ConnectOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const connectDB = async () => {
  try {
    await mongoose.connect(env.DATABASE_URI, options);
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;
