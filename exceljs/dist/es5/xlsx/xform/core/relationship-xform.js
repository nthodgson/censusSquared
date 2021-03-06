'use strict';

var utils = require('../../../utils/utils');

var BaseXform = require('../base-xform');

var RelationshipXform = module.exports = function () {};

utils.inherits(RelationshipXform, BaseXform, {
  render: function render(xmlStream, model) {
    xmlStream.leafNode('Relationship', model);
  },
  parseOpen: function parseOpen(node) {
    switch (node.name) {
      case 'Relationship':
        this.model = node.attributes;
        return true;

      default:
        return false;
    }
  },
  parseText: function parseText() {},
  parseClose: function parseClose() {
    return false;
  }
});
//# sourceMappingURL=relationship-xform.js.map
