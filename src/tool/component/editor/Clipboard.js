"use strict";

Editor.Clipboard = function()
{
    this.items = {}
}

Editor.Clipboard.prototype.get = function(type)
{
    if (this.items[type]) {
        return this.items[type][0];
    }
}

Editor.Clipboard.prototype.add = function(type, data)
{
    if (!this.items[type]) {
        this.items[type] = [];
    }
    this.items[type].unshift(data);
}