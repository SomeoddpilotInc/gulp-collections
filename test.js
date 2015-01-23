var assert = require("assert");
var es = require("event-stream");
var File = require("vinyl");
var collections = require("./");

function getFakeFile() {
  return new File({
    contents: es.readArray(["stream", "with", "those", "contents"])
  });
}

function test(options, assertions) {
  var collector = collections(options);

  collector.write(getFakeFile());

  collector.once("data", assertions);
}

describe("gulp-collections", function () {
  it("should collect items", function (done) {
    function testAssertions(file) {
      assert(file.isStream());

      var firstItem = file.collections.tests[0];

      assert.equal(firstItem.attributes.title, "Hello");
      assert.equal(firstItem.body, "Yo world. Sup.\n");
      assert.equal(firstItem.slug, "hello");
      assert.equal(Object.keys(file.collections).length, 1);

      done();
    }

    test({
      tests: "tests/fixtures/*.md",
      options: {
        count: 1,
        sortBy: function (a, b) {
          return (a.attributes.sort > b.attributes.sort) ?
            -1 : (a.attributes.sort < b.attributes.sort) ?
            1 : 0;
        }
      }
    }, testAssertions);
  });
});
