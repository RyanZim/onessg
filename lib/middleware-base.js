'use strict';

class Middleware {
  // invoke executes the middleware and returns a promise
  // parameters are data and a function to call the next middleware
  async invoke(data, next) {
    throw new Error('not implemented')
  }
}

// attempt multiple branches; stop at the first that returns something
class BranchAnyMiddleware extends Middleware {
  constructor(branches) {
    super();
    this.branches = branches
  }

  invoke(data, next) {
    return new Promise((resolve, reject) => {
      trybr(resolve, 0, i => {
        if (i < this.branches.length)
          return this.branches[i].bind(null, data, next);
        
        reject(new Error('No branches succeeded'))
      })
    });

    function trybr(resolve, index, get) {
      Promise.resolve()
        .then(get(index))
        .then(resolve, () => trybr(index+1, get, resolve));
    }
  }
}

class FilterRejection extends Error {}

// conditional execution for middleware
class FilterMiddleware extends Middleware {
  constructor(message) {
    super();

    this.message = message || 'condition failed';
  }

  // override condition to do something useful
  condition(data) {
    return true;
  }

  // passed defaults to calling the next middleware
  passed(data, next) {
    return next(data);
  }

  // failed defaults to terminating the pipeline
  failed(data, next) {
    return Promise.reject(new FilterRejection(this.message));
  }

  invoke(data, next) {
    if (this.condition(data))
      return this.passed(data, next);
    else
      return this.failed();
  }
}

// filter on file extensions
class ExtensionMiddleware extends FilterMiddleware {
  constructor(ext) {
    super('extension did not match');
    
    if (typeof ext === 'string')
      this.filter = x => x === ext;
    else if (typeof ext === 'function')
      this.filter = ext;
    else if (ext instanceof Array)
      this.filter = x => ext.indexOf(x) >= 0;
    else
      throw new Error('invalid argument: ext');
  }
}

module.exports = {
    Middleware,
    BranchAnyMiddleware,
    FilterMiddleware,
    ExtensionMiddleware,
    FilterRejection
}