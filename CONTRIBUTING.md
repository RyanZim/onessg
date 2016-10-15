Looking to contribute something to do? **Here's how you can help.**

Please take a moment to review the guidelines below.

## General Conduct

Please respect the following rules:

- Please **do not** derail or troll issues or PR's. Keep the discussion on topic and respect the opinions of others.
- Please **do not** post comments consisting solely of "+1" or ":thumbsup:". Use [GitHub's "reactions" feature](https://github.com/blog/2119-add-reactions-to-pull-requests-issues-and-comments) instead. We will delete comments that violate this rule.
- **Absolutely No** foul language, swearing, or name-calling. Comments that violate this rule will be edited to remove the offensive language or deleted by the moderators.

## Issues

For bugs :beetle:, feature requests :bulb:, and questions :speech_balloon:, please file an issue!

You may want to look at the  [Roadmap](https://github.com/RyanZim/onessg/wiki/Roadmap) to see what features are already planned. If you have a need for one of these features, please file an issue so we can make it high-priority!

### Bug Reports

Please search to make sure the issue hasn't already been reported by someone else.

Make sure you can reproduce the issue using the current `master` branch. The issue may have been fixed since the last release. If that is the case and you need the bugfix urgently, you are welcome to file an issue asking for an ETA on the next release. I'll try to make one ASAP.

Please try to be extremely detailed in your report. It may be best to create a reduced test case repository that we can clone and run `npm test` to see and debug the issue.

## Pull Requests

Good pull requests are a great help.

**Please ask first** before embarking on any significant pull request (e.g. adding a new feature, refactoring code, etc.).

All new features must have tests, bugfixes should have tests to prevent regressions where practical. We have 100% code coverage and would like to keep it that way.

[Test-Driven-Development](https://en.wikipedia.org/wiki/Test-driven_development) is a good practice (write tests first, then the actual code).

- Run `npm test` to run the test suite.
- Run `npm run coverage` to generate the line-by-line coverage report. The report will output to `coverage/lcov-report/index.html`.

For more information on writing tests, please see [test/README.md](test/README.md).

If you make changes to the headings in `README.md`, please run `npm run toc` to update the table of contents.

**IMPORTANT**: By submitting a patch, you agree to allow the project owners to license your work under the terms of the [MIT License](LICENSE).
