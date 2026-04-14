"use strict";

module.exports = (hexo) => {
  const isZh = hexo.theme.i18n.languages[0].search(/zh-CN/i) !== -1;
  const title = hexo.config.title || 'My Blog';
  const url = hexo.config.url || '';

  const pad = (str, width) => {
    const gap = width - str.length;
    if (gap <= 0) return str;
    const left = Math.floor(gap / 2);
    return ' '.repeat(left) + str + ' '.repeat(gap - left);
  };

  const W = 44;
  const line1 = pad(title, W);
  const line2 = isZh
    ? pad('Hexo 博客 · Ayer 主题', W)
    : pad('Hexo Blog · Theme Ayer', W);
  const line3 = pad(url, W);

  hexo.log.info(`
------------------------------------------------
|                                              |
|              __     ________ _____           |
|            /\\\\ \\   / /  ____|  __ \\          |
|           /  \\\\ \\_/ /| |__  | |__) |         |
|          / /\\ \\\\   / |  __| |  _  /          |
|         / ____ \\| |  | |____| | \\ \\          |
|        /_/    \\_\\_|  |______|_|  \\_\\         |
|                                              |
|${line1}|
|${line2}|
|${line3}|
|                                              |
------------------------------------------------
`);
};
