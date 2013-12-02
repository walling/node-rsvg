
# Node.JS Binding for LibRSVG

**LibRSVG** is a SVG rendering library, which parses SVG files and renders them in various formats. The formats include:

 *  PNG
 *  PDF
 *  SVG
 *  Raw memory buffer image


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

#### Windows:

N/A; pull requests are accepted!
