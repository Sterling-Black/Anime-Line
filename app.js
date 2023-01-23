
require("dotenv").config();
const express = require("express");
const request = require("request");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const { response } = require("express");


function apiCall (reqOps) {
    return new Promise ( (resolve, reject) => {

        request(reqOps, (err, response, body) => {

            if(!err && response.statusCode == 200){
                resolve( JSON.parse(body) );                
            }

            reject(err);
        });

    });
}

function day(){
    const day = new Date();
    return day.getFullYear();
}


const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

app.use(express.static("public"));

const url = "https://api.jikan.moe/v4";

// https://api.jikan.moe/v4/anime?q=naruto&type=tv

app.get("/", (req,res)=>{
    const year = day();

    let data1, data2, data3;

    apiCall(url+"/top/anime?type=tv&filter=bypopularity")
    .then( result => {    // Result of first call
        data1 = result.data;

        return apiCall(url + "/top/anime?type=movie&filter=bypopularity");
    }) 
    .then( result => {     // Result of second call
        data2 = result.data;
        
        return apiCall(url+"/top/manga?type=manga&filter=bypopularity");
    }).then(result=>{
        data3 = result.data;

        res.render("home",{
            Animes: [data1, data2, data3],
            year: year,
            route: "",
            search: ""
        });
    })
    .catch( err => {
        console.log("Error occured in one of the API call: ", err);
    });
    
});

app.post("/:categ", (req, res)=>{
    const year = day();
    const categ = req.params.categ;
    const search = req.body.search;

    let data1, data2, data3;

    apiCall(url+"/anime?q="+search+"&type=tv")
    .then(result=>{
        data1 = result.data;

        return apiCall(url+"/anime?q="+search+"&type=movie");
    })
    .then(result=>{
        data2 = result.data;

        return apiCall(url+"/manga?q="+search+"&type=manga");
    })
    .then(result =>{
        data3 = result.data;
        let storeData = [];
    
        if(data1 != undefined){
            storeData.push(data1);
        }
        if(data2 != undefined){
            storeData.push(data2);
        }
        if(data3 != undefined){
            storeData.push(data3);
        }
        res.render("home",{
            Animes: [...storeData],
            year: year,
            route: categ,
            search: search
        });

    })
    .catch( err => {
        console.log("Error occured in one of the API call: ", err);
    });
});

app.get("/anime", (req,res)=>{
    const year = day();

    apiCall(url + "/anime?type=tv&filter=bypopularity")
    .then(result=>{
        data1 = result.data;

        return apiCall(url+"/anime?type=movie&filter=bypopularity");
    })
    .then(result=>{
        data2 = result.data;

        res.render("home",{
            Animes: [data1, data2],
            year: year,
            route: "anime",
            search: ""
        });
    })
    .catch( err => {
        console.log("Error occured in one of the API call: ", err);
    });
});

app.get("/about", (req,res)=>{
    const year = day();
    res.render("about",{year: year, route: "about"});

});

app.get("/:categ", (req, res)=>{
    const categ = req.params.categ;
    let viewing, url1;
    const year = day();
    const query = req.query.q;

    if(categ.toLowerCase() === "manga"){
        viewing = "manga";
    }else{
        viewing = "anime"
    }
    if(query === undefined){
        url1 = url+"/"+viewing+"?type="+categ+"&filter=bypopularity";
    }else{
        url1 = url+"/"+viewing+"?q="+query+"&type="+categ;
    }

    apiCall(url1)
    .then(result=>{
        data1 = result.data;

        res.render("single",{
            Anime: data1,
            year: year,
            route: categ,
            search: ""
        });
    })
    .catch( err => {
        console.log("Error occured in one of the API call: ", err);
    });

});

app.listen(process.env.PORT || 3000,()=>{
    console.log("Succesfully Runing on port 3000");
});