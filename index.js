var fs = require("fs");
var path = require("path");
var frontMatter = require("front-matter");
var through = require("through2");
var glob = require("glob");
var _ = require("lodash");

module.exports = function (fileGlobs) {
  var options = fileGlobs.options;

  delete fileGlobs.options;

  function collectionsTransform(file, enc, callback) {
    var collections = {};

    Object.keys(fileGlobs).forEach(function (name) {
      var files = glob.sync(fileGlobs[name]);

      var collected = files.map(function (filepath) {
        var contents = fs.readFileSync(filepath, "utf-8");

        return _.extend(
          {
            slug: path.basename(filepath, path.extname(filepath))
          },
          frontMatter(contents)
        );
      });

      if (options.count) {
        collected = collected.slice(0, options.count);
      }

      collections[name] = collected;
    });

    file.collections = collections;

    this.push(file);

    callback();
  }

  return through.obj(collectionsTransform);
};
