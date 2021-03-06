'use strict';

var utils = require('../../../utils/utils');

var BaseXform = require('../base-xform');

var StringXform = module.exports = function (options) {
  this.tag = options.tag;
  this.attr = options.attr;
  this.attrs = options.attrs;
};

utils.inherits(StringXform, BaseXform, {
  render: function render(xmlStream, model) {
    if (model !== undefined) {
      xmlStream.openNode(this.tag);

      if (this.attrs) {
        xmlStream.addAttributes(this.attrs);
      }

      if (this.attr) {
        xmlStream.addAttribute(this.attr, model);
      } else {
        xmlStream.writeText(model);
      }

      xmlStream.closeNode();
    }
  },
  parseOpen: function parseOpen(node) {
    if (node.name === this.tag) {
      if (this.attr) {
        this.model = node.attributes[this.attr];
      } else {
        this.text = [];
      }
    }
  },
  parseText: function parseText(text) {
    if (!this.attr) {
      this.text.push(text);
    }
  },
  parseClose: function parseClose() {
    if (!this.attr) {
      this.model = this.text.join('');
    }

    return false;
  }
});
//# sourceMappingURL=string-xform.js.map
