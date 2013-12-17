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
		});
	});

	describe('height', function() {
		it('gives the vertical size', function() {
			new Rsvg('<svg width="1" height="413"/>').height.should.equal(413);
		});
	});

	describe('dimensions()', function() {
		it('gives the size of the whole image');
		it('gives the size and position of specific elements');
	});

	describe('hasElement()', function() {
		it('determines whether an element with the given ID exists');
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
