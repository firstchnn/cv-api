const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const { ObjectId, Int32, Decimal128, Binary } = require('bson');
const { stringify } = require('querystring');
const port = process.env.PORT || 4000;
const cors = require('cors');
const path = require('path');
const multer = require('multer')
const crypto = require('crypto');
const GridFsStorage = require('multer-gridfs-storage').GridFsStorage;
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const mongodb = require('mongodb');
const binary = mongodb.Binary;
const mongoClient = mongodb.MongoClient

app.use(cors());
app.use(fileUpload());
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

const mongoURI = "mongodb+srv://chnw-admin:chnw1234@cluster0.8ckv3.mongodb.net/applicantDB";

mongoose.connect("mongodb+srv://chnw-admin:chnw1234@cluster0.8ckv3.mongodb.net/applicantDB", {useNewUrlParser: true},{useUnifiedTopology: true})


//create data schema
const applicantSchema = {
    name: String,
    totalExp : Number,
    gpa : Decimal128,
    majorSkill : String,
    majorExp : Number,
    minorSkill : String,
    minorExp : Number,
    langSkill : String,
    proficient : String,
    prescreenDate : String,
    interviewDate : String,
    startDate : String,
    currentSalary : Number,
    expectedSalary : Number,
    status : String,
    CV : Buffer,
}

const majorSkillSchema = {
    name : String,
    totalExp : Number,
    applicantName : String,
}

const minorSkillSchema = {
    name : String,
    totalExp : Number,
    applicantName : String,
}

const languageSkillSchema = {
    name : String,
    proficiency : String,
    applicantName : String,
}

const Applicant = mongoose.model("Applicant",applicantSchema);
const MajorSkills = mongoose.model("MajorSkills", majorSkillSchema);
const MinorSkills = mongoose.model("MinorSkills", minorSkillSchema);
const LanguageSkills = mongoose.model("LanguageSkills", languageSkillSchema);


app.get("/all-cv", function(req, res) {
    Applicant.find().then((result) => {
        res.send(result);
    }).catch((err) => {
        console.log(err);
    })
})


app.get("/download", function(req,res) {
    getFiles(req);
})

app.post("/upload", function(req, res) {
    let file = { name: req.body.name,
        totalExp : req.body.exp,
        gpa : req.body.gpa,
        majorSkill : req.body.majorSkill,
        majorExp : req.body.majorExp,
        minorSkill : req.body.minorSkill,
        minorExp : req.body.minorExp,
        langSkill : req.body.langSkill,
        proficiency : req.body.proficiency,
        prescreenDate : req.body.prescreenDate,
        interviewDate : req.body.interviewDate,
        startDate : req.body.startDate,
        status : req.body.status,
        file : binary(req.files.uploadedFile.data), }
    insertFile(file, res)
    res.redirect('https://cv-frontend-bb249.web.app/');
})
app.post("/extract-text", (req, res) => {
    if(!req.files && !req.files.pdfFile){
        res.status(400);
        res.end();
    }

    pdfParse(req.files.pdfFile).then(result => {
        res.send(result.text);
    })
})
async function insertFile(file, res) {
    await mongoClient.connect('mongodb+srv://chnw-admin:chnw1234@cluster0.8ckv3.mongodb.net/applicantDB', { useNewUrlParser: true }, (err, client) => {
        if (err) {
            return err
        }
        else {
            let db = client.db('applicantDB')
            let collection = db.collection('applicants')
            try {
                collection.insertOne(file)
                console.log('File Inserted')
            }
            catch (err) {
                console.log('Error while inserting:', err)
            }
            // client.close()
            // res.redirect('/')
        }

    })
}

async function getFiles(name) {
    await mongoClient.connect('mongodb+srv://chnw-admin:chnw1234@cluster0.8ckv3.mongodb.net/applicantDB', { useNewUrlParser: true }, (err, client) => {
        if (err) {
            return err
        }
        else {
            let db = client.db('applicantDB')
            let collection = db.collection('applicants')
            collection.find({name: name}).toArray((err, doc) => {
                if (err) {
                    console.log('err in finding doc:', err)
                }
                else {
                    let buffer = doc[0].file.buffer
                    console.log('found buffer:', buffer)
                    fs.writeFileSync('file.pdf', buffer)
                }
            })
            // client.close()
        }

    })
}

app.listen(port, function() {
    console.log(`server is running on ${port}`);
})


module.exports = {app};