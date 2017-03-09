# Underscore Reference

This is a reference to all the underscore-prefixed values in onessg.

## Keys You Set

These are the keys you can set in your front-matter or `_defaults.yaml`.

- `_layout` This is the layout (without the file extension) that will be used for the page.

## Keys onessg Sets

These keys are set automatically by onessg and exposed to you templates as locals. Of course, you can access the keys you set in your templates as well.

- `_body` This is the main contents of the file (the part outside the front-matter).
- `_path` This is the path of the HTML or Markdown file, relative to `src/`. **Extensions are removed.**
- `_ext` This is the extension of the HTML or Markdown file in `src/`. Possible values are `.html`, `.md`, & `.markdown`.
