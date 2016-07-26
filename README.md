# onessg

onessg (One Static Site Generator) is the Static Site Generator that does only one thing: compile your html. It won't minify your JS, concat your CSS, or optimize your images. Why? You most likely already have a favorite tool for doing that.

> The Javascript pendulum has swung from restrictive, monolithic frameworks to modular, boilerplate-hindered libraries.

>-- [@ericclemmons](https://medium.com/@ericclemmons/javascript-fatigue-48d4011b6fc4#.7xcwmnave)

onessg changes that. We believe in the unix philosophy: do one thing and do it well.

We also believe in setting useful, but overridable defaults. Because of this, onessg requires no configuration files to get started.

## Installation

```bash
npm i onessg
```

You will also need to install your favorite [consolidate.js](https://github.com/tj/consolidate.js/) template engine.

## Example

(Examples here use [ejs](https://github.com/mde/ejs/) as the template engine, you can use any template engine supported by [consolidate.js](https://github.com/tj/consolidate.js/))

onessg assumes the following directory structure by default:
```
.
├── src/
|   └── page-one.html
├── layouts/
|   └── page.ejs
├── dist/
└── package.json
```
All HTML files can include front-matter (yml or json).

**src/page-one.html**:
```
---
title: "My first Page"
_layout: "page"
---
<!-- Your HTML -->
```

Notice the underscore before `layout`. _Anything prefixed with an underscore is reserved word for onessg._ All keys in the front-matter will be passed as a local to your templates.

**layouts/page.ejs** looks like this:
```
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title><%= title %></title>
    </head>
    <body>
        <%- _body -%>
    </body>
</html>
```
Notice the local `_body`. This is the contents of the file (in the case of `page-one.html`, it is `<!-- Your HTML -->`).

**Run:**
```bash
onessg -e ejs
```
(Substitute ejs with the name of your template engine)

onessg will compile all html files in src/ (and subdirectories), and output them to dist/ (retaining the directory structure):
```
.
├── src/
|   └── page-one.html
├── layouts/
|   └── page.ejs
├── dist/
|   └── page-one.html
└── package.json
```
**dist/page-one.html** looks like this:
```
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>My first Page</title>
    </head>
    <body>
        <!-- Your HTML -->
    </body>
</html>
```
**Success!!!**

## CLI Usage

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

Contributions welcome; please discuss before making significant changes.

Check the wiki for the roadmap.

## Licence

MIT
