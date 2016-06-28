'use strict'

var db = require("mongodb").MongoClient,
    MongoClient = require("mongodb").MongoClient,
    co = require('co'),
    assert = require('assert');

module.exports.create = function create(item, collection, done) {
    co(function*() {
        var db = yield MongoClient.connect("mongodb://localhost:27017/workflows");
        console.log("Connected correctly to server");
        var col = db.collection(collection)
        var item = yield col.insertOne(item, {
            w: 1
        })
        done.call(item)

    })
}

module.exports.read = function read(collection, filter, projection, done){
db.connect("mongodb://localhost:27017/workflows", function(err, db) {
  			var col = db.collection(collection)
        col.find(filter).project(projection).toArray(function (err,items){
          done.json(items)
        })
    })



}

module.exports.update = function update(collection, filter, item,done){
	co(function*() {
			var db = yield MongoClient.connect("mongodb://localhost:27017/workflows");
			var col = db.collection(collection)
			var items = yield col.updateOne(filter,item)
			done.call(items)

	})
}

module.exports.delete = function deleteOne(collection, filter ,done){
	co(function*() {
			var db = yield MongoClient.connect("mongodb://localhost:27017/workflows");
			var col = db.collection(collection)
			var items = yield col.deleteOne(filter,item)
			done.call(items)

	})
}
