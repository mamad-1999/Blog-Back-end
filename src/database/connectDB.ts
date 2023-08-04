import mongoose, { ConnectOptions } from "mongoose";

type MongooseOptionType = {
    useNewUrlParser: boolean,
    useUnifiedTopology: boolean,
}

const options: MongooseOptionType & ConnectOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI?.toString()!, options)
    } catch (error) {
        console.log(error)
    }
};

export default connectDB;