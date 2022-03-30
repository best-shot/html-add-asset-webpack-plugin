# html-add-asset-webpack-plugin

Webpack plugin to inject tags to html.

[![npm][npm-badge]][npm-url]
[![github][github-badge]][github-url]
![node][node-badge]

[npm-url]: https://www.npmjs.com/package/html-add-asset-webpack-plugin
[npm-badge]: https://img.shields.io/npm/v/html-add-asset-webpack-plugin.svg?style=flat-square&logo=npm
[github-url]: https://github.com/best-shot/html-add-asset-webpack-plugin
[github-badge]: https://img.shields.io/npm/l/html-add-asset-webpack-plugin.svg?style=flat-square&colorB=blue&logo=github
[node-badge]: https://img.shields.io/node/v/html-add-asset-webpack-plugin.svg?style=flat-square&colorB=green&logo=node.js

## Installation

```bash
npm install html-add-asset-webpack-plugin --save-dev
```

## Usage

Add the plugin to your webpack config

```javascript
import { HtmlAddAssetWebpackPlugin } from 'html-add-asset-webpack-plugin';
// or
const { HtmlAddAssetWebpackPlugin } = require('html-add-asset-webpack-plugin');
```

```javascript
plugins: [
  new HtmlWebpackPlugin({
    filename: 'index.html'
  }),
  new HtmlWebpackPlugin({
    filename: 'other.html',
    tags: [
      {
        tagName: 'script',
        prepend: true,
        attributes: {
          src: 'special-script.js'
        }
      }
    ]
  }),
  new HtmlAddAssetWebpackPlugin()
];
```

To:

```html
<!-- index.html -->
<script src="common-script.js"></script>

<!-- other.html -->
<script src="special-script.js"></script>
<script src="common-script.js"></script>
```

## Options

### HtmlWebpackPlugin.Options.tags:

```ts
interface Tag extends Omit<HtmlTagObject, 'voidTag'> {
  voidTag?: boolean;
  prepend?: boolean;
  tagName: 'meta' | 'script' | 'style';
}
```

## Inspiration

This project is inspired by [html-webpack-inject-plugin](https://github.com/kagawagao/html-webpack-inject-plugin).
