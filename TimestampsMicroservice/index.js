import express from "express";
import cors from "cors";

const app = express();
const port = 4500;

app.use(cors());
app.listen(4500, () => {
    console.log(`Server is running on port 4500`);
});

app.get('/api/:date?', (req, res) => {
    const fetchedDate = req.params.date;
    let ourDate;
  
    if (!fetchedDate) { //if no date is entered by the user.
      ourDate = new Date();
    } else if (!isNaN(fetchedDate)) { //if the date is a number,  representing it as timestamp.
      ourDate = new Date(parseInt(fetchedDate));
    } else {
      ourDate = new Date(fetchedDate); //if not a number, new Date object is initialized with the date as String.
    }

    if (isNaN(ourDate.getTime())) {
      return res.json({
        error: 'Invalid Date'
      });
    }
    // Format the response
    res.json({
      unix: ourDate.getTime(),
      utc: ourDate.toUTCString()
    });
  });