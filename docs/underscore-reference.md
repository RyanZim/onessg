# Underscore Reference

This is a reference to all the underscore-prefixed values in onessg.

## Keys You Set

These are the keys you can set in your front-matter or `_defaults.yaml`.

- `_layout` This is the layout (without the file extension) that will be used for the page.
- `_draft` Sets this page as a draft. Drafts will not be compiled unless you pass the `--dev` option.

## Keys onessg Sets

These keys are set automatically by onessg and exposed to you templates as locals. Of course, you can access the keys you set in your templates as well.

- `_body` This is the main contents of the file (the part outside the front-matter).
