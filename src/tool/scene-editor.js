'use strict';

$(function() {
  const sources = [
    './component/Editor.js',
    './component/editor/Camera.js',
    './component/editor/Clipboard.js',
    './component/editor/ComponentFactory.js',
    './component/editor/Modes.js',
    './component/editor/Item.js',
    './component/editor/item/Point.js',
    './component/editor/item/Mesh.js',
    './component/editor/item/Rectangle.js',
    './component/editor/item/Rectangle2.js',
    './component/editor/item/Behavior.js',
    './component/editor/item/CameraPath.js',
    './component/editor/item/Checkpoint.js',
    './component/editor/item/Object.js',
    './component/editor/ItemFactory.js',
    './component/editor/ItemSet.js',
    './component/editor/NodeFactory.js',
    './component/editor/NodeManager.js',
    './component/editor/UI.js',
  ];

  const tasks = sources.map(src => fetch(src));

  Promise.all(tasks).then(responses => {
    return Promise.all(responses.map(resp => resp.text()));
  }).then(scripts => {
    return scripts.join('\n');
  }).then(code => {
    return eval(code + '\nEditor;');
  }).then(init);

  function init(Editor) {
    const editor = new Editor;
    editor.ui.file.recent.loadLatest();
    window.editor = editor;
  }
});
