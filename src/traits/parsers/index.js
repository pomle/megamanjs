const {Parser} = require('@snakesilk/xml-loader');
const Traits = require('..');

const {createFactory} = Parser.TraitParser;

module.exports = {
  'conveyor': createFactory(Traits.Conveyor),
  'destructible': require('./Destructible'),
  'door': require('./Door'),
  'elevator': require('./Elevator'),
  'fallaway': createFactory(Traits.Fallaway),
  'headlight': createFactory(Traits.Headlight),
  'stun': createFactory(Traits.Stun),
  'teleport': createFactory(Traits.Teleport),
  'weapon': require('./Weapon'),
};
