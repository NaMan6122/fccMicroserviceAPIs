import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended: true,
}));

app.listen(4500, () => {
    console.log("Server is running on port 4500");
});

const MONGO_URI ="mongodb+srv://namang2510:Vz2ODhh02H8uK1Je@cluster0.ph6eckz.mongodb.net";
const DB_NAME = "ExerciseTracker";

const connectDB = async() => {
    try {
        const connectionInstance = await mongoose.connect(`${MONGO_URI}/${DB_NAME}`);
        console.log(`MongoDB Connected Successfully!! ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log(`Error: ${error.message}`);
        process.exit(1);
    }
}
connectDB();

//defining the User Schema:
const UserModel = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    }
});
const User = mongoose.model("User", UserModel);

//defining the User-Exercise Schema:
const ExerciseModel = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
        //unique: true, not including this because a test acse failed due to unique userID.
    },
    description: {
        type: String,
        required: true,
    }, 
    duration: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: new Date(),
    },
});

const Exercise = mongoose.model("Exercise", ExerciseModel);

//handling the post request for user creation:
app.post("/api/users", async (req, res) => {
    const username = req.body.username;
    //const user = await User.create({username})
    const user = new User({username});
    user.save();
    res.json(user);
});

//handling the get request to get a list of all users:
app.get("/api/users", async (req, res) => {
    const userList = await User.find({});
    res.json(userList);
});

//handling posting an exercise request(post):
app.post("/api/users/:_id/exercises", async (req, res) => {
    console.log(req.body);
    const id = req.params._id;
    //now based on this id, we have to create a new Exercise object.
    const newExercise = {
        userID: id,
        description: req.body.description,
        duration: req.body.duration,
    }
    if(req.body.date != ""){ //if date exists, else it will take the default value from the schema.
        newExercise.date = req.body.date;
    }
    const exercise = new Exercise(newExercise);
    const user = await User.findById(id);
    if(!user){ //if the user exists.
        console.log("User not found");
        return res.json({error: "User not found"});
    }
    exercise.save();
    res.json({
        _id: user._id,
        username: user.username,
        description : exercise.description,
        duration : exercise.duration,
        date : exercise.date.toDateString(),
    });
});

//handling log request using user's id and return an array of logs of all exercises and their count.
app.get("/api/users/:_id/logs", async (req, res) => {
    const id = req.params._id;
    const user = await User.findById(id);
    if(!user){
        console.log("No User");
        res.send("user not found");
    }

    //building the search query.
    let ourQuery = {userID : id};

    let {from, to, limit} = req.query; //destructuring the queries from req.queries.
    if(from || to){
        ourQuery.date = {};
        if(from){
        ourQuery.date.$gte = new Date(from); //greater than or equal to from.
        }
        if(to){
        ourQuery.date.$lte = new Date(to); //less than or equal to to.
        }
    }
    limit = parseInt(limit); //making sure/ converting the obtained limit query param as number.

    const exerciseList = Exercise.find(ourQuery).limit(limit) //now this exerciseList is an array of documents where userID field is same as id.
    //using map function to apply toDateString() method as per the requiremnet to the incoming date, which is a Date object.
    const modifiedList = exerciseList.map((value) => {
        return{
          description: value.description,
          duration: value.duration,
          date: value.date.toDateString(),
        }
      });
    const resObj = {
        _id: user._id,
        username: user.username,
        count: modifiedList.length,
        log: modifiedList,
    }
    res.json(resObj);
});

//DONE! GG!!