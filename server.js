const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const { ObjectId, Int32, Decimal128, Binary } = require('bson');
const { stringify } = require('querystring');
const port = process.env.PORT || 4000;
const cors = require('cors');
const multer = require('multer');

//define storage for pdf files

// const storage = multer.diskStorage({
//     destination: function (request, file, callback) {
//         callback(nill, '')
//     }
// })

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
// app.use(multer);
app.set('view engine', 'ejs');

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
    prescreenDate : Date,
    interviewDate : Date,
    startDate : Date,
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

app.post("/post-data", function(req, res) {
    let newApplicant = new Applicant({
        name: req.body.name,
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
        CV : req.file.CV,
    });

    let newMajorSkills = new MajorSkills({
        name : req.body.majorSkill,
        totalExp : req.body.majorExp,
        applicantName : req.body.name,
    })

    let newMinorSkills = new MinorSkills({
        name : req.body.minorSkill,
        totalExp : req.body.minorExp,
        applicantName : req.body.name,
    })

    let newLanguageSkills = new LanguageSkills({
        name : req.body.langSkill,
        proficiency : req.body.proficiency,
        applicantName : req.body.name,
    })
    newApplicant.save();
    newMajorSkills.save();
    newMinorSkills.save();
    newLanguageSkills.save();
    res.redirect('/');
})

app.listen(port, function() {
    console.log(`server is running on ${port}`);
})

module.exports = {app};