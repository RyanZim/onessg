'use strict';
const fs = require('fs-extra');
const path = require('path-extra');
const globby = require('globby');
const grayMatter = require('gray-matter');
const transformer = require('./transformer');
const marked = require('universalify').fromCallback(require('marked'));
const cloneDeep = require('lodash').cloneDeep;
// Local Modules:
const getDefaults = require('./getDefaults.js');

const { Middleware, FilterMiddleware, ExtensionMiddleware } = require('./middleware-base');
const Pipeline = require('./pipeline-base');

Pipeline.register({
  useDefaultConfiguration(config) {
    // ignore any rejection notices from skipped files
    this.ignoreFilterRejection();

    // load files
    this.loadFiles(config);

    // process the front-matter
    this.processGrayMatter();

    // convert into a file data object
    this.objectify();

    // optionally exclude drafts
    if (!config.draft)
      this.excludeDrafts();

    // branch
    this.branchAny(
      // render markdown files
      br => br.renderMarkdownWithMarked(),
      // passthrough html files
      br => br.passthroughHtml());
    
    // get defaults from _defaults.{yml,yaml,json}
    this.getDefaults();

    // render jstransformer layouts
    this.renderLayouts(config);

    // write to disk (html files)
    this.writeHtmlContent(config);

    return this;
  },
  
  loadFiles(config) {
    return this.use(new LoadFileMiddleware(config));
  },

  processGrayMatter() {
    return this.use(new GrayMatterMiddleware());
  },

  objectify() {
    return this.use(new ObjectifyMiddleware());
  },

  excludeDrafts() {
    return this.use(new ExcludeDraftsMiddleware());
  },

  passthroughHtml() {
    return this.use(new PassthroughHtmlMiddleware());
  },

  renderMarkdownWith(render) {
    return this.use(new RenderMardownMiddleware(render));
  },

  renderMarkdownWithMarked() {
    return this.renderMarkdownWith(data =>
      marked(data._body)
      .then(res => {
        // Overwrite data._body:
        data._body = res;
        return data;
      }))
  },

  getDefaults() {
    return this.use(new DefaultsMiddleware());
  },

  renderLayouts(config) {
    return this.use(new RenderLayoutMiddleware(config));
  },

  writeHtmlContent(config) {
    return this.use(new WriteHtmlMiddleware(config));
  },
})

// load named files
class LoadFileMiddleware extends Middleware {
  constructor(config) {
    super();
    this.config = config;
  }

  async invoke(name, next) {
    let fullPath = path.join(this.config.src, name)
    let raw = await fs.readFile(fullPath, 'utf8');

    return await next({ name, raw });
  }
}

// extract front-matter from files
class GrayMatterMiddleware extends Middleware {
  async invoke({ name, raw }, next) {
    let data = grayMatter(raw);
    data.name = name;

    return await next(data);
  }
}

// convert front-matter results into a file data object
class ObjectifyMiddleware extends Middleware {
  async invoke(file, next) {
    // Need to perform a full clone of this object since gray-matter does some
    // agressive caching, and our mutation can mess up the cache
    let data = cloneDeep(file.data);
    data._body = file.content;
    data._path = path.removeExt(file.name);
    data._ext = path.extname(file.name);

    return await next(data);
  }
}

class ExcludeDraftsMiddleware extends FilterMiddleware {
  constructor() {
    super('draft');
  }
  
  condition(data) {
    return !data._draft
  }
}

class PassthroughHtmlMiddleware extends ExtensionMiddleware {
  constructor() {
    super(['html', 'htm']);
  }
}

// render markdown files
class RenderMardownMiddleware extends ExtensionMiddleware {
  constructor(render) {
    super(['.md', '.markdown'], render);
    this.render = render;
  }
  
  async passed(data, next) {
    let res = await this.render(data);
    return await next(res);
  }
}

class DefaultsMiddleware extends Middleware {
  async invoke(data, next) {
    data = await getDefaults(data);
    return await next(data);
  }
}

// for files that specify a layout, render them using it; for other files, passthrough
class RenderLayoutMiddleware extends FilterMiddleware {
  constructor(config) {
    super();
    this.config = config;
  }

  condition(data) {
    return !!data._layout;
  }

  async passed(data, next) {
    let layouts = await globby(path.join(this.config.layouts, data._layout) + '.*');
    
    // Globby doesn't throw an error if the layout path doesn't exist, so we do:
    if (layouts.length == 0)
      throw new Error(`The layout: ${data._layout} cannot be found in ${conf.layouts}`);
      
    let res = await transformer(layouts[0], data);
    data._body = res.body;

    return await next(data);
  }

  async failed(data, next) {
    return await next(data);
  }
}

class WriteHtmlMiddleware extends Middleware {
  constructor(config) {
    super();
    this.config = config;
  }

  async invoke(data, next) {
    // Get path to write to using path-extra:
    var writePath = path.join(this.config.dist, data._path + '.html');
    // Output using fs-extra:
    return await fs.outputFile(writePath, data._body);
  }
}

module.exports = Pipeline;