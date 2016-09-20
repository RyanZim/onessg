"use strict";
module.exports = {
    "env": {
        "node": true,
        "mocha": true
    },
    "parserOptions": {
      "ecmaVersion": 6
    },
    "extends": "eslint:recommended",
    "rules": {
        "indent": ["error", 2],
        "linebreak-style": ["error", "unix"],
        "eol-last": "error",
        "no-trailing-spaces": "error",
        "quotes": ["error", "single", {"avoidEscape": true}],
        "semi": ["error", "always"],
        "strict": "error",
        // Braces:
        "curly": ["error", "multi"],
        "brace-style": ["error", "1tbs"],
        // Spacing:
        "array-bracket-spacing": ["error", "never"],
        "computed-property-spacing": ["error", "never"],
        "func-call-spacing": ["error", "never"],
        // Commas:
        "comma-dangle": ["error", "always-multiline"],
        "comma-style": ["error", "last"],
        "comma-spacing": ["error", { "before": false, "after": true }],
        "block-scoped-var": "error",
        "eqeqeq": ["error", "smart"],
        "handle-callback-err": "error",
        "one-var": ["error", "never"],
    }
};
