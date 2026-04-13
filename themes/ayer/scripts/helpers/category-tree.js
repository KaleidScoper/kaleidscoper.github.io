'use strict';

/**
 * Custom category tree helper for the /categories page.
 *
 * Generates a "dual-column block" per root category:
 *   Left  — category name (large) + total post count
 *   Right — subcategories as a tree list with indent guide lines
 *
 * Usage in EJS:  <%- category_tree([options]) %>
 */

hexo.extend.helper.register('category_tree', function (options) {
  const opts = Object.assign(
    {
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

  function renderSubtree(cats) {
    const sorted = sortCategories(cats);
    if (!sorted.length) return '';

    let html = '<ul class="cat-subtree">';

    sorted.forEach(cat => {
      const children = categories.filter(c => c.parent === cat._id);
      const hasChildren = children.length > 0;

      html += '<li class="cat-subitem">';
      html += `<a class="cat-sublink" href="${self.url_for(cat.path)}">${cat.name}</a>`;
      html += `<span class="cat-subcount">\uff08${cat.posts.length}\uff09</span>`;

      if (hasChildren) {
        html += renderSubtree(children);
      }

      html += '</li>';
    });

    html += '</ul>';
    return html;
  }

  const roots = sortCategories(categories.filter(cat => !cat.parent));
  let html = '';

  roots.forEach(cat => {
    const total = cat.posts.length;
    const children = categories.filter(c => c.parent === cat._id);

    html += '<div class="cat-block">';

    html += '<div class="cat-block-left">';
    html += `<a class="cat-block-name" href="${self.url_for(cat.path)}">${cat.name}</a>`;
    html += `<span class="cat-block-total">${self.__('posts_count', total)}</span>`;
    html += '</div>';

    html += '<div class="cat-block-right">';
    if (children.length > 0) {
      html += renderSubtree(children);
    }
    html += '</div>';

    html += '</div>';
  });

  return html;
});
