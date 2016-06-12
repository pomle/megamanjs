"use strict";
$(function() {
    const editor = new Editor;
    window.editor = editor;
    editor.ui.file.recent.loadLatest();
});
