# onessg

[![Travis](https://img.shields.io/travis/RyanZim/onessg.svg?maxAge=2592000)]()
[![npm](https://img.shields.io/npm/v/onessg.svg?maxAge=2592000)]()
[![npm](https://img.shields.io/npm/l/onessg.svg?maxAge=2592000)]()

onessg (One Static Site Generator) is the Static Site Generator that does only one thing: compile your html. It won't minify your JS, concat your CSS, or optimize your images. Why? You most likely already have a favorite tool for doing that.

> The Javascript pendulum has swung from restrictive, monolithic frameworks to modular, boilerplate-hindered libraries.
>
>-- [@ericclemmons](https://medium.com/@ericclemmons/javascript-fatigue-48d4011b6fc4#.7xcwmnave)

onessg changes that. We believe in the unix philosophy: do one thing and do it well.

We also believe in setting useful, but overridable defaults. Because of this, onessg requires no configuration files to get started.

## Installation

```bash
npm i onessg
```

You will also need to install your favorite [consolidate.js-supported template engine](https://github.com/tj/consolidate.js/#supported-template-engines).

## Example

Examples will use [ejs](https://github.com/mde/ejs/) as the template engine, you can use any template engine supported by [consolidate.js](https://github.com/tj/consolidate.js/).

For this tutorial we will use the following file/directory structure:
```
.
├── src/
|   ├── _defaults.yaml
|   └── page-one.html
├── layouts/
|   └── page.ejs
├── dist/
└── package.json
```
onessg looks in the folders `src/` & `layouts/` and writes to `dist/` by default (you can change this if you wish).

All HTML files can include front-matter (yaml or json).

**src/page-one.html**:
```
---
title: "My first Page"
_layout: "page"
---
<!-- Your HTML -->
```
Notice the underscore before `layout`. _Anything prefixed with an underscore is reserved word for onessg._ All keys in the front-matter will be passed as a local to your templates.

You can set defaults for your front-matter in `_defaults.yaml` (`_defaults.json` works too!). These defaults can be overridden in your front-matter. `_defaults.yaml` is also the place to set options for your template engine.

**src/_defaults.yaml**:
```
title: "Hello World!" # This title will be used if none is specified
author: "John Smith"
rmWhitespace: true # Here we are setting an option for ejs
```

**layouts/page.ejs** looks like this:
```
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
Notice the local `_body`. This is the contents of the file. For **page-one.html**, it is `<!-- Your HTML -->`.

**Run:**
```bash
onessg -e ejs
```
(Substitute ejs with the name of your template engine)

onessg will compile all html files in `src/` (and subdirectories), and output them to `dist/` (retaining the directory structure):
```
.
├── src/
|   ├── _defaults.yaml
|   └── page-one.html
├── layouts/
|   └── page.ejs
├── dist/
|   └── page-one.html
└── package.json
```
**dist/page-one.html** looks like this (leading whitespace is removed by ejs due to the `rmWhitespace` option that we set in `_defaults.yaml`):
```
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>My first Page</title>
<meta name="author" content="John Smith">
</head>
<body>
<!-- Your HTML -->
</body>
</html>
```
**Success!!!** :tada:

Now we are going to add a subdirectory to `src/`. Inside the subdirectory, we will add a `_defaults.yaml` and an html page. Now our tree looks like this:
```
.
├── src/
|   ├── subdirectory
|   |   ├── _defaults.yaml
|   |   └── subpage.html
|   ├── _defaults.yaml
|   └── page-one.html
├── layouts/
|   └── page.ejs
├── dist/
└── package.json
```

Here is the contents of the files:

**src/subdirectory/_defaults.yaml**:
```
_layout: page
author: Jane Smith
```

Note that settings here **only** affect files in `subdirectory/`!

Let's discuss each line:
- `_layout: page` Here we are setting a default layout. This means we will not have to set `_layout` in each pages' front-matter.
- `author: Jane Smith` Here we are overriding a default set in `src/_defaults.yaml`.

**src/subdirectory/subpage.html**:
```
<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
```
Note that we have omitted the front-matter. The defaults from the `_defaults` file in this directory and parent directories (up to `src/`) will apply.

We will run onessg again:
```
onessg -e ejs
```

Our directory structure is now:
```
.
├── src/
|   ├── subdirectory
|   |   ├── _defaults.yaml
|   |   └── subpage.html
|   ├── _defaults.yaml
|   └── page-one.html
├── layouts/
|   └── page.ejs
├── dist/
|   ├── subdirectory
|   |   └── subpage.html
|   └── page-one.html
└── package.json
```

**dist/subdirectory/subpage.html**:
```
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
Note that the default title from **src/_defaults.yaml** has been applied. The `rmWhitespace` option also is in effect.

**Hooray!** You are now a certified onessg user! :mortar_board:

## CLI Usage & Options

```
onessg -e ejs

Override Defaults:
onessg -e ejs -s source/ -d _output -l templates

Options:
  -e, --engine   Set the valid consolidate.js template engine to use when
                 parsing layouts                             [string] [required]
  -s, --src      Set the src directory                [string] [default: "src/"]
  -d, --dist     Set the dist directory              [string] [default: "dist/"]
  -l, --layouts  Set the layouts directory        [string] [default: "layouts/"]
  --help         Show help                                             [boolean]
```

## Development

Contributions welcome; please discuss before making significant changes. All new features should be tested. Run `npm test` to run the tests.

For bugs :beetle:, feature requests :bulb:, and questions :speech_balloon:, please file an issue!

Check the [Roadmap](https://github.com/RyanZim/onessg/wiki/Roadmap) to see what's on the horizon.

## License

MIT
