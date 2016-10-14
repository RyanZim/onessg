# Tests

Each folder in `fixtures/` contains `src/`, `expected/`, and `layouts/` (if applicable). The files in `src/` should compile to equal the files in `expected/`.

## `assert.fixture()`

We have a custom `assert.fixture()` function for use in our tests. Here are the API docs:

Usage is `assert.fixture(<fixture>, done)`, where `<fixture>` is the name of the folder in `fixtures/`, and `done` is the mocha `done()` callback.

- This will compile the files in `<fixture>/src/` to `<fixture>/dist/`.
- If `<fixture>/layouts/` is present, that will be used as the layout directory. Otherwise, an empty directory (`fixtures/empty-dir/`) is used.
- It will then compare the files in `dist/` to the ones in `expected/`, and call `done()` with an error if differences are found. Otherwise, it will call `done()`.

## Guidelines for writing tests:

- All filenames should attempt to be self-explanatory of their contents.
- Write basic tests in HTML, not markdown.
- All front-matter and `_defaults` files should be written in yaml, except for the purpose of testing other configuration formats.
- Markdown files should use the `.md` extension, except for the purpose of testing `.markdown` extension support.
