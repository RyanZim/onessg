# Tests

## How the tests work:

- The files in `src/` are compiled to `dist/`, using onessg.
- Each test uses our custom `assert.file()` function to compare the file in `dist/` to the one in `expected/`.
- `assert.file('text.html');` will throw an error if `dist/text.html` is not equal to `expected/text.html`, failing the test.
- When a markdown file is passed to `assert.file()`, it compares the corresponding HTML files in `dist/` and `expected/`.

## Guidelines for writing tests:

- All filenames should be self-explanatory of their contents.
- Do not set a default for `_layout` in `src/_defaults.yaml`, it will break existing tests.
- All front-matter and `_defaults` files should be written in yaml, except for the purpose of testing other configuration formats.
- Write basic tests in HTML, not markdown.
- Markdown files should use the `.md` extension, except for the purpose of testing `.markdown` extension support.
