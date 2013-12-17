'use strict';

var sinon = require('sinon');
var Rsvg = require('..').Rsvg;

describe('Rsvg (deprecated features)', function() {

	describe('dpiX', function() {
		it('is deprecated', function() {
			// TODO: Can it be tested?
		});

		it('is default 90', function() {
			new Rsvg().dpiX.should.equal(90);
		});
	});

	describe('dpiY', function() {
		it('is deprecated', function() {
			// TODO: Can it be tested?
		});

		it('is default 90', function() {
			new Rsvg().dpiY.should.equal(90);
		});
	});

	describe('getDPI()', function() {
		it('is deprecated', function() {
			new Rsvg().getDPI.name.should.equal('deprecated');
		});

		it('is default 90', function() {
			var dpi = new Rsvg().getDPI();
			dpi.should.have.property('x', 90);
			dpi.should.have.property('y', 90);
		});
	});

	describe('setDPI()', function() {
		it('is deprecated', function() {
			new Rsvg().setDPI.name.should.equal('deprecated');
		});

		it('can set a single resolution', function() {
			var svg = new Rsvg();
			svg.setDPI(300);
			svg.getDPI().should.deep.equal({ x: 300, y: 300 });
			svg.dpiX.should.equal(300);
			svg.dpiY.should.equal(300);
		});

		it('can set a distinct vertical/horizontal resolution', function() {
			var svg = new Rsvg();
			svg.setDPI(120, 180);
			svg.getDPI().should.deep.equal({ x: 120, y: 180 });
			svg.dpiX.should.equal(120);
			svg.dpiY.should.equal(180);
		});

		it('defaults to 90 DPI', function() {
			var svg = new Rsvg();
			svg.setDPI(120, 180);
			svg.setDPI();
			svg.getDPI().should.deep.equal({ x: 90, y: 90 });
			svg.dpiX.should.equal(90);
			svg.dpiY.should.equal(90);
		});
	});

	describe('render() called with: width, height, format, id', function() {
		it('is deprecated', function() {
			new Rsvg()._renderArgs.name.should.equal('deprecated');
		});

		it('renders an element in the given format and resolution', function() {
			var svg = new Rsvg();
			var underlyingRender = svg.handle.render = sinon.spy();

			svg.render(300, 400, 'PNG');
			underlyingRender.should.have.been.calledOnce;
			underlyingRender.should.have.been.calledWithExactly(
				300,
				400,
				'png',
				undefined
			);

			svg.render(900, 900, 'RAW', '#el');
			underlyingRender.should.have.been.calledTwice;
			underlyingRender.should.have.been.calledWithExactly(900, 900, 'raw', '#el');
		});
	});

	describe('renderRaw()', function() {
		it('is deprecated', function() {
			new Rsvg().renderRaw.name.should.equal('deprecated');
		});

		it('renders as a raw memory buffer', function() {
			var svg = new Rsvg();
			var render = svg.render = sinon.spy();

			svg.renderRaw(300, 400);
			render.should.have.been.calledOnce;
			render.should.have.been.calledWithExactly({
				format: 'raw',
				width: 300,
				height: 400,
				element: undefined
			});

			svg.renderRaw(900, 900, '#path1');
			render.should.have.been.calledTwice;
			render.should.have.been.calledWithExactly({
				format: 'raw',
				width: 900,
				height: 900,
				element: '#path1'
			});
		});
	});

	describe('renderPNG()', function() {
		it('is deprecated', function() {
			new Rsvg().renderPNG.name.should.equal('deprecated');
		});

		it('renders as a PNG image', function() {
			var svg = new Rsvg();
			var render = svg.render = sinon.spy();

			svg.renderPNG(300, 400);
			render.should.have.been.calledOnce;
			render.should.have.been.calledWithExactly({
				format: 'png',
				width: 300,
				height: 400,
				element: undefined
			});

			svg.renderPNG(900, 900, '#path1');
			render.should.have.been.calledTwice;
			render.should.have.been.calledWithExactly({
				format: 'png',
				width: 900,
				height: 900,
				element: '#path1'
			});
		});
	});

	describe('renderPDF()', function() {
		it('is deprecated', function() {
			new Rsvg().renderPDF.name.should.equal('deprecated');
		});

		it('renders as a PDF document', function() {
			var svg = new Rsvg();
			var render = svg.render = sinon.spy();

			svg.renderPDF(300, 400);
			render.should.have.been.calledOnce;
			render.should.have.been.calledWithExactly({
				format: 'pdf',
				width: 300,
				height: 400,
				element: undefined
			});

			svg.renderPDF(900, 900, '#path1');
			render.should.have.been.calledTwice;
			render.should.have.been.calledWithExactly({
				format: 'pdf',
				width: 900,
				height: 900,
				element: '#path1'
			});
		});
	});

	describe('renderSVG()', function() {
		it('is deprecated', function() {
			new Rsvg().renderSVG.name.should.equal('deprecated');
		});

		it('renders as a SVG document', function() {
			var svg = new Rsvg();
			var render = svg.render = sinon.spy();

			svg.renderSVG(300, 400);
			render.should.have.been.calledOnce;
			render.should.have.been.calledWithExactly({
				format: 'svg',
				width: 300,
				height: 400,
				element: undefined
			});

			svg.renderSVG(900, 900, '#path1');
			render.should.have.been.calledTwice;
			render.should.have.been.calledWithExactly({
				format: 'svg',
				width: 900,
				height: 900,
				element: '#path1'
			});
		});
	});

});
