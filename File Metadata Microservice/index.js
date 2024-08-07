import express from "express";
import multer from "multer";
import cors from "cors";

const app = express();
const upload = multer({ dest: "/public"}) //entering the location wherefile uploads will be stored.
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static("public")); //serving static files from the public folder.
app.use(cors());

//app.post("<route to be handled>", upload.single("<the name of the uploaded file, get it from frontend>"), (req, res)
app.post("/api/fileanalyse", upload.single("upfile"), (req, res) => {
    console.log(req.file, res.body); //req.file contains the uploaded file information
    res.json({
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size,
    });
});

//The multer.diskStorage option exists to provide more control over how and where files are stored when they 
//are uploaded. By using multer.diskStorage, you can customize the storage behavior, including setting the 
//destination directory dynamically and modifying the filename.