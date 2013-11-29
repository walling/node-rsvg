/*jshint node:true*/

'use strict';

var binding = require('./build/Release/rsvg');
var Writable = require('stream').Writable;
var util = require('util');

function Rsvg(buffer) {
	var self = this;

	var options;
	if (Buffer.isBuffer(buffer)) {
		options = {};
	} else if (typeof(buffer) === 'string') {
		buffer = new Buffer(buffer);
		options = {};
	} else if (buffer === undefined || buffer === null) {
		options = {};
	} else {
		throw new TypeError('Invalid argument: buffer');
	}

	Writable.call(self, options);

	self.handle = new binding.Rsvg(buffer);

	self.on('finish', function() {
		try {
			self.handle.close();
		} catch (error) {
			self.trigger('error', error);
		}
	});

	Object.defineProperty(self, 'baseURI', {
		configurable: true,
		enumerable: true,
		get: function() {
			return self.handle.getBaseURI();
		},
		set: function(uri) {
			self.handle.setBaseURI(uri);
		}
	});

	Object.defineProperty(self, 'dpiX', {
		configurable: true,
		enumerable: true,
		get: function() {
			return self.handle.getDPIX();
		},
		set: function(dpi) {
			self.handle.setDPIX(dpi);
		}
	});

	Object.defineProperty(self, 'dpiY', {
		configurable: true,
		enumerable: true,
		get: function() {
			return self.handle.getDPIY();
		},
		set: function(dpi) {
			self.handle.setDPIY(dpi);
		}
	});

	Object.defineProperty(self, 'width', {
		configurable: true,
		enumerable: true,
		get: function() {
			return self.handle.getWidth();
		}
	});

	Object.defineProperty(self, 'height', {
		configurable: true,
		enumerable: true,
		get: function() {
			return self.handle.getHeight();
		}
	});
}
util.inherits(Rsvg, Writable);

Rsvg.prototype.baseURI = null;
Rsvg.prototype.dpiX = 90;
Rsvg.prototype.dpiY = 90;
Rsvg.prototype.width = 0;
Rsvg.prototype.height = 0;

Rsvg.prototype._write = function(data, encoding, callback) {
	try {
		this.handle.write(data);
	} catch (error) {
		callback(error);
		return;
	}

	callback();
};

Rsvg.prototype.getDPI = function() {
	return this.handle.getDPI();
};

Rsvg.prototype.setDPI = function(x, y) {
	this.handle.setDPI(x, y);
};

Rsvg.prototype.dimensions = function(id) {
	return this.handle.dimensions(id);
};

Rsvg.prototype.hasElement = function(id) {
	return this.handle.hasElement(id);
};

Rsvg.prototype.render = function(width, height, format, id) {
	return this.handle.render(width, height, format, id);
};

Rsvg.prototype.renderRaw = function(width, height, id) {
	return this.render(width, height, 'RAW', id);
};

Rsvg.prototype.renderPNG = function(width, height, id) {
	return this.render(width, height, 'PNG', id);
};

Rsvg.prototype.renderPDF = function(width, height, id) {
	return this.render(width, height, 'PDF', id);
};

Rsvg.prototype.renderSVG = function(width, height, id) {
	return this.render(width, height, 'SVG', id);
};

Rsvg.prototype.renderVIPS = function(width, height, id) {
	return this.render(width, height, 'VIPS', id);
};

Rsvg.prototype.toString = function() {
	var obj = {};

	var baseURI = this.baseURI;
	if (baseURI) {
		obj.baseURI = baseURI;
	}

	var dpi = this.getDPI();
	obj.dpi = (dpi.x === dpi.y) ? dpi.x : dpi;

	obj.width = this.width;
	obj.height = this.height;

	return '{ [' + this.constructor.name + ']' + util.inspect(obj).slice(1);
};

exports.Rsvg = Rsvg;
