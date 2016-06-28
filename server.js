'use strict'
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
    extended: true
})); // for parsing application/x-www-form-urlencoded
var db = require("mongodb").MongoClient,
MongoClient = require("mongodb").MongoClient,
    co = require('co'),
    assert = require('assert');

var dbUtil = require("./database");
console.log(dbUtil)


app.get("/getThumbnails", function(req, res) {
  dbUtil.read("bpmn",{},{
      flowName: 1,
      svg: 1,
      xml: 1,
      version: 1,
      changes: 1,
      updatedTime: 1
  },res)
})

app.get("/getBranches", function(req, res) {
  var user = req.query.user;
  dbUtil.read("branches",{user:user,active:1},{
      flowName: 1,
      svg: 1,
      xml: 1,
      version: 1,
      changes: 1,
      updatedTime: 1
  },res)
})

app.post("/branch", function(req, res) {
    var name = req.body.flowName;
    var user = req.body.user;
    if (name == "") {
        res.send("Empty Name not allowed")
        return
    }

    db.connect("mongodb://localhost:27017/workflows", function(err, db) {
        if (!err) {
            if (!err) {
                db.collection('bpmn', function(err, bpmn) {
                    if (!err) {
                        bpmn.find({
                            flowName: name
                        }).project({
                            flowName: 1,
                            xml: 1,
                            svg: 1
                        }).toArray(function(err, result) {
                            db.createCollection('branches', function(err, branches) {
                              branches.insertOne({
                                  flowName: name,
                                  xml: result[0].xml,
                                  svg: result[0].svg,
                                  createdTime: new Date(),
                                  user: user,
                                  active: 1
                              }, {
                                  w: 1,
                                  keepGoing: true
                              }, function(err, bpms) {
                                  if (err) {
                                      res.send(err)
                                  } else {
                                      branches.count(function(err, count) {
                                          res.json(result);
                                      })
                                  }

                              })
                                if (!err) {

                                } else {
                                    console.log(err)
                                }
                            })
                        })
                    } else {
                        console.log(err)
                    }
                });
            }

        }
    })
});


app.post("/flow", function(req, res) {
    var name = req.body.flowName;
    var xml = req.body.xml;
    var svg = req.body.svg;
    db.connect("mongodb://localhost:27017/workflows", function(err, db) {
        if (!err) {
            db.createCollection('bpmn', function(err, bpmn) {
                bpmn.ensureIndex({
                    flowName: 1
                }, {
                    unique: true
                }, function(err, indexName) {
                    if (!err) {
                        bpmn.insertOne({
                            flowName: name,
                            xml: xml,
                            svg: svg,
                            createdTime: new Date(),
                            updatedTime: new Date(),
                            version: 1,
                            changeLog: {}
                        }, {
                            w: 1,
                            keepGoing: true
                        }, function(bpms) {
                            bpmn.count(function(err, count) {
                                res.send("success");
                            })
                        })
                    } else {
                        console.log(err)
                    }
                });
            });
        }
    });
})

app.post("/flow/update", function(req, res) {
    var name = req.body.flowName;
    var xml = req.body.xml;
    var svg = req.body.svg;
    db.connect("mongodb://localhost:27017/workflows", function(err, db) {
        if (!err) {
            db.createCollection('bpmn', function(err, bpmn) {
                if (!err) {
                    bpmn.updateOne({
                        flowName: name
                    }, {
                        $set: {
                            flowName: name,
                            xml: xml,
                            svg: svg,
                            updatedTime: new Date(),
                        },


                    }, {
                        upsert: true,
                        w: 1
                    });
                    res.send("success");
                    console.log("SAVED:  " + name);

                } else {
                    console.log(`Error:${err}`)
                }
            });
        }
    });
})


