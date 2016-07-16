#! /usr/bin/env node

'use strict';

function inject(pattern, text, sources, template)
{
  const regexp = new RegExp('^(.*)' + pattern, 'm');
  const match = regexp.exec(text);
  if (!match) {
    console.info(text);
    throw new Error(`Could not find ${pattern}.`);
  }

  const prefix = match[1];
  const lines = [];
  sources.forEach(src => {
    lines.push(prefix + template.replace('{{src}}', src));
  });
  lines.push(prefix + pattern);

  return text.replace(regexp, lines.join('\n'));
}

function injectJS(pattern, html, sources) {
  return inject(pattern, html, sources,
    '<script type="text/javascript" src="{{src}}"></script>');
}

function injectCSS(pattern, html, sources) {
  return inject(pattern, html, sources,
    '<link rel="stylesheet" type="text/css" href="{{src}}">');
}

module.exports = {
  injectJS,
  injectCSS,
};
