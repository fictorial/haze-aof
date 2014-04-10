var fs = require('fs')

var lineReader = require('line-reader')
var _ = require('underscore')
var haze = require('haze')

var path
var writeStream
var separator = '\r\n'
var lineNo
var errorsDuringLoad

function load(aofPath, callback) {
  lineNo = 0
  errorsDuringLoad = []
  path = aofPath
  lineReader.eachLine(aofPath, processRecord, separator, 'utf8', 64 * 1024)
  openWriteStream()
  callback(errorsDuringLoad)
}

function processRecord(recordJSON) {
  ++lineNo

  try {
    var record = JSON.parse(recordJSON)
    if (record.type.match(/CUI/)) {   // Created, Updated, Incremented
      var collection = haze.ensureCollection(record.collection)
      collection[record.doc.id] = record.doc
    } else if (record.type === 'D') {  // Destroyed
      var collection = haze.collections[record.collection]
      if (collection !== undefined) {
        delete collection[record.doc.id]
      }
    }
  } catch (error) {
    errorsDuringLoad.push({
      line: lineNo,
      error: error.message
    })
  }
}

function openWriteStream() {
  writeStream = fs.createWriteStream(path, {
    encoding: 'utf8',
    flags: 'a'
  })
}

function writeRecord(type, collectionName, doc) {
  var record = {
    type: type
    collection: collectionName,
    doc: doc
  }

  writeStream.write(JSON.stringify(record) + separator, 'utf8')
}

haze.eventEmitter.on('documentCreated',   _.partial(writeRecord, 'C'))
haze.eventEmitter.on('documentUpdated',   _.partial(writeRecord, 'U'))
haze.eventEmitter.on('documentDestroyed', _.partial(writeRecord, 'D'))

exports.load = load
