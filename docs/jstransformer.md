# JSTransformer

[JSTransformer](https://github.com/jstransformers/jstransformer) is the tool that enables onessg to work with almost any template engine.

JSTransformer unifies template engines and other Node.js tools into a standardized API that onessg can use. From the JSTransformer README:

> There are many good template engines and compilers written for Node.js. But there is a problem: all of them have slightly different APIs, requiring slightly different usage. JSTransformer unifies them into one standardized API. Code written for one transformer will work with any other transformer. There are over 100 transformers, ranging from Markdown parsers to template engines to code compilers.

What does this mean for the end-user?

- You can use almost any template engine with onessg, and you can also use multiple template engines in the same project.
- You will need to install the correct JSTransformer for your template engine.

## Installing the correct JSTransformer

Most of the time, jstransformers are named `jstransformer-<name>`, where `<name>` is the name of the template engine you wish to use.

So for [pug](https://github.com/pugjs/pug) support, you would run:

    npm install -D jstransformer-pug

onessg will automatically attempt to use `jstransformer-pug` for layouts with the `.pug` extension.
