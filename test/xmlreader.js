const fs = require('fs');
const DOMParser = require('xmldom').DOMParser;

function createNode(xml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  return doc;
}

function readXml(file) {
  const xml = fs.readFileSync(file, 'utf8');
  return createNode(xml);
}

module.exports = {
  createNode: createNode,
  readXml: readXml,
};