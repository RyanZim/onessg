# onessg

[![Travis](https://img.shields.io/travis/RyanZim/onessg.svg?maxAge=2592000)](https://travis-ci.org/RyanZim/onessg)
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
- [Tutorial](#tutorial)
- [CLI Usage & Options](#cli-usage-&-options)
- [Contributing](#contributing)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

```bash
npm i onessg
```

You will also need to install your favorite [consolidate.js-supported template engine](https://github.com/tj/consolidate.js/#supported-template-engines).

**Note:** We recommend installing onessg as a devDependency (with the `-D` flag) and running it via an npm script. If you choose to install onessg globally, you will also need to install your template engine globally as well.

## Tutorial

Examples will use [ejs](https://github.com/mde/ejs/) as the template engine, you can use any template engine supported by [consolidate.js](https://github.com/tj/consolidate.js/).

For this tutorial we will use the following file/directory structure:
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
onessg looks in the folders `src/` & `layouts/` and writes to `dist/` by default (you can change this if you wish).

---

All files in `src/` can include front-matter. YAML is parsed by default, see the [gray-matter docs](https://github.com/jonschlinkert/gray-matter#optionslang) for a list of supported languages.

**src/page-one.md**:
```html
---
title: "My first Page"
_layout: "page"
---
Hello World!
```

Notice the underscore before `layout`. _Anything prefixed with an underscore is reserved word for onessg._ All keys in the front-matter will be passed as a local to your templates.

You can set defaults for your front-matter in `_defaults.yaml` (`_defaults.json` works too!). These defaults can be overridden in your front-matter. `_defaults.yaml` is also the place to set options for your template engine.

**src/_defaults.yaml**:
```yaml
title: "Hello World!" # This title will be used if none is specified
author: "John Smith"
rmWhitespace: true # Here we are setting an option for ejs
```

Layouts are written in the templating language of your choice. We are using EJS here, but you can use any template engine on [this list](https://github.com/tj/consolidate.js/#supported-template-engines).

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

**Run:**

```bash
onessg ejs
```

(Substitute `ejs` with the name of your template engine)

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

- The title (`My first Page`) comes from the front-matter.
- The author's name (`John Smith`) comes from the `_defaults.yaml` file.
- Leading whitespace is removed by ejs due to the `rmWhitespace` option that we set in `_defaults.yaml`.

**Success!!!** :tada:

Now we are going to add a subdirectory to `src/`, named `subdirectory` (of course! :wink:). Inside the subdirectory, we will add a `_defaults.yaml` and an html page, named `subpage.html`. Now our directory tree looks like this:

```
.
├── src/
|   ├── subdirectory
|   |   ├── _defaults.yaml
|   |   └── subpage.html
|   ├── _defaults.yaml
|   └── page-one.md
├── layouts/
|   └── page.ejs
├── dist/
└── package.json
```

Here is the contents of the files:

**src/subdirectory/_defaults.yaml**:
```yaml
_layout: page
author: Jane Smith
```

Note that settings here **only** affect files in `subdirectory/`!

Let's discuss each line:
- `_layout: page` Here we are setting a default layout. This means we will not have to set `_layout` in each pages' front-matter.
- `author: Jane Smith` Here we are overriding the default author set in `src/_defaults.yaml`.

**src/subdirectory/subpage.html**:
```html
<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
```

Note that we have omitted the front-matter. The defaults from the `_defaults` file in this directory and parent directories (up to `src/`) will apply.

We will run onessg again:
```bash
onessg ejs
```

Our directory structure is now:
```
.
├── src/
|   ├── subdirectory
|   |   ├── _defaults.yaml
|   |   └── subpage.html
|   ├── _defaults.yaml
|   └── page-one.md
├── layouts/
|   └── page.ejs
├── dist/
|   ├── subdirectory
|   |   └── subpage.html
|   └── page-one.html
└── package.json
```

**dist/subdirectory/subpage.html** looks like this:
```html
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Hello World!</title>
<meta name="author" content="Jane Smith">
</head>
<body>
<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
</body>
</html>
```

A few things to note:

- The default title from `src/_defaults.yaml` has been applied.
- The default author from `src/_defaults.yaml` has been overridden by the one in `src/subdirectory/_defaults.yaml`.
- The `rmWhitespace` option from `src/_defaults.yaml` is also in effect.

**Hooray!** You are now a certified onessg user! :mortar_board:

## CLI Usage & Options

```
onessg <template_engine>
onessg <template_engine> [-s <source_dir>] [-d <output_dir>] [-l <layout_dir>]

Options:
  -s, --src      Set the src directory                [string] [default: "src/"]
  -d, --dist     Set the dist directory              [string] [default: "dist/"]
  -l, --layouts  Set the layouts directory        [string] [default: "layouts/"]
  --help         Show help                                             [boolean]
  --version      Show version number                                   [boolean]

Examples:
  onessg ejs
  onessg ejs -s posts/ -d output/ -l templates/

A list of supported template engines may be found at:
https://github.com/tj/consolidate.js/#supported-template-engines.
```

## Contributing

Contributions welcome; please discuss before making significant changes. All new features should be tested. Run `npm test` to run the tests. You can generate a code coverage report by running `npm run coverage`. The report will be found at `coverage/lcov-report/index.html`.

If you make changes to the headings in `README.md`, please run `npm run toc` to update the table of contents.

For bugs :beetle:, feature requests :bulb:, and questions :speech_balloon:, please file an issue!

Check the [Roadmap](https://github.com/RyanZim/onessg/wiki/Roadmap) to see what's on the horizon.

## License

[MIT](https://github.com/RyanZim/onessg/blob/master/LICENSE)
