var fs = require("fs");
var path = require("path");
var frontMatter = require("front-matter");
var through = require("through2");
var glob = require("glob");
var _ = require("lodash");

module.exports = function (fileGlobs) {
  function collectionsTransform(file, enc, callback) {
    var collections = {};

    Object.keys(fileGlobs).forEach(function (name) {
      var files = glob.sync(fileGlobs[name]);
      collections[name] = files.map(function (filepath) {
        var contents = fs.readFileSync(filepath, "utf-8");

        return _.extend(
          {
            slug: path.basename(filepath, path.extname(filepath))
          },
          frontMatter(contents)
        );
      });
    });

    file.collections = collections;

    this.push(file);

    callback();
  }

  return through.obj(collectionsTransform);
};
