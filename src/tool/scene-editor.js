"use strict";
$(function() {
    const editor = new Editor;
    editor.ui.file.recent.loadLatest();

    window.editor = editor;
});
