Game.Loader = function(game)
{
    this.event = new Engine.Events();
    this.game = game;
}

Game.Loader.prototype.applyTrait = function(object, traitDescriptor)
{
    var trait = object.getTrait(traitDescriptor.ref);
    if (!trait) {
        trait = new traitDescriptor.ref();
        object[trait.NAME] = object.applyTrait(trait);
    }

    for (var p in traitDescriptor.prop) {
        var prop = traitDescriptor.prop[p];
        if (prop !== undefined) {
            trait[p] = prop;
        }
    }
}
