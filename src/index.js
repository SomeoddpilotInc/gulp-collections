var fs = require("fs");
var path = require("path");
var frontMatter = require("front-matter");
var through = require("through2");
var glob = require("glob");
var _ = require("lodash");

function mapFiles(filepath) {
  var contents = fs.readFileSync(filepath, "utf-8");

  return _.extend(
    {
      slug: path.basename(filepath, path.extname(filepath))
    },
    frontMatter(contents)
  );
}

function forEachFileGlob(collections, fileGlobs, options, name) {
  var collection = fileGlobs[name];

  var files = glob.sync(collection.glob || collection);

  collections[name] = files
    .map(mapFiles)
    .sort(function (a, b) {
      var sortBy = collection.sortBy || options.sortBy || null;

      if (typeof sortBy !== 'function') {
        return -1;
      }
      return sortBy(a, b);
    })
    .slice(
      0,
      collection.count || options.count || files.length
    );
}

module.exports = function (options) {
  var fileGlobs = options.globs || {};

  function collectionsTransform(file, enc, callback) {
    var collections = {};

    Object.keys(fileGlobs)
      .forEach(forEachFileGlob.bind(this, collections, fileGlobs, options || {}));

    file.collections = collections;

    this.push(file);

    callback(null, file);
  }

  return through.obj(collectionsTransform);
};
