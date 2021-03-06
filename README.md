[![Build Status](https://travis-ci.org/SomeoddpilotInc/gulp-collections.svg?branch=master)](https://travis-ci.org/SomeoddpilotInc/gulp-collections)
[![Dependency Status](https://david-dm.org/SomeoddpilotInc/gulp-collections.svg)](https://david-dm.org/SomeoddpilotInc/gulp-collections)
[![devDependency Status](https://david-dm.org/SomeoddpilotInc/gulp-collections/dev-status.svg)](https://david-dm.org/SomeoddpilotInc/gulp-collections#info=devDependencies)

# gulp-collections
Parses collections of files, optionally parsing. Ideal for use in static site generation

collections([options])
----------

### options

Type: `Object`

Options passed to gulp-collections.

### options.count

Type: `Number`

Number of items to limit collection to

### options.sortBy

Type: `Function`

Function to sort items by. Takes two arguments, the items to compare.

e.g.
```Javascript
function simpleSort(a, b) {
  return (a.attributes.sort > b.attributes.sort) ?
    -1 : (a.attributes.sort < b.attributes.sort) ?
    1 : 0;
}
```
