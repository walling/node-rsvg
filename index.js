'use strict';

var binding = require('./build/Release/rsvg');
var Writable = require('stream').Writable;
var util = require('util');

/**
 * Represents one SVG file to be rendered. You can optionally pass the SVG file
 * directly as an argument (Buffer or string) to the constructor. Otherwise the
 * object is a writable stream and you can pipe a file into it. Optionally you
 * can initialize the writable stream with specific options if you pass an
 * object.
 *
 * @see [LibRSVG Default Constructor]{@link
 * https://developer.gnome.org/rsvg/2.40/RsvgHandle.html#rsvg-handle-new}
 * @see [LibRSVG Constructor From Data]{@link
 * https://developer.gnome.org/rsvg/2.40/RsvgHandle.html#rsvg-handle-new-from-data}
 * @see [Writable Stream Constructor]{@link
 * http://nodejs.org/api/stream.html#stream_new_stream_writable_options}
 *
 * @constructor
 * @param {(Buffer|string|Object)} [buffer] - SVG file.
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
	} else if (typeof(buffer) === 'object') {
		options = buffer;
		buffer = null;
	} else {
		throw new TypeError('Invalid argument: buffer');
	}

	// Inheritance pattern: Invoke super constructor.
	Writable.call(self, options);

	// Create new instance of binding.
	try {
		self.handle = new binding.Rsvg(buffer);
	} catch (error) {
		throw new Error('Rsvg load failure: ' + error.message);
	}

	if (buffer) {
		process.nextTick(function() {
			self.emit('load');
		});
	}

	// When finished piping into this object, we need to tell the binding that by
	// invoking the `close()` method.
	self.on('finish', function() {
		try {
			self.handle.close();
		} catch (error) {
			if (error.message !== self.lastErrorMessage) {
				self.lastErrorMessage = error.message;
				self.emit('error', new Error('Rsvg close failure: ' + error.message));
			}
			return;
		}

		self.emit('load');
	});
}

// Inherit from writable stream.
util.inherits(Rsvg, Writable);

/**
 * Base URI.
 * @member {string}
 */
Rsvg.prototype.baseURI = null;

// Define getter/setter for `baseURI` property.
Object.defineProperty(Rsvg.prototype, 'baseURI', {
	configurable: true,
	enumerable: true,
	get: function() {
		return this.handle.getBaseURI();
	},
	set: function(uri) {
		this.handle.setBaseURI(uri);
	}
});

/**
 * Horizontal resolution. Allowed values: >= 0.
 * @deprecated since version 2.0
 * @member {number}
 */
Rsvg.prototype.dpiX = 90;

// Define getter/setter for deprecated `dpiX` property.
Object.defineProperty(Rsvg.prototype, 'dpiX', {
	configurable: true,
	enumerable: true,
	get: util.deprecate(function() {
		return this.handle.getDPIX();
	}, 'Rsvg#dpiX: DPI does not affect rendering.'),
	set: util.deprecate(function(dpi) {
		this.handle.setDPIX(dpi);
	}, 'Rsvg#dpiX: DPI does not affect rendering.')
});

/**
 * Vertical resolution. Allowed values: >= 0.
 * @deprecated since version 2.0
 * @member {number}
 */
Rsvg.prototype.dpiY = 90;

// Define getter/setter for deprecated `dpiY` property.
Object.defineProperty(Rsvg.prototype, 'dpiY', {
	configurable: true,
	enumerable: true,
	get: util.deprecate(function() {
		return this.handle.getDPIY();
	}, 'Rsvg#dpiY: DPI does not affect rendering.'),
	set: util.deprecate(function(dpi) {
		this.handle.setDPIY(dpi);
	}, 'Rsvg#dpiY: DPI does not affect rendering.')
});

/**
 * Image width. Always integer.
 * @readonly
 * @member {number}
 */
Rsvg.prototype.width = 0;

// Define getter for `width` property.
Object.defineProperty(Rsvg.prototype, 'width', {
	configurable: true,
	enumerable: true,
	get: function() {
		return this.handle.getWidth();
	}
});

/**
 * Image height. Always integer.
 * @readonly
 * @member {number}
 */
Rsvg.prototype.height = 0;

// Define getter for `height` property.
Object.defineProperty(Rsvg.prototype, 'height', {
	configurable: true,
	enumerable: true,
	get: function() {
		return this.handle.getHeight();
	}
});

/**
 * @see [Node.JS API]{@link
 * http://nodejs.org/api/stream.html#stream_writable_write_chunk_encoding_callback_1}
 * @private
 */
Rsvg.prototype._write = function(data, encoding, callback) {
	try {
		this.handle.write(data);
	} catch (error) {
		this.lastErrorMessage = error.message;
		callback(new Error('Rsvg write failure: ' + error.message));
		return;
	}

	callback();
};

/**
 * Get the DPI for the outgoing pixbuf.
 *
 * @deprecated since version 2.0
 * @returns {{x: number, y: number}}
 */
Rsvg.prototype.getDPI = util.deprecate(function() {
	return this.handle.getDPI();
}, 'Rsvg#getDPI(): DPI does not affect rendering.');

/**
 * Set the DPI for the outgoing pixbuf. Common values are 75, 90, and 300 DPI.
 * Passing null to x or y will reset the DPI to whatever the default value
 * happens to be (usually 90). You can set both x and y by specifying only the
 * first argument.
 *
 * @deprecated since version 2.0
 * @param {number} x - Horizontal resolution.
 * @param {number} [y] - Vertical resolution. Set to the same as X if left out.
 */
