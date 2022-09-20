import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import multer from "multer";
import PDFDocument from 'pdfkit';
import fs from 'fs';

const testFolder = './images/';
var allUploadedFiles = [];

const app = express();

app.use('/images',express.static('images'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());


const storage = multer.diskStorage({
    destination: function(req, file, callback){
            callback(null, './images/');
    },
    filename: function(req, file, callback){
            callback(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
});

const fileFilter = (req, file, callback)=>{
    if(file.mimetype === 'image/jpeg' || file.mimetype == 'image/png'){
           callback(null, true); 
    }else{
            callback(null, false);
    }
};

const upload = multer({storage: storage, limits: {
    fileSize: 1024 * 1024 * 20
},
fileFilter: fileFilter
}); 



app.get("/combine", (req, res)=>{

    console.log("clicked!");

   const doc = new PDFDocument({autoFirstPage:false});

    //Pipe its output somewhere, like to a file or HTTP response 
    //See below for browser usage 
    doc.pipe(fs.createWriteStream('output.pdf'))
    
    
    //Add an image, constrain it to a given size, and center it vertically and horizontally 
    var i=0;

    for(i; i<allUploadedFiles.length; i++){

        var img = doc.openImage('./images/'+allUploadedFiles[i].file);
        
        doc.addPage({size: [img.width, img.height]})
        .image(img,0,0);
        
    }


    doc.end()

    res.json({
        msg: "PDF Created!"
    })
    
})


app.post("/upload",upload.array("image"), function(req, res){
    console.log("Clicked!");
    var allfilepaths = [];

    req.files.map((val, key)=>{
            allfilepaths[key] = val.path;
    });

    console.log(allfilepaths);

    var i = 0;
    fs.readdirSync(testFolder).forEach(file => {
        i++;
        allUploadedFiles.push({id: i.toString(), file: file});
      });


    res.send(allUploadedFiles);

    console.log(allUploadedFiles);
});


app.get("/api", (req, res)=>{
    res.send("I Love You");
})

app.listen(3001, ()=>{
    console.log("Server Started Successfully on port 3001!");
});