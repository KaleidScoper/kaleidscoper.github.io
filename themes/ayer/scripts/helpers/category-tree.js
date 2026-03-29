'use strict';

/**
 * Custom category tree helper for the /categories page.
 *
 * Generates semantic HTML with `data-depth` attributes and toggle controls,
 * enabling recursive CSS styling via custom properties and JS-driven
 * collapse/expand interactions.
 *
 * Usage in EJS:  <%- category_tree([options]) %>
 *
 * Options (all optional, can also be set via theme config `category_tree`):
 *   - max_depth  {Number}  Maximum nesting depth to render (default: Infinity)
 *   - count      {Boolean} Show post count badge (default: true)
 *   - collapsed  {Boolean} Render children collapsed by default (default: false)
 *   - orderby    {String}  Sort field: 'name' | 'count' (default: 'name')
 *   - order      {Number}  1 = ascending, -1 = descending (default: 1)
 */

hexo.extend.helper.register('category_tree', function (options) {
  const opts = Object.assign(
    {
      max_depth: Infinity,
      count: true,
      collapsed: false,
      orderby: 'name',
      order: 1,
    },
    (this.theme || {}).category_tree,
    options
  );

  const categories = this.site.categories;
  if (!categories || !categories.length) return '';

  const self = this;

  function sortCategories(cats) {
    const arr = cats.toArray();
    const key = opts.orderby === 'count' ? 'length' : 'name';
    arr.sort((a, b) => {
      const va = key === 'length' ? a.posts.length : a.name;
      const vb = key === 'length' ? b.posts.length : b.name;
      if (va < vb) return -1 * opts.order;
      if (va > vb) return 1 * opts.order;
      return 0;
    });
    return arr;
  }

  function renderLevel(cats, depth) {
    if (depth > opts.max_depth) return '';

    const sorted = sortCategories(cats);
    if (!sorted.length) return '';

    const isExpanded = !opts.collapsed;
    let html = `<ul class="cat-tree" data-depth="${depth}">`;

    sorted.forEach(cat => {
      const children = cat.posts ? categories.filter(c => c.parent === cat._id) : { length: 0 };
      const hasChildren = children.length > 0;
      const nodeClass = 'cat-node' + (hasChildren ? ' has-children' : '');
      const expandedAttr = hasChildren ? ` data-expanded="${isExpanded}"` : '';

      html += `<li class="${nodeClass}" data-depth="${depth}"${expandedAttr}>`;
      html += '<div class="cat-header">';

      if (hasChildren) {
        html += `<button class="cat-toggle" aria-label="Toggle"><i class="ri-arrow-right-s-line"></i></button>`;
      }

      html += `<a class="cat-link" href="${self.url_for(cat.path)}">${cat.name}</a>`;

      if (opts.count) {
        html += `<span class="cat-count">${cat.posts.length}</span>`;
      }

      html += '</div>';

      if (hasChildren && depth < opts.max_depth) {
        const childHtml = renderLevel(children, depth + 1);
        if (childHtml) {
          html += `<div class="cat-children">${childHtml}</div>`;
        }
      }

      html += '</li>';
    });

    html += '</ul>';
    return html;
  }

  const roots = categories.filter(cat => !cat.parent);
  return renderLevel(roots, 1);
});
