// "use strict";

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
var db = require("mongodb").MongoClient;
console.log(db);

app.get("/getThumbnails",function (req,res){
  db.connect("mongodb://localhost:27017/workflows", function(err, db) {
    if(!err) {
      db.createCollection('bpmn', function(err, bpmn) {
        if (!err){
          bpmn.find({}).project({flowName:1,svg:1}).toArray(function (err,bpmns){
            res.json(bpmns);
          })
        }
      });
    }
  });
})

app.post("/flow",function (req,res){
  var name = req.body.flowName;
  var xml = req.body.xml;
  var svg = req.body.svg;
  db.connect("mongodb://localhost:27017/workflows", function(err, db) {
    if(!err) {
      db.createCollection('bpmn', function(err, bpmn) {
         bpmn.ensureIndex({flowName:1}, {unique:true}, function(err, indexName) {
        if (!err){
          bpmn.insertOne({flowName:name,xml:xml,svg:svg,createdTime:new Date()},{w:1, keepGoing:true},function (bpms){
            bpmn.count(function (err,count){
              res.send("success");
            })
          })
        }else{
          console.log(err)
        }
      });
    });
    }
  });
})

app.put("/flow",function (req,res){
  var name = req.body.flowName;
  var xml = req.body.xml;
  var svg = req.body.svg;
  db.connect("mongodb://localhost:27017/workflows", function(err, db) {
    if(!err) {
      db.createCollection('bpmn', function(err, bpmn) {
        if (!err){
          bpmn.updateOne({flowName:name},  {flowName:name,xml:xml, svg:svg},{upsert:true, w: 1});
          res.send("success");
          console.log("SAVED:  "+name);

        }else{
          console.log(err)
        }
      });
    }
  });
})

app.get("/flow", function (req,res){
  var name = req.query.flowName;
  console.log("Requested:  " + name);
  db.connect("mongodb://localhost:27017/workflows", function(err, db) {
    if(!err) {
      db.collection('bpmn', function(err, bpmn) {
        if (!err){
            bpmn.find({flowName:name}).project({xml:1}).toArray(function (err, result){
              res.send(result);
            })
        }else{
          console.log(err)
        }
      });
    }
})
});

app.delete('/flow', function (req, res) {
  var name = req.body.flowName;
  console.log(name);
  db.connect("mongodb://localhost:27017/workflows", function(err, db) {
    if(!err) {
      db.collection('bpmn', function(err, bpmn) {
        if (!err){
            bpmn.deleteOne({flowName:name},function (err, result){
              res.send(result);
              console.log(name);
            })
        }else{
          console.log(err)
        }
      });
    }
})
});


app.get('/save', function(req, res){
  res.send('hello world');
});

app.use("/static",express.static(__dirname +"/public"))

app.listen(3000);
