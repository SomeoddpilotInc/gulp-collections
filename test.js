var assert = require("assert");
var es = require("event-stream");
var File = require("vinyl");
var collections = require("./");

describe("gulp-collections", function () {
  it("should collect items", function (done) {

    var fakeFile = new File({
      contents: es.readArray(["stream", "with", "those", "contents"])
    });

    var collector = collections({
      tests: "tests/fixtures/*.md",
      options: {
        count: 1,
        sortBy: function (a, b) {
          return (a.attributes.sort > b.attributes.sort) ?
            -1 : (a.attributes.sort < b.attributes.sort) ?
            1 : 0;
        }
      }
    });

    collector.write(fakeFile);

    collector.once("data", function (file) {
      assert(file.isStream());

      var firstItem = file.collections.tests[0];

      assert.equal(firstItem.attributes.title, "Hello");
      assert.equal(firstItem.body, "Yo world. Sup.\n");
      assert.equal(firstItem.slug, "hello");
      assert.equal(Object.keys(file.collections).length, 1);

      done();
    });
  });
});
