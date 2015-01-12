var assert = require("assert");
var es = require("event-stream");
var File = require("vinyl");
var collections = require("./");

describe("gulp-collections", function () {
  it("should assert", function (done) {

    var fakeFile = new File({
      contents: es.readArray(["stream", "with", "those", "contents"])
    });

    var collector = collections({
      tests: "tests/fixtures/*.md"
    });

    collector.write(fakeFile);

    collector.once("data", function (file) {
      assert(file.isStream());

      var firstItem = file.collections.tests[0];

      assert.equal(firstItem.attributes.title, "Hello");
      assert.equal(firstItem.body, "Yo world. Sup.\n");
      assert.equal(firstItem.slug, "hello");

      done();
    });
  });
});
