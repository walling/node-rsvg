# Node.JS Binding for LibRSVG

**LibRSVG** is a SVG rendering library, which parses SVG files and renders them in various formats. The formats include:

 *  PNG
 *  PDF
 *  SVG
 *  Raw memory buffer image

[![Build Status](https://travis-ci.org/walling/node-rsvg.png?branch=master)](https://travis-ci.org/walling/node-rsvg)


## Basic Usage

Here is a simple example. Look in `index.js` for more documentation.

```javascript
var Rsvg = require('rsvg').Rsvg;
var fs = require('fs');

// Create SVG render instance.
var svg = new Rsvg();

// When finishing reading SVG, render and save as PNG image.
svg.on('finish', function() {
  console.log('SVG width: ' + svg.width);
  console.log('SVG height: ' + svg.height);
  fs.writeFile('tiger.png', svg.render({
    format: 'png',
    width: 600,
    height: 400
  }).data);
});

// Stream SVG file into render instance.
fs.createReadStream('tiger.svg').pipe(svg);
```


## Installation

First install the LibRSVG library and header files. Usually you have to look for a *development* package version. You must also have a functioning build tool chain including `pkg-config`. You can find instructions for different operating systems below. After that, you simply run:

```bash
npm install rsvg
```

Library versions known to work:

 *  LibRSVG 2.26+
 *  Cairo 1.8.8+

#### Ubuntu:

```bash
sudo apt-get install librsvg2-dev
```

#### RedHat / OpenSUSE:

```bash
sudo yum install librsvg2-devel
```

#### Mac OS X:

```bash
brew install librsvg
```

If, after installing LibRSVG through homebrew you are experiencing issues installing this module, try manually exporting the package config with this command:

```bash
export PKG_CONFIG_PATH=/opt/X11/lib/pkgconfig
```

Then try reinstalling this module. For further information, [see this thread](https://github.com/Homebrew/homebrew/issues/14123).

#### Windows:

N/A; pull requests are accepted!
