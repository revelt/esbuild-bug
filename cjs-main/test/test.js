const { strict } = require("assert");
const imported = require("../dist/cjs-main.cjs.js");

strict.equal(
  imported.tryme(2, 2),
  4
);

console.log(`${`\u001b[${32}m${`tests passed!`}\u001b[${39}m`}`)