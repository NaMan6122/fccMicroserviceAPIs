import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dns from "dns";

const MONGO_URI ="mongodb+srv://namang2510:Vz2ODhh02H8uK1Je@cluster0.ph6eckz.mongodb.net";
const DB_NAME = "URLshortener";

const app = express();
const port = 4500;

app.use(cors());
app.use(express.urlencoded({
    extended: true,
}));
app.use(express.json());
app.listen(4500, () => {
  console.log(`Server is running on port 4500`);
});

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

const URLSchema = new mongoose.Schema({
    originalUrl: {
      type: String,
      unique: true,
      required: true,
    },
    shortUrl: {
      type: String,
      unique: true,
      required: true,
    }
  });

const URLmodel = mongoose.model("URLmodel", URLSchema);

//Handling GET requests by the user:
app.get("/api/shorturl/:shorturl", async (req, res) => {
    const shortUrl = req.params.shorturl;
    if(!shortUrl){
        return res.json({message: "Invalid URL"});
    }
    try {
        const result = await URLmodel.findOne({ shortUrl });
        console.log(result);
        if (result) {
          const originalUrl = result.originalUrl;
          return res.redirect(originalUrl);
        } else {
          return res.json({ error: "invalid url" });
        }
      } catch (error) {
        return res.json({ error: "invalid url" });
      }
})

//Handling POST requests by the user:
app.post("/api/shorturl", (req, res) => {
  console.log(req.body);
  const url = req.body.url;

  //validating the url:
  try {
    const urlObj = new URL(url);
    dns.lookup(urlObj.hostname, async (error, address) => {
      if (error || !address) {
        return res.json({ error: "invalid url" });
      }

      // We have a valid URL with a correct format and a valid domain.
      const originalUrl = urlObj.href;
      let shortUrl = "";
      const latestShortUrl = await URLmodel.find({}).sort({shortUrl : -1}).limit(1);

      if(latestShortUrl.length > 0){
        shortUrl = (parseInt(latestShortUrl[0].shortUrl) + 1).toString();
      }else{
        shortUrl = "1";
      }

      const resObj = { originalUrl: originalUrl, shortUrl: shortUrl };

      try { //saving the url in the database:
        let newUrl = new URLmodel(resObj);
        await newUrl.save();
        console.log("saved!");
        return res.json({ original_url: originalUrl, short_url: shortUrl });

      } catch (saveError) {
        return res.json({ error: "could not save the URL" });
      }
    });
    
  } catch (validationError) {
    return res.json({ error: "invalid url" });
  }
});
