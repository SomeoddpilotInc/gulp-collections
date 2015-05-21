var fs = require("fs");
var path = require("path");
var frontMatter = require("front-matter");
var through = require("through2");
var glob = require("glob");
var _ = require("lodash");

/**
 * @param {string} filepath
 * @returns {Object} file info
 */
function mapFiles(filepath) {
  var contents = fs.readFileSync(filepath, "utf-8");

  return _.extend(
    {
      slug: path.basename(filepath, path.extname(filepath))
    },
    frontMatter(contents)
  );
}

/**
 * @param {Object}   options - options
 * @param {Function} options.sortBy - fallback sorting function
 * @param {number}   options.number - number of items to include
 * @param {Object}   result - resulting object
 * @param {Object}   collection - collection options
 * @param {string}   collection.glob - glob for collection
 * @param {Function} collection.sortBy - main sorting function
 * @param {number}   collection.number - number of items to include
 * @param {string}   name - name of collection
 */
function forEachFileGlob(options, result, collection, name) {
  var files = glob.sync(collection.glob || collection);

  result[name] = files
    .map(mapFiles)
    .sort(function sortCollection(a, b) {
      var sortBy = collection.sortBy || options.sortBy || null;

      if (typeof sortBy !== 'function') {
        return -1;
      }
      return sortBy(a, b);
    })
    .slice(
      0,
      collection.count || options.count || undefined
    );
}

/**
 * @param {Object} options options set
 * @param {Object} options.globs globs to get collections from
 */
module.exports = function gulpCollections(options) {
  var fileGlobs = options.globs || {};

  function collectionsTransform(file, enc, callback) {
    file.collections = _.transform(
      fileGlobs,
      forEachFileGlob.bind(this, options || {})
    );

    this.push(file);

    callback(null, file);
  }

  return through.obj(collectionsTransform);
};