Rsvg.prototype.setDPI = util.deprecate(function(x, y) {
	this.handle.setDPI(x, y);
}, 'Rsvg#setDPI(): DPI does not affect rendering.');

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
 * Find the drawing area, ie. the smallest area that has image content in the
 * SVG document.
 *
 * @returns {{width: number, height: number, x: number, y: number}}
 */
Rsvg.prototype.autocrop = function() {
	var area = this.handle.autocrop();
	area.x = area.x.toFixed(3) * 1;
	area.y = area.y.toFixed(3) * 1;
	area.width = area.width.toFixed(3) * 1;
	area.height = area.height.toFixed(3) * 1;
	return area;
};

/**
 * Base render method. Valid high-level formats are: png, pdf, svg, raw. You
 * can also specify the pixel structure of raw images: argb32 (default), rgb24,
 * a8, a1, rgb16_565, and rgb30 (only enabled for Cairo >= 1.12). You can read
 * more about the low-level pixel formats in the [Cairo Documentation]{@link
 * http://cairographics.org/manual/cairo-Image-Surfaces.html#cairo-format-t}.
 *
 * If the element property is given, only that subelement is rendered.
 *
 * The PNG format is the slowest of them all, since it takes time to encode the
 * image as a PNG buffer.
 *
 * @param {Object} [options] - Rendering options.
 * @param {string} [options.format] - One of the formats listed above.
 * @param {number} [options.width] - Output image width, should be an integer.
 * @param {number} [options.height] - Output image height, should be an integer.
 * @param {string} [options.id] - Subelement to render.
 * @returns {{data: Buffer, format: string, width: number, height: number}}
 */
Rsvg.prototype.render = function(options) {
	if (arguments.length > 1 || typeof(options) !== 'object') {
		return this._renderArgs.apply(this, arguments);
	}

	options = options || {};

	return this.handle.render(
		options.width,
		options.height,
		options.format,
		options.id
	);
};

/**
 * @deprecated since version 2.0
 * @private
 */
Rsvg.prototype._renderArgs = util.deprecate(function(width, height, format, id) {
	return this.handle.render(width, height, format ? format.toLowerCase() : null, id);
}, 'Rsvg#render(): Call render({ format, width, height, ... }) instead.');

/**
 * Render the SVG as a raw memory buffer image. This can be used to create an
 * image that is imported into other image libraries. This render method is
 * usually very fast.
 *
 * The pixel format is ARGB and each pixel is 4 bytes, ie. the buffer size is
 * width*height*4. There are no memory "spaces" between rows in the image, like
 * there can be when calling the base render method with pixel formats like A8.
 *
 * @deprecated since version 2.0
 * @param {number} width - Output image width, should be an integer.
 * @param {number} height - Output image height, should be an integer.
 * @param {string} [id] - Subelement to render.
 * @returns {{data: Buffer, format: string, pixelFormat: string, width: number, height: number}}
 */
Rsvg.prototype.renderRaw = util.deprecate(function(width, height, id) {
	return this.render({
		format: 'raw',
		width: width,
		height: height,
		element: id
	});
}, 'Rsvg#renderRaw(): Call render({ format: "raw" }) instead.');

/**
 * Render the SVG as a PNG image.
 *
 * @deprecated since version 2.0
 * @param {number} width - Output image width, should be an integer.
 * @param {number} height - Output image height, should be an integer.
 * @param {string} [id] - Subelement to render.
 * @returns {{data: Buffer, format: string, width: number, height: number}}
 */
Rsvg.prototype.renderPNG = util.deprecate(function(width, height, id) {
	return this.render({
		format: 'png',
		width: width,
		height: height,
		element: id
	});
}, 'Rsvg#renderPNG(): Call render({ format: "png" }) instead.');

/**
 * Render the SVG as a PDF document.
 *
 * @deprecated since version 2.0
 * @param {number} width - Output document width, should be an integer.
 * @param {number} height - Output document height, should be an integer.
 * @param {string} [id] - Subelement to render.
 * @returns {{data: Buffer, format: string, width: number, height: number}}
 */
Rsvg.prototype.renderPDF = util.deprecate(function(width, height, id) {
	return this.render({
		format: 'pdf',
		width: width,
		height: height,
		element: id
	});
}, 'Rsvg#renderPDF(): Call render({ format: "pdf" }) instead.');

/**
 * Render the SVG as an SVG. This seems superfluous, but it can be used to
 * normalize the input SVG. However you can not be sure that the resulting SVG
 * file is smaller than the input. It's not a SVG compression engine. You can
 * be sure that the output SVG follows a more stringent structure.
 *
 * @deprecated since version 2.0
 * @param {number} width - Output document width, should be an integer.
 * @param {number} height - Output document height, should be an integer.
 * @param {string} [id] - Subelement to render.
 * @returns {{data: string, format: string, width: number, height: number}}
 */
Rsvg.prototype.renderSVG = util.deprecate(function(width, height, id) {
	return this.render({
		format: 'svg',
		width: width,
		height: height,
		element: id
	});
}, 'Rsvg#renderSVG(): Call render({ format: "svg" }) instead.');

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

	obj.width = this.width;
	obj.height = this.height;

	return '{ [' + this.constructor.name + ']' + util.inspect(obj).slice(1);
};

// Export the Rsvg object.
exports.Rsvg = Rsvg;
