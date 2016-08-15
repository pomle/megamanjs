#! /usr/bin/env node

'use strict';

function inject(pattern, template, items)
{
  const regexp = new RegExp('^(.*)' + pattern, 'm');
  const match = regexp.exec(template);
  if (!match) {
    console.info(template);
    throw new Error(`Could not find ${pattern}.`);
  }

  const prefix = match[1];
  const lines = [];
  items.forEach(item => {
    lines.push(prefix + item);
  });
  lines.push(prefix + pattern);

  return template.replace(regexp, lines.join('\n'));
}

function injectJS(pattern, html, sources)
{
  return inject(pattern, html, sources.map(src => {
    return '<script type="text/javascript" src="{{src}}"></script>'.replace('{{src}}', src);
  }));
}

function injectCSS(pattern, html, sources)
{
  return inject(pattern, html, sources.map(src => {
    return '<link rel="stylesheet" type="text/css" href="{{src}}">'.replace('{{src}}', src);
  }));
}

module.exports = {
  inject,
  injectJS,
  injectCSS,
};
