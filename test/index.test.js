'use strict';

var Writable = require('stream').Writable;
var sinon = require('sinon');
var Rsvg = require('..').Rsvg;

describe('Rsvg', function() {

	describe('Rsvg()', function() {
		it('can be constructed with a SVG', function() {
			// Use buffer.
			var svg = new Rsvg(new Buffer('<svg width="5" height="7"></svg>'));
			svg.should.be.an.instanceof(Rsvg);
			svg.width.should.equal(5);
			svg.height.should.equal(7);

			// Use string.
			svg = new Rsvg('<svg width="3" height="8"></svg>');
			svg.width.should.equal(3);
			svg.height.should.equal(8);

			// Not writable anymore
			var onerror = sinon.spy();
			svg.on('error', onerror);
			svg.write('<svg width="3" height="2"></svg>');
			onerror.should.have.been.calledOnce;
			onerror.lastCall.args.should.have.length(1);
			onerror.lastCall.args[0].should.match(/write failure/i);
		});

		it('can be a writable stream', function() {
			// Default constructor.
			var svg = new Rsvg();
			svg.should.be.an.instanceof(Writable);
			svg.width.should.equal(0);
			svg.height.should.equal(0);

			// Write to stream and basic test.
			svg.write('<svg width="4" height="6">').should.be.true;
			svg.width.should.equal(4);
			svg.height.should.equal(6);

			// Stream options.
			svg = new Rsvg({ highWaterMark: 16 });
			svg.write('<svg width="4" height="6">').should.be.false;
		});

		it('emits load event when ready', function(done) {
			// Stream.
			var onload = sinon.spy();
			var svg = new Rsvg();
			svg.on('load', onload);
			svg.write('<svg width="4" height="6">');
			svg.write('</svg>');
			onload.should.not.have.been.called;
			svg.end();
			onload.should.have.been.calledOnce;
			onload.should.have.been.calledWithExactly();

			// Constructed with SVG.
			onload = sinon.spy();
			svg = new Rsvg('<svg width="2" height="3"></svg>');
			svg.on('load', onload);
			onload.should.not.have.been.called;
			process.nextTick(function() {
				onload.should.have.been.calledOnce;
				onload.should.have.been.calledWithExactly();
				done();
			});
		});

		it('gives an error for invalid SVG content', function() {
			// Stream.
			var onerror = sinon.spy();
			var svg = new Rsvg();
			svg.on('error', onerror);
			svg.write('this is not a SVG file');
			onerror.should.have.been.calledOnce;
			svg.write('this is not a SVG file');
			onerror.should.have.been.calledTwice;
			onerror.lastCall.args.should.have.length(1);
			onerror.lastCall.args[0].should.match(/write failure/);

			// Constructed with SVG.
			function loadInvalidSVG() {
				/*jshint -W031 */
				new Rsvg('this is not a SVG file');
				/*jshint +W031 */
			}
			loadInvalidSVG.should.throw(/load failure/i);
		});
	});

	describe('baseURI', function() {
		it('allows to reference external SVGs');
	});

	describe('width', function() {
		it('gives the horizontal size', function() {
			new Rsvg('<svg width="314" height="1"/>').width.should.equal(314);
			new Rsvg('<svg width="257" height="2"/>').width.should.equal(257);
		});
	});

	describe('height', function() {
		it('gives the vertical size', function() {
			new Rsvg('<svg width="1" height="413"/>').height.should.equal(413);
			new Rsvg('<svg width="2" height="752"/>').height.should.equal(752);
		});
	});

	describe('dimensions()', function() {
		it('gives the size of the whole image', function() {
			new Rsvg('<svg width="314" height="257"/>').dimensions().should.deep.equal({
				x: 0,
				y: 0,
				width: 314,
				height: 257
			});
			new Rsvg('<svg width="17" height="19"/>').dimensions().should.deep.equal({
				x: 0,
				y: 0,
				width: 17,
				height: 19
			});
		});

		it('gives the size and position of specific elements', function() {
			var svg = new Rsvg();
			svg.write('<svg width="12" height="10">');
			svg.write('<rect x="-2" y="3" width="7" height="5" id="r1"/>');
			svg.write('<rect x="8" y="4" width="4" height="6" id="r2"/>');
			svg.write('<circle cx="8" cy="3" r="3" id="circ"/>');
			svg.write('</svg>');
			svg.end();

			svg.dimensions().should.deep.equal({
				x: 0,
				y: 0,
				width: 12,
				height: 10
			});
			svg.dimensions(null).should.deep.equal(svg.dimensions());

			svg.dimensions('#r1').should.deep.equal({
				x: -2,
				y: 3,
				width: 7,
				height: 5
			});
			svg.dimensions('#r2').should.deep.equal({
				x: 8,
				y: 4,
				width: 4,
				height: 6
			});
			svg.dimensions('#circ').should.deep.equal({
				x: 5,
				y: 0,
				width: 6,
				height: 6
			});
		});
	});

	describe('hasElement()', function() {
		it('determines whether an element with the given ID exists', function() {
			var svg = new Rsvg();
			svg.write('<svg width="12" height="10">');
			svg.write('<rect x="-2" y="3" width="7" height="5" id="r1"/>');
			svg.write('<rect x="8" y="4" width="4" height="6" id="r2"/>');
			svg.write('<circle cx="8" cy="3" r="3" id="circ"/>');
			svg.write('</svg>');
			svg.end();

			svg.hasElement().should.be.false;
			svg.hasElement(null).should.be.false;
			svg.hasElement('#r1').should.be.true;
			svg.hasElement('#r2').should.be.true;
			svg.hasElement('#circ').should.be.true;
			svg.hasElement('#foo').should.be.false;
			svg.hasElement('r1').should.be.false;
		});
	});

	describe('autocrop()', function() {
		it('finds the drawing area of the SVG');
	});

	describe('render()', function() {
		it('does nothing for an empty SVG document');
		it('renders as a raw memory buffer');
		it('renders as a PNG image');
		it('renders as a PDF document');
		it('renders as a PDF document');
		it('renders in various image sizes');
		it('can render specific SVG elements');
		it('can render a specific area [future]');
		it('can trim the image to a given rect [future]');
		it('can resize to fit inside box [future]');
		it('can resize to fit outside box [future]');
		it('can resize while ignoring aspect ratio [future]');
		it('can resize with a focus point [future]');
		it('can add a background color [future]');
	});

	describe('toString()', function() {
		it('gives a string representation', function() {
			var svg = new Rsvg();
			svg.toString().should.equal('{ [Rsvg] width: 0, height: 0 }');

			svg = new Rsvg('<svg width="3" height="7"></svg>');
			svg.toString().should.equal('{ [Rsvg] width: 3, height: 7 }');
		});
	});

});
