const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const { ObjectId, Int32, Decimal128, Binary } = require('bson');
const port = process.env.PORT || 4000;
const cors = require('cors');
const methodOverride = require('method-override');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const mongodb = require('mongodb');
const binary = mongodb.Binary;
const mongoClient = mongodb.MongoClient;
const pdfParse = require("pdf-parse");

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
    os : Array,
    pl : Array,
    db : Array,
    tools : Array,
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

const skillsetSchema = {
    name : String,
    category : String,
}

const Applicant = mongoose.model("Applicant",applicantSchema);
const MajorSkills = mongoose.model("MajorSkills", majorSkillSchema);
const MinorSkills = mongoose.model("MinorSkills", minorSkillSchema);
const LanguageSkills = mongoose.model("LanguageSkills", languageSkillSchema);
const Skillsets = mongoose.model("Skillsets", skillsetSchema);


app.get("/all-cv", function(req, res) {
    Applicant.find().then((result) => {
        res.send(result);
    }).catch((err) => {
        console.log(err);
    })
})

app.get("/all-skill", function(req, res) {
    Skillsets.find().then((result) => {
        res.send(result);
    }).catch((err) => {
        console.log(err);
    })
})


app.get("/download", function(req,res) {
    getFiles(req);
})

app.post("/upload", function(req, res) {
    
    let allSkill = req.body.majorSkill.split(',');
    console.log(allSkill);
    let skillsetData = [];
    let os = allSkill;
    let pl = [];
    let db = [];
    let tools = [];
    // os,pl,db,tools = classifier(os,pl,db,tools,allSkill);
    // console.log(os);
    // console.log(pl);
    // console.log(db);
    // console.log(tools);
    let lastOS = [];
    let lastPL = [];
    let lastDB = [];
    let lastIDE = [];
    Skillsets.find().then((result) => {
        skillsetData.push(result);
        for(let i = 0; i < result.length; i++){
            pl.push(result[i]);
        }
        for(let i = 0 ; i < pl.length; i++){
            db.push(Object.values(Object.values(pl[i])[2])[1]);
        }
        for(let i = 0 ; i < allSkill.length; i++){
            for(let j = 0 ; j < pl.length; j++){
                //is this skillsets contain this skill input
                if(allSkill[i].toLowerCase() == Object.values(Object.values(pl[j])[2])[1].toLowerCase()){
                    //is skill input category is os
                    if(Object.values(Object.values(pl[j])[2])[2] == "Operating System"){
                        lastOS.push(Object.values(Object.values(pl[j])[2])[1]);
                        lastOS.push(i);
                        break;
                     //is skill input category is programming lang
                    }
                    else if(Object.values(Object.values(pl[j])[2][2] == "Database")){
                        lastDB.push(Object.values(Object.values(pl[j])[2])[1]);
                        lastDB.push(i);
                        break;
                    }else if(Object.values(Object.values(pl[j])[2][2] == "Programming Language")){
                        lastPL.push(Object.values(Object.values(pl[j])[2])[1]);
                        lastPL.push(Object.values(Object.values(pl[j])[2])[2]);
                        break;
                    }
                     //is skill input category is database
                    
                     //is skill input category is tools
                    else{
                        lastIDE.push(Object.values(Object.values(pl[j])[2])[1]);
                        lastIDE.push(i);
                        break;
                    }
                }
            }
        }
    }).catch((err) => {
        console.log(err);
    })

    // for(let i = 0; i < skillsetData.length; i++) {
    //     pl.push(skillsetData[i].skill);
    // }

    // for(let i = 0 ; i < allSkill.length ; i++ ){
    //     for(let j = 0 ; j< skillsetData.length; j++){
    //         if(allSkill[i].toLowerCase() === skillsetData[j].skill.toLowerCase()){
    //             // if(skillsetData[j].category === "Programming Language"){
    //             //     pl.push(allSkill[i]);
    //             // }
    //             pl.push(allSkill[i]);
    //         }
    //     }
    // }
    
    let file = { name: req.body.name,
        totalExp : req.body.exp,
        gpa : req.body.gpa,
        majorSkill : req.body.majorSkill,
        os : lastOS,
        pl : lastPL,
        db : lastDB,
        tools : lastIDE,
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
    res.redirect('https://lucky-druid-669a9d.netlify.app/newApp');
})

app.post("/update-skill", function(req, res) {
    let file = { skill: req.body.skill,
        category : req.body.category,}
    insertSkill(file, res)
    res.redirect('https://lucky-druid-669a9d.netlify.app/manageSkill');
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

async function insertSkill(file, res) {
    await mongoClient.connect('mongodb+srv://chnw-admin:chnw1234@cluster0.8ckv3.mongodb.net/applicantDB', { useNewUrlParser: true }, (err, client) => {
        if (err) {
            return err
        }
        else {
            let db = client.db('applicantDB')
            let collection = db.collection('skillsets')
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

async function classifier(os, pl, dbs, tools, allSkill) {
    await mongoClient.connect('mongodb+srv://chnw-admin:chnw1234@cluster0.8ckv3.mongodb.net/applicantDB', { useNewUrlParser: true }, (err, client) => {
        if (err) {
            return err
        }
        else {
            let db = client.db('applicantDB')
            let collection = db.collection('skillsets')
            let majorSkill = collection.find({});
            for(let i = 0; i < majorSkill.length ; i++){
                if(allSkill[i].toLowerCase() === majorSkill[i].skill.toLowerCase()){
                    if(majorSkill[i].category === "Operating System"){
                        os.push(allSkill[i]);
                    }else if(majorSkill[i].category === "Programming Language"){
                        pl.push(allSkill[i]);
                    }else if(majorSkill[i].category === "Database"){
                        dbs.push(allSkill[i]);
                    }else{
                        tools.push(allSkill[i]);
                    }
                }
            }
            return {os, pl, dbs, tools};
            // client.close()
        }

    })
}

async function getOS(allSkill) {
    let os = [];
    await mongoClient.connect('mongodb+srv://chnw-admin:chnw1234@cluster0.8ckv3.mongodb.net/applicantDB', { useNewUrlParser: true }, (err, client) => {
        if (err) {
            return err
        }
        else {
            let db = client.db('applicantDB')
            let collection = db.collection('skillsets')
            let majorSkill = collection.find({});
            // for(let i = 0; i < majorSkill.length ; i++){
            //     if(allSkill[i].toLowerCase() === majorSkill[i].skill.toLowerCase()){
            //         if(majorSkill[i].category === "Operating System"){
            //             os.push(allSkill[i]);
            //         }
            //     }
            // }
            return majorSkill;
            // client.close()
        }

    })
}

async function getPL(allSkill) {
    let pl = [];
    await mongoClient.connect('mongodb+srv://chnw-admin:chnw1234@cluster0.8ckv3.mongodb.net/applicantDB', { useNewUrlParser: true }, (err, client) => {
        if (err) {
            return err
        }
        else {
            let db = client.db('applicantDB')
            let collection = db.collection('skillsets')
            let majorSkill = collection.find({});
            for(let i = 0; i < majorSkill.length ; i++){
                if(allSkill[i].toLowerCase() === majorSkill[i].skill.toLowerCase()){
                    if(majorSkill[i].category === "Programming Language"){
                        pl.push(allSkill[i]);
                    }
                }
            }
            return pl;
            // client.close()
        }

    })
}

async function getDB(allSkill) {
    let dbs = [];
    await mongoClient.connect('mongodb+srv://chnw-admin:chnw1234@cluster0.8ckv3.mongodb.net/applicantDB', { useNewUrlParser: true }, (err, client) => {
        if (err) {
            return err
        }
        else {
            let db = client.db('applicantDB')
            let collection = db.collection('skillsets')
            let majorSkill = collection.find({});
            for(let i = 0; i < majorSkill.length ; i++){
                if(allSkill[i].toLowerCase() === majorSkill[i].skill.toLowerCase()){
                    if(majorSkill[i].category === "Database"){
                        dbs.push(allSkill[i]);
                    }
                }
            }
            return dbs;
            // client.close()
        }

    })
}

async function getIDE(allSkill) {
    let tools = [];
    await mongoClient.connect('mongodb+srv://chnw-admin:chnw1234@cluster0.8ckv3.mongodb.net/applicantDB', { useNewUrlParser: true }, (err, client) => {
        if (err) {
            return err
        }
        else {
            let db = client.db('applicantDB')
            let collection = db.collection('skillsets')
            let majorSkill = collection.find({});
            for(let i = 0; i < majorSkill.length ; i++){
                if(allSkill[i].toLowerCase() === majorSkill[i].skill.toLowerCase()){
                    if(majorSkill[i].category === "Tools and IDE"){
                        tools.push(allSkill[i]);
                    }
                }
            }
            return tools;
            // client.close()
        }

    })
}

app.listen(port, function() {
    console.log(`server is running on ${port}`);
})


module.exports = {app};