# esbuild-bug

A POC to recreate the ESBuild bug related to ESLint (CJS) plugin workflow.

## Overview

There are two packages:

1. `esm-dep` — ES modules package which exports function `mult()` which multiplies two numbers
2. `cjs-main` — the CJS package which consumes the aforementioned `esm-dep`. It's built to CJS target using esbuild's settings: `platform=node, format=cjs, bundle=true, target=esnext`.

This setup mimics the ESLint plugins — they are in CJS, and the exported default plain object contains the methods. The problem is that while `esbuild` output exports an object, its methods become inaccessible.

## Instructions

1. `mkdir deleteme && cd deleteme`
2. `git clone git@github.com:revelt/esbuild-bug.git`
3. `cd esbuild-bug`
4. `npm i`
5. `cd esm-dep`
6. `npm run build` — it will build into `../cjs-main/node_modules/esm-dep` mimicking a real npm package. In real life, it would be an ESLint plugin. Notice we deliberately are not git-ignoring the folder `./cjs-main/node-modules/*` — it's mimicking the case where `esm-dep` would be a real npm package.
7. `cd ..`
8. `cd cjs-main`
9. `npm run build`
10. `npm run test`

At this moment, the test will fail, complaining about:

> TypeError: tryme is not a function

You can fix that by manually editing `./cjs-main/dist/cjs-main.cjs.js` - delete the line:

```js
module.exports = __toCommonJS(main_exports);
```

Then append a new line at the bottom of the file:

```js
module.exports = __toCommonJS(main_default);
```

![Screenshot 2022-11-04 at 19 00 56](https://user-images.githubusercontent.com/8344688/200054971-d7235ab4-a47b-4604-a400-f411425f9e13.png)

Now, if you rerun tests inside `cjs-main` folder, `npm run test`, they will pass.

## Practically

Practically, this bug forces us to hard-patch the esbuild's CJS output to make the default exports work, specifically those of ESLint plugins.

## References

- Real ESLint plugin: <https://github.com/codsen/codsen/tree/main/packages/eslint-plugin-test-num-tbc>
- ESBuild output patch script: <https://github.com/codsen/codsen/blob/main/ops/scripts/fix-cjs.js>
