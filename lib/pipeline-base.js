'use strict';

const { BranchAnyMiddleware, FilterRejection } = require('./middleware-base');

module.exports = class Pipeline {
  constructor(setup) {
    this.middleware = [];

    if (typeof setup === 'function')
      setup(this);
  }

  // add middleware to the pipeline
  use(middleware) {
    // if middleware implements invoke, use that
    if (typeof middleware.invoke === 'function')
      this.middleware.push((data, next) => middleware.invoke(data, next));
    // otherwise, assume middleware is a function
    else
      this.middleware.push((data, next) => middleware(data, next));

    // support fluent usage
    return this;
  }

  // build the pipeline
  build(next) {
    // use next as the last middleware, or a no-op
    let chain = next || noop;

    // join all of the middleware in a chain
    for (let i = this.middleware.length - 1; i >= 0; i--)
      chain = join(this.middleware[i], chain);

    // chain current and next middleware into each other
    function join(current, next) {
      return (data) => current(data, next);
    }

    // non-operation
    function noop(data) {
      return data;
    }

    // call the chained middleware
    return chain;
  }

  // invoke the pipeline as middleware
  invoke(data, next) {
    let chain = this.build(next);
    return chain(data);
  }

  /* extensions */

  static register(extensions) {
    // if extensions is a named function (and not a class), register an extension with that name
    if (typeof extensions === 'function' && extensions.name && !extensions.prototype)
      extensions = { [extensions.name]: extensions };

    // if extensions isn't an object, fail
    if (typeof extensions !== 'object')
      throw new Error('invalid extensions');

    for (let name in extensions) {
      let extension = extensions[name];

      // extensions must be functions
      if (typeof extension !== 'function')
        throw new Error('invalid extension ' + name);

      // cannot redefine extensions
      if (name in this.prototype)
        throw new Error('cannot redefine extension ' + name);

      this.prototype[name] = extension;
    }
  }

  branchAny(...setupFns) {
    let pipelines = setupFns.map(buildPipeline);
    return this.use(new BranchAnyMiddleware(pipelines));

    function buildPipeline(setup) {
      let pl = new Pipeline(setup);

      // this is a hack to allow prebuilding the chain
      //   Pipeline.build() requires a `next` function; since we don't have
      //   that until later, use a variable that is overwritten later
      let n = () => {
        throw new Error('function reference did not get replaced');
      };
      function psudo_next(data) {
        return n(data);
      }

      let chain = pl.build(psudo_next);
      function invoke(data, next) {
        n = next;
        return chain(data);
      }

      return invoke;
    }
  }

  ignoreFilterRejection() {
    return this.use((name, next) => {
      Promise.resolve(next(name))
        .catch(err => {
          if (!(err instanceof FilterRejection))
            throw err;
          // console.debug('skipping %s: %s', name, err.message);
        });
    });
  }
};
