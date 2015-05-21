var fs = require("fs");
var path = require("path");
var frontMatter = require("front-matter");
var through = require("through2");
var glob = require("glob");
var _ = require("lodash");

/**
 * @param {string} filepath
 * @returns {Promise} promise which resolves to file info
 */
function mapFiles(filepath) {
  return new Promise(function (resolve, reject) {
    fs.readFile(filepath, "utf-8", function onFile(err, contents) {
      if (err) {
        return reject(err);
      }
      resolve(_.extend(
        {
          slug: path.basename(filepath, path.extname(filepath))
        },
        frontMatter(contents)
      ));
    });
  });
}

/**
 * @param {string} fileGlob glob for files
 * @returns {Promise} promise which resolves to file paths
 */
function getFiles(fileGlob) {
  return new Promise(function (resolve, reject) {
    glob(fileGlob, function onGlob(err, globs) {
      if (err) {
        return reject(err);
      }
      resolve(globs);
    });
  });
}

function allPromisedMapFiles(files) {
  return Promise.all(files.map(mapFiles));
}

/**
 * @param {Object}   options - options
 * @param {Function} options.sortBy - fallback sorting function
 * @param {number}   options.number - number of items to include
 * @param {Object}   collection - collection options
 * @param {string}   collection.glob - glob for collection
 * @param {Function} collection.sortBy - main sorting function
 * @param {number}   collection.number - number of items to include
 * @param {string}   name - name of collection
 */
function forEachFileGlob(options, collection, name) {
  function sortCollection(a, b) {
    var sortBy = collection.sortBy || options.sortBy || null;

    if (typeof sortBy !== 'function') {
      return -1;
    }
    return sortBy(a, b);
  }

  return getFiles(collection.glob || collection)
    .then(allPromisedMapFiles)
    .then(function sortNSlice(files) {
      return files
        .sort(sortCollection)
        .slice(
          0,
          collection.count || options.count || undefined
        );
    })
    .then(function setName(files) {
      files.name = name;

      return files;
    });
}

/**
 * @param {Object} options options set
 * @param {Object} options.globs globs to get collections from
 */
module.exports = function gulpCollections(options) {
  var fileGlobs = options.globs || {};

  function collectionsTransform(file, enc, callback) {
    Promise.all(
      _.map(fileGlobs, forEachFileGlob.bind(this, options || {}))
    )
    .then(function (collections) {
      return _.transform(collections, function (result, collection) {
        result[collection.name] = collection;
      });
    })
    .then(function (collections) {
      file.collections = collections;

      this.push(file);

      callback(null, file);
    }.bind(this))
    .catch(callback);
  }

  return through.obj(collectionsTransform);
};
