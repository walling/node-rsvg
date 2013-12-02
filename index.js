/*jshint node:true*/

'use strict';

var binding = require('./build/Release/rsvg');
var Writable = require('stream').Writable;
var util = require('util');

/**
 * Represents one SVG file to be rendered. You can optionally pass the SVG file
 * directly as an argument (Buffer or string) to the constructor. Otherwise the
 * object is a writable stream and you can pipe a file into it.
 *
 * @constructor
 * @param {(Buffer|string)} [buffer] - SVG file.
 */
function Rsvg(buffer) {
	var self = this;

	// Create proper options for the writable stream super constructor.
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

	// Inheritance pattern: Invoke super constructor.
	Writable.call(self, options);

	// Create new instance of binding.
	self.handle = new binding.Rsvg(buffer);

	// When finished piping into this object, we need to tell the binding that by
	// invoking the `close()` method.
	self.on('finish', function() {
		try {
			self.handle.close();
		} catch (error) {
			self.trigger('error', error);
		}
	});

	// Define getter/setter for `baseURI` property.
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

	// Define getter/setter for `dpiX` property.
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

	// Define getter/setter for `dpiY` property.
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

	// Define getter for `width` property.
	Object.defineProperty(self, 'width', {
		configurable: true,
		enumerable: true,
		get: function() {
			return self.handle.getWidth();
		}
	});

	// Define getter for `height` property.
	Object.defineProperty(self, 'height', {
		configurable: true,
		enumerable: true,
		get: function() {
			return self.handle.getHeight();
		}
	});
}

// Inherit from writable stream.
util.inherits(Rsvg, Writable);

/**
 * Base URI.
 * @member {string}
 */
Rsvg.prototype.baseURI = null;

/**
 * Horizontal resolution. Allowed values: >= 0.
 * @member {number}
 */
Rsvg.prototype.dpiX = 90;

/**
 * Vertical resolution. Allowed values: >= 0.
 * @member {number}
 */
Rsvg.prototype.dpiY = 90;

/**
 * Image width. Always integer.
 * @readonly
 * @member {number}
 */
Rsvg.prototype.width = 0;

/**
 * Image height. Always integer.
 * @readonly
 * @member {number}
 */
Rsvg.prototype.height = 0;

/**
 * @see [Node.JS API]{@link http://nodejs.org/api/stream.html#stream_writable_write_chunk_encoding_callback_1}
 * @private
 */
Rsvg.prototype._write = function(data, encoding, callback) {
	try {
		this.handle.write(data);
	} catch (error) {
		callback(error);
		return;
	}

	callback();
};

/**
 * Get the DPI for the outgoing pixbuf.
 * @returns {{x: number, y: number}}
 */
Rsvg.prototype.getDPI = function() {
	return this.handle.getDPI();
};

/**
 * Set the DPI for the outgoing pixbuf. Common values are 75, 90, and 300 DPI.
 * Passing null to x or y will reset the DPI to whatever the default value
 * happens to be (usually 90). You can set both x and y by specifying only the
 * first argument.
 *
 * @param {number} x - Horizontal resolution.
 * @param {number} [y] - Vertical resolution. Set to the same as X if left out.
 */
Rsvg.prototype.setDPI = function(x, y) {
	this.handle.setDPI(x, y);
};

/**
 * Get the SVG's size or the size/position of a subelement if id is given. The
 * id must begin with "#".
 *
 * @param {string} [id] - Subelement to determine the size and position of.
 * @returns {{width: number, height: number, x: number, y: number}}
 */
Rsvg.prototype.dimensions = function(id) {
	return this.handle.dimensions(id);
};

/**
 * Checks whether the subelement with given id exists in the SVG document.
 *
 * @param {string} id - Subelement to check existence of.
 * @returns {boolean}
 */
Rsvg.prototype.hasElement = function(id) {
	return this.handle.hasElement(id);
};

/**
 * Base render method. Valid high-level formats are: PNG, PDF, SVG, RAW. You
 * can also specify the pixel structure of raw images: ARGB32 (default), RGB24,
 * A8, A1, RGB16_565, and RGB30 (only enabled for Cairo >= 1.12). You can read
 * more about the low-level pixel formats in the [Cairo Documentation]{@link
 * http://cairographics.org/manual/cairo-Image-Surfaces.html#cairo-format-t}.
 *
 * If the id is given, only that subelement is rendered.
 *
 * The PNG format is the slowest of them all, since it takes time to encode the
 * image as a PNG buffer.
 *
 * @param {number} width - Output image width, should be an integer.
 * @param {number} height - Output image height, should be an integer.
 * @param {string} [format] - One of the formats listed above.
 * @param {string} [id] - Subelement to render.
 * @returns {{data: Buffer, format: string, width: number, height: number}}
 */
Rsvg.prototype.render = function(width, height, format, id) {
	return this.handle.render(width, height, format, id);
};

/**
 * Render the SVG as a raw memory buffer image. This can be used to create an
 * image that is imported into other image libraries. This render method is
 * usually very fast.
 *
 * The pixel format is ARGB and each pixel is 4 bytes, ie. the buffer size is
 * width*height*4. There are no memory "spaces" between rows in the image, like
 * there can be when calling the base render method with pixel formats like A8.
 *
 * @param {number} width - Output image width, should be an integer.
 * @param {number} height - Output image height, should be an integer.
 * @param {string} [id] - Subelement to render.
 * @returns {{data: Buffer, format: string, pixelFormat: string, width: number, height: number}}
 */
Rsvg.prototype.renderRaw = function(width, height, id) {
	return this.render(width, height, 'RAW', id);
};

/**
 * Render the SVG as a PNG image.
 *
 * @param {number} width - Output image width, should be an integer.
 * @param {number} height - Output image height, should be an integer.
 * @param {string} [id] - Subelement to render.
 * @returns {{data: Buffer, format: string, width: number, height: number}}
 */
Rsvg.prototype.renderPNG = function(width, height, id) {
	return this.render(width, height, 'PNG', id);
};

/**
 * Render the SVG as a PDF document.
 *
 * @param {number} width - Output document width, should be an integer.
 * @param {number} height - Output document height, should be an integer.
 * @param {string} [id] - Subelement to render.
 * @returns {{data: Buffer, format: string, width: number, height: number}}
 */
Rsvg.prototype.renderPDF = function(width, height, id) {
	return this.render(width, height, 'PDF', id);
};

/**
 * Render the SVG as an SVG. This seems superfluous, but it can be used to
 * normalize the input SVG. However you can not be sure that the resulting SVG
 * file is smaller than the input. It's not a SVG compression engine. You can
 * be sure that the output SVG follows a more stringent structure.
 *
 * @param {number} width - Output document width, should be an integer.
 * @param {number} height - Output document height, should be an integer.
 * @param {string} [id] - Subelement to render.
 * @returns {{data: string, format: string, width: number, height: number}}
 */
Rsvg.prototype.renderSVG = function(width, height, id) {
	return this.render(width, height, 'SVG', id);
};

/**
 * String representation of this SVG render object.
 * @returns {string}
 */
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

// Export the Rsvg object.
exports.Rsvg = Rsvg;
