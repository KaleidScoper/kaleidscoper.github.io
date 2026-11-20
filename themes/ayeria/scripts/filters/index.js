'use strict';

const metaGeneratorPath = './meta_generator';

module.exports = hexo => {
  /* const {
    filter
  } = hexo.extend; */
  // filter.register('after_render:html', require('./meta_generator'));
};

// 保持过滤器最先执行
hexo.extend.filter.register('after_render:html', require(metaGeneratorPath), 1);

// 脚注：剥离方括号、折叠重复引用、补无障碍名（详见 footnote.js）
hexo.extend.filter.register('after_post_render', require('./footnote'));
