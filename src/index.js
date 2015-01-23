var fs = require("fs");
var path = require("path");
var frontMatter = require("front-matter");
var through = require("through2");
var glob = require("glob");
var _ = require("lodash");

module.exports = function (fileGlobs) {
  fileGlobs = fileGlobs || {};

  var options = (fileGlobs.options) ? fileGlobs.options : {};

  delete fileGlobs.options;

  function collectionsTransform(file, enc, callback) {
    var collections = {};

    Object.keys(fileGlobs).forEach(function (name) {
      var collection = fileGlobs[name];

      var fileGlob = (collection.glob) ? collection.glob : collection;

      var files = glob.sync(fileGlob);

      var collected = files.map(function (filepath) {
        var contents = fs.readFileSync(filepath, "utf-8");

        return _.extend(
          {
            group: path.dirname(filepath).split("/").pop(),
            slug: path.basename(filepath, path.extname(filepath))
          },
          frontMatter(contents)
        );
      });

      var sortBy = collection.sortBy || options.sortBy || null;

      if (sortBy) {
        collected = collected.sort(sortBy);
      }

      var count = collection.count || options.count || null;

      if (count) {
        collected = collected.slice(0, count);
      }

      var group = collection.group || options.group || false;

      if (group) {
        collected = _.groupBy(collected, function (item) {
          return item.group;
        });
      }

      collections[name] = collected;
    });

    file.collections = collections;

    this.push(file);

    callback();
  }

  return through.obj(collectionsTransform);
};
