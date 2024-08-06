import express from "express";
import cors from "cors";

const app = express();
const port = 4500;

app.use(cors());
app.listen(4500, () => {
    console.log(`Server is running on port 4500`);
});

//headers contain metadata about the request.
app.get("/api/whoami", (req, res) => {
    const ipAddress = req.headers["x-forwarded-for"];
    const language = req.headers["accept-language"];
    const userOs = req.headers["user-agent"];
  
    res.json({
      ipaddress : ipAddress,
      language,
      software : userOs,
    });
  });