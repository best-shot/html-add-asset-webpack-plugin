import HtmlWebpackPlugin, { HtmlTagObject } from 'html-webpack-plugin';
import { Compilation, Compiler } from 'webpack';

interface Tag extends Omit<HtmlTagObject, 'voidTag'> {
  voidTag?: boolean;
  prepend?: boolean;
  tagName: 'meta' | 'script' | 'style' | 'link';
}

interface MergeTag extends HtmlTagObject {
  prepend: boolean;
  tagName: Tag['tagName'];
}

const name = 'HtmlAddAssetWebpackPlugin';

function mapping(externals: Tag[] = []): MergeTag[] {
  return externals.map(
    ({
      tagName,
      attributes = {},
      innerHTML,
      voidTag = false,
      prepend = true,
    }) => {
      return {
        tagName,
        attributes,
        innerHTML,
        voidTag,
        prepend,
        meta: {
          plugin: name,
        },
      };
    },
  );
}

type MergeTagParent = 'meta' | 'scripts' | 'styles';

export class HtmlAddAssetWebpackPlugin {
  // eslint-disable-next-line class-methods-use-this
  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap(name, (compilation: Compilation) => {
      const hooks = HtmlWebpackPlugin.getHooks(compilation).alterAssetTags;

      hooks.tapAsync(name, (htmlPluginData, callback) => {
        // @ts-ignore
        const { tags }: { tags: Tag[] } = htmlPluginData.plugin.userOptions;

        const tagsInInstance = mapping(tags);

        const maps: Map<MergeTagParent, MergeTag[]> = new Map([
          [
            'meta',
            tagsInInstance.filter(
              ({ tagName, attributes: { rel = '' } = {} }) =>
                tagName === 'meta' ||
                (tagName === 'link' && rel !== 'stylesheet'),
            ),
          ],
          [
            'styles',
            tagsInInstance.filter(
              ({ tagName, attributes: { rel = '' } = {} }) =>
                tagName === 'style' ||
                (tagName === 'link' && rel === 'stylesheet'),
            ),
          ],
          [
            'scripts',
            tagsInInstance.filter(({ tagName }) => tagName === 'script'),
          ],
        ]);

        for (const [parent, value] of maps.entries()) {
          const prepends = value
            .filter(({ prepend }) => prepend)
            .map(({ prepend, ...rest }) => rest);

          if (prepends.length > 0) {
            htmlPluginData.assetTags[parent].unshift(...prepends);
          }

          const appends = value
            .filter(({ prepend }) => !prepend)
            .map(({ prepend, ...rest }) => rest);

          if (appends.length > 0) {
            htmlPluginData.assetTags[parent].push(...appends);
          }
        }

        return callback(null, htmlPluginData);
      });
    });
  }
}
