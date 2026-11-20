'use strict';

/**
 * 脚注 HTML 层修复
 *
 * markdown-it-footnote 3.0.3 的渲染结果是固定的，插件本身不接受任何 option
 * （源码中 function footnote_plugin(md) 只取第一个参数），而 hexo-renderer-markdown-it-katex
 * 的 plugins 配置只能在 use() 时传参，无法在之后覆写 renderer.rules。
 * 因此凡 CSS 做不到的事，都在这里做：
 *
 *   1. 去掉引用号外层的方括号（编号是排版记号，方括号是实现细节）
 *   2. 重复引用的 [1:1] 折叠回 [1]（读者眼里仍是同一条注释）
 *   3. 注释区补 role / aria-label；每条回链补无障碍名，且多回链时标出"第几处"，
 *      这样重复引用既能在正文里看出来（两个 1），也能各自原路返回
 *   4. 保留重复引用产生的全部回链 —— 它们是"这里引用过两次"的提示，
 *      也是每处引用唯一的返回路径
 *
 * 只匹配插件稳定输出的类名与属性顺序，不改动任何其他 HTML。
 */

// [1] → 1，[1:1] → 1
const stripBrackets = html => html.replace(
  /(<sup class="footnote-ref"><a\b[^>]*>)\[(\d+)(?::\d+)?\]/g,
  '$1$2'
);

const tagEndnotes = html => html.replace(
  '<section class="footnotes">',
  '<section class="footnotes" role="doc-endnotes" aria-label="注释">'
);

const BACKREF = /<a href="#fnref(\d+)(?::\d+)?" class="footnote-backref">/g;

/**
 * 给每条回链补 aria-label。
 * 同一条注释被引用多次时，回链会出现多条（href 分别指向 fnref{n} 与 fnref{n}:1 …），
 * 读屏器需要知道这一条返回的是"第几处"，否则几个 "leftwards arrow" 无法区分。
 */
const labelBackrefs = html => {
  const totals = new Map();
  html.replace(BACKREF, (match, note) => {
    totals.set(note, (totals.get(note) || 0) + 1);
    return match;
  });

  const seen = new Map();
  return html.replace(BACKREF, (match, note) => {
    const nth = (seen.get(note) || 0) + 1;
    seen.set(note, nth);
    const label = totals.get(note) > 1
      ? `返回正文引用（第 ${nth} 处）`
      : '返回正文引用';
    return match.replace(
      'class="footnote-backref">',
      `class="footnote-backref" aria-label="${label}">`
    );
  });
};

module.exports = post => {
  if (!post || typeof post.content !== 'string') return post;
  // 绝大多数文章没有脚注，先做一次廉价的短路
  if (post.content.indexOf('footnote') === -1) return post;

  post.content = labelBackrefs(tagEndnotes(stripBrackets(post.content)));

  return post;
};