app.post("/merge", function(req, res) {
    var name = req.body.flowName;
    var xml = req.body.xml;
    var user = req.body.user;
    var svg = req.body.svg;
    var changes = req.body.changes;
    console.log(name);
    co(function*() {
                // Connection URL
                var db = yield MongoClient.connect("mongodb://localhost:27017/workflows");
                console.log("Connected correctly to server");

                // Get the findAndModify collection
                var col = db.collection("bpmn")
                    // Insert a single document

                // Remove a document from MongoDB and return it
                var item = yield col.findOneAndUpdate({
                    flowName: name
                }, {
                    $inc: {
                        version: 1
                    },
                    $set: {
                        flowName: name,
                        xml: xml,
                        svg: svg,
                        updatedTime: new Date(),
                    }
                }, {
                    projection: {
                        version: 1,
                        flowName: 1
                    }
                })
                var branches = db.collection("branches")
                yield branches.updateOne({
                    flowName: name,
                    user: user,
                    active: 1
                }, {
                    $set: {
                        active: 0,
                        changes: changes,
                        version: item.value.version
                    }
                })
                db.close();
                res.send("success")
            }).catch(function(err) {
            console.log(err.stack);
            res.send(err)
        });
    });


app.get("/flow", function(req, res) {
    var name = req.query.flowName;
    console.log("Requested:  " + name);
    db.connect("mongodb://localhost:27017/workflows", function(err, db) {
        if (!err) {
            db.collection('bpmn', function(err, bpmn) {
                if (!err) {
                    bpmn.find({
                        flowName: name
                    }).project({
                        flowName: 1,
                        xml: 1,
                        svg: 1
                    }).toArray(function(err, result) {
                        res.send(result);
                        db.close();
                    })
                } else {
                    console.log(err)
                }
            });
        }

    })
});

app.get("/branch", function(req, res) {
    var name = req.query.flowName;
    var user = req.query.user;
    console.log("Requested Branch:  " + name);
    db.connect("mongodb://localhost:27017/workflows", function(err, db) {
        if (!err) {
            db.collection('branches', function(err, bpmn) {
                if (!err) {
                    bpmn.find({
                        flowName: name,
                        user: user,
                        active: 1
                    }).project({
                        flowName: 1,
                        xml: 1,
                        svg: 1
                    }).toArray(function(err, result) {
                        res.send(result);
                        db.close();
                    })
                } else {
                    console.log(err)
                }
            });
        }else {
          console.log(err);
        }

    })
});
app.post("/branch/update", function(req, res) {
    var name = req.body.flowName;
    var user = req.body.user;
    var xml = req.body.xml;
    var svg = req.body.svg;
    if (name == "") {
        res.send("empty name")
        return
    }
    db.connect("mongodb://localhost:27017/workflows", function(err, db) {
        if (!err) {
            db.collection('branches', function(err, bpmn) {
                if (!err) {

                    bpmn.updateOne({
                        flowName: name,
                        user: user,
                        active: 1
                    }, {
                        $set: {
                            flowName: name,
                            user: user,
                            xml: xml,
                            svg: svg,
                            lastUpdated: new Date()
                        }

                    }, {
                        upsert: true,
                        w: 1
                    }, function(err) {
                        res.send("success");
                        db.close();
                    });
                } else {
                    console.log(err)
                }
            });
        }
    })
});

app.delete('/flow', function(req, res) {
    var name = req.body.flowName;
    db.connect("mongodb://localhost:27017/workflows", function(err, db) {
        if (!err) {
            db.collection('bpmn', function(err, bpmn) {
                if (!err) {
                    bpmn.deleteOne({
                        flowName: name
                    }, function(err, result) {
                        res.send(result);
                        db.close();
                    })
                } else {
                    console.log(err)
                }
            });
        }
    })
});

app.delete('/branch', function(req, res) {
    var name = req.body.flowName;
    var user = req.body.user;
    db.connect("mongodb://localhost:27017/workflows", function(err, db) {
        if (!err) {
            db.collection('branches', function(err, bpmn) {
                if (!err) {
                    bpmn.deleteOne({
                        flowName: name,
                        user: user
                    }, function(err, result) {
                        res.send(result);
                        db.close();
                    })
                } else {
                    console.log(err)
                }
            });
        }
    })
});


app.get('/save', function(req, res) {
    res.send('hello world');
});

app.use("/static", express.static(__dirname + "/public"))

app.listen(3000);
console.log('Express server listening on port 3000');
