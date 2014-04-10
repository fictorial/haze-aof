# haze-aof

A persistence layer for Haze, an otherwise in-memory document/object cache.

AOF stands for "append-only file".  A record is appended to the AOF when a
document is created, updated, or destroyed.  Append-only files are cheaper
to write data to than writing to random seek-points in a file.

The AOF can be loaded and processed to recreate the on-disk collection in main
memory.  This would be done at app startup for instance.

Your first thought might be that if the same document is updated many times,
the AOF file will grow proportionally larger and will maintain older versions of
documents. However, disk space is plentiful and inexpensive.  Also, having older
versions maintains an audit trail of sorts.  We might add a rewriter at some point.

## Installation

    npm install haze-aof

## Usage

    var haze = require('haze')
    var hazeAOF = require('haze-aof')

    hazeAOF.load('data.aof', function (errors) {
      if (errors) {
        console.error(errors)
      } else {
        startApp()
      }
    })

    function startApp() {
      haze.createDocument('Things', {
        meatball: true
      })
    }

## Author

Brian Hammond <brian@fictorial.com>

## License

MIT
