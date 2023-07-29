import mongoose from "mongoose";

type ConnectOptions = {
    useNewUrlParser: Boolean,
    useUnifiedTopology: Boolean,
}

const options: ConnectOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}

const connectDB = async () => {
    try {
        // await mongoose.connect()
    } catch (error) {
        
    }
}