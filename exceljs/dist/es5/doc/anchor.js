'use strict';

var colCache = require('../utils/col-cache');

var Anchor = function Anchor(worksheet, address) {
  var offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  if (!address) {
    this.nativeCol = 0;
    this.nativeColOff = 0;
    this.nativeRow = 0;
    this.nativeRowOff = 0;
  } else if (typeof address === 'string') {
    var decoded = colCache.decodeAddress(address);
    this.nativeCol = decoded.col + offset;
    this.nativeColOff = 0;
    this.nativeRow = decoded.row + offset;
    this.nativeRowOff = 0;
  } else if (address.nativeCol) {
    this.nativeCol = address.nativeCol || 0;
    this.nativeColOff = address.nativeColOff || 0;
    this.nativeRow = address.nativeRow || 0;
    this.nativeRowOff = address.nativeRowOff || 0;
  } else if (address.col) {
    this.col = address.col + offset;
    this.row = address.row + offset;
  } else {
    this.nativeCol = 0;
    this.nativeColOff = 0;
    this.nativeRow = 0;
    this.nativeRowOff = 0;
  }

  this.worksheet = worksheet;
};

Anchor.asInstance = function (model) {
  return model instanceof Anchor || model == null ? model : new Anchor(model);
};

Anchor.prototype = {
  get col() {
    return this.nativeCol + Math.min(this.colWidth - 1, this.nativeColOff) / this.colWidth;
  },

  set col(v) {
    this.nativeCol = Math.floor(v);
    this.nativeColOff = Math.floor((v - this.nativeCol) * this.colWidth);
  },

  get row() {
    return this.nativeRow + Math.min(this.rowHeight - 1, this.nativeRowOff) / this.rowHeight;
  },

  set row(v) {
    this.nativeRow = Math.floor(v);
    this.nativeRowOff = Math.floor((v - this.nativeRow) * this.rowHeight);
  },

  get colWidth() {
    return this.worksheet && this.worksheet.getColumn(this.nativeCol + 1) && this.worksheet.getColumn(this.nativeCol + 1).isCustomWidth ? Math.floor(this.worksheet.getColumn(this.nativeCol + 1).width * 10000) : 640000;
  },

  get rowHeight() {
    return this.worksheet && this.worksheet.getRow(this.nativeRow + 1) && this.worksheet.getRow(this.nativeRow + 1).height ? Math.floor(this.worksheet.getRow(this.nativeRow + 1).height * 10000) : 180000;
  },

  get model() {
    return {
      nativeCol: this.nativeCol,
      nativeColOff: this.nativeColOff,
      nativeRow: this.nativeRow,
      nativeRowOff: this.nativeRowOff
    };
  },

  set model(value) {
    this.nativeCol = value.nativeCol;
    this.nativeColOff = value.nativeColOff;
    this.nativeRow = value.nativeRow;
    this.nativeRowOff = value.nativeRowOff;
  }

};
module.exports = Anchor;
//# sourceMappingURL=anchor.js.map