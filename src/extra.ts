import HtmlWebpackPlugin from 'html-webpack-plugin';
import type { Compilation, Compiler } from 'webpack';

const name = 'HtmlScriptModuleWebpackPlugin';

export class HtmlScriptModuleWebpackPlugin {
  // eslint-disable-next-line class-methods-use-this
  apply(compiler: Compiler) {
    if (compiler.options.output.module) {
      compiler.hooks.compilation.tap(name, (compilation: Compilation) => {
        const hooks = HtmlWebpackPlugin.getHooks(compilation).alterAssetTags;

        hooks.tapAsync(name, (htmlPluginData, callback) => {
          htmlPluginData.assetTags.scripts.forEach((item) => {
            if (
              item.meta?.plugin === 'html-webpack-plugin' &&
              item.attributes
            ) {
              /* eslint-disable no-param-reassign */
              delete item.attributes.defer;
              item.attributes.type = 'module';
            }
          });

          return callback(null, htmlPluginData);
        });
      });
    }
  }
}
