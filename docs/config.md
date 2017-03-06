# `onessg.config.js`

The config file must be named `onessg.config.js`. It is placed in the project root. (You can configure this via the CLI's `--config` option.)

`onessg.config.js` is a JS config file.

You can set options for your template engine with this file.

**Example config for ejs:**

```js
module.exports = {
  ejs: {
    rmWhitespace: true,
    strict: true,
  },
};
```

**Example config for [nunjucks](https://github.com/mozilla/nunjucks):**

```js
module.exports = {
  nunjucks: {
    throwOnUndefined: true,
    trimBlocks: true,
  },
};
```
