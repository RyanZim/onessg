# onessg

[![Travis](https://img.shields.io/travis/RyanZim/onessg.svg?maxAge=2592000)](https://travis-ci.org/RyanZim/onessg)
[![Coveralls branch](https://img.shields.io/coveralls/RyanZim/onessg/master.svg)](https://coveralls.io/github/RyanZim/onessg)
[![npm](https://img.shields.io/npm/v/onessg.svg?maxAge=2592000)](https://www.npmjs.com/package/onessg)
[![npm](https://img.shields.io/npm/l/onessg.svg?maxAge=2592000)](https://github.com/RyanZim/onessg/blob/master/LICENSE)

onessg (One Static Site Generator) is the Static Site Generator that does only one thing: compile your html and markdown. It won't minify your JS, concat your CSS, or optimize your images. Why? You most likely already have a favorite tool for doing that.

> The Javascript pendulum has swung from restrictive, monolithic frameworks to modular, boilerplate-hindered libraries.
>
>-- [@ericclemmons](https://medium.com/@ericclemmons/javascript-fatigue-48d4011b6fc4#.7xcwmnave)

onessg changes that. We believe in the unix philosophy: do one thing and do it well.

We also believe in setting useful, but overridable defaults. Because of this, onessg requires no configuration files to get started.

## Contents
<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Installation](#installation)
- [Example](#example)
- [CLI Usage & Options](#cli-usage--options)
- [Contributing](#contributing)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

```bash
npm install -D onessg
```

You will also need to install the jstransformer for your favorite template engine. For example, if you use [EJS](https://github.com/mde/ejs), you would run:

```bash
npm install -D jstransformer-ejs
```

You can read more about jstransformers [here](docs/jstransformer.md).

**Note:** We recommend installing onessg as a devDependency (with the `-D` flag) and running it via an npm script. If you choose to install onessg globally, you will also need to install the jstransformer globally as well.

## Example

Assuming the following file/directory structure:
```
.
├── src/
|   ├── _defaults.yaml
|   └── page-one.md
├── layouts/
|   └── page.ejs
├── dist/
└── package.json
```

**src/page-one.md**:
```html
---
title: "My first Page"
_layout: "page"
---
Hello World!
```

The front-matter (the part between the `---` lines) is written in YAML ([other languages](https://github.com/jonschlinkert/gray-matter#optionslang) are supported as well). All keys in the front-matter will be passed as locals to your templates.

Notice the underscore before `layout`. _Anything prefixed with an underscore is reserved word for onessg._ See the [full list of underscore keys](docs/underscore-reference.md).

---

You can set defaults for your front-matter in `_defaults.yaml` (`_defaults.json` works too!). These defaults can be overridden in your front-matter.

**src/_defaults.yaml**:
```yaml
title: "Hello World!" # This title will be used if none is specified
author: "John Smith"
```

If you place a `_defaults.yaml` file in a subdirectory in `src/`, settings there will only apply to files in that subdirectory and its child subdirectories.

---

Layouts are written in the templating language of your choice. We are using EJS here, but you can use any template engine that has a [jstransformer](docs/jstransformer.md). You can also use multiple template engines in the same project! onessg will infer the correct template engine from the file extension.

**layouts/page.ejs** looks like this:
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title><%= title %></title>
    <meta name="author" content="<%= author %>">
  </head>
  <body>
    <%- _body -%>
  </body>
</html>
```

Notice the local `_body`. This is the local for outputing the contents of each file. For **page-one.md**, it is `Hello World!`.

---

**Run:**

```bash
onessg
```

onessg will compile all the html and markdown files in `src/` (and subdirectories), and output them to `dist/` (retaining the directory structure):

```
.
├── src/
|   ├── _defaults.yaml
|   └── page-one.md
├── layouts/
|   └── page.ejs
├── dist/
|   └── page-one.html
└── package.json
```

**dist/page-one.html** looks like this:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>My first Page</title>
    <meta name="author" content="John Smith">
  </head>
  <body>
    <p>Hello World!</p>
  </body>
</html>
```

**Success!!!** :tada:

A few notes:

- The title (`My first Page`) comes from the front-matter.
- The author's name (`John Smith`) comes from the `_defaults.yaml` file.

For further reading, see the [Tutorial](docs/tutorial.md).

## CLI Usage & Options

```
onessg
onessg [-s <source_dir>] [-d <output_dir>] [-l <layout_dir>]

Options:
  -s, --src      Set the src directory                [string] [default: "src/"]
  -d, --dist     Set the dist directory              [string] [default: "dist/"]
  -l, --layouts  Set the layouts directory        [string] [default: "layouts/"]
  --help         Show help                                             [boolean]
  --version      Show version number                                   [boolean]

Examples:
  onessg
  onessg -s posts/ -d output/ -l templates/

```

## Contributing

Contributions welcome; please read the [Contributing Guidelines](CONTRIBUTING.md) for more info.

Check the [Roadmap](https://github.com/RyanZim/onessg/wiki/Roadmap) to see what's on the horizon.

## License

[MIT](https://github.com/RyanZim/onessg/blob/master/LICENSE)
