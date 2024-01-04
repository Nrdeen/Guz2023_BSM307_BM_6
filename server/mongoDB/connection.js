import mongoose from "mongoose";
const mongoDBConnect = () => {
  try {
    const connectionString = "mongodb+srv://nrdeen:Doodo1020@cluster0.gqll7wk.mongodb.net";

    mongoose.connect(connectionString, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log("MongoDB - Connected");
  } catch (error) {
    console.log("Error - MongoDB Connection " + error);
  }
};
export default mongoDBConnect;
