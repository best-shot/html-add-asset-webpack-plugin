import HtmlWebpackPlugin, { HtmlTagObject } from 'html-webpack-plugin';
import type { JSONSchema7 } from 'json-schema';
import { validate } from 'schema-utils';
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

type Item = string | Tag;

function mapping(externals: Item[] = []): MergeTag[] {
  return externals.map((item) => {
    if (typeof item === 'string') {
      const common = {
        voidTag: false,
        prepend: true,
        meta: {
          plugin: name,
        },
      };

      if (/\.js/.test(item)) {
        return {
          tagName: 'script',
          attributes: {
            integrity: null,
            src: item,
          },
          ...common,
        };
      }

      if (/\.css/.test(item)) {
        return {
          tagName: 'link',
          attributes: {
            integrity: null,
            rel: 'stylesheet',
            href: item,
          },
          ...common,
        };
      }

      return {
        tagName: 'meta',
        attributes: {
          integrity: null,
          name: 'unknown',
          content: item,
        },
        ...common,
      };
    }

    // @ts-ignore
    const {
      tagName,
      attributes = {},
      innerHTML,
      voidTag = false,
      prepend = true,
    }: Tag = item;

    return {
      tagName,
      attributes: {
        integrity: null,
        ...attributes,
      },
      innerHTML,
      voidTag,
      prepend,
      meta: {
        plugin: name,
      },
    };
  });
}

type MergeTagParent = 'meta' | 'scripts' | 'styles';

const schema: JSONSchema7 = {
  type: 'object',
  properties: {
    tags: {
      type: 'array',
      items: {
        oneOf: [
          {
            type: 'string',
            pattern: '\\.(j|cs)s',
          },
          {
            type: 'object',
            required: ['tagName'],
            additionalProperties: false,
            properties: {
              tagName: {
                type: 'string',
                minLength: 1,
              },
              attributes: {
                type: 'object',
                minProperties: 1,
              },
              innerHTML: {
                type: 'string',
              },
              voidTag: {
                type: 'boolean',
              },
              prepend: {
                type: 'boolean',
              },
            },
          },
        ],
      },
    },
  },
};

export class HtmlAddAssetWebpackPlugin {
  // eslint-disable-next-line class-methods-use-this
  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap(name, (compilation: Compilation) => {
      const hooks = HtmlWebpackPlugin.getHooks(compilation).alterAssetTags;

      hooks.tapAsync(name, (htmlPluginData, callback) => {
        // @ts-ignore
        const { tags = [] }: { tags: Tag[] } =
          htmlPluginData.plugin.userOptions;

        if (tags.length > 0) {
          validate(
            schema,
            { tags },
            {
              name: 'HtmlAddAssetWebpackPlugin',
              baseDataPath: 'HtmlWebpackPlugin.options',
            },
          );

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
        }

        return callback(null, htmlPluginData);
      });
    });
  }
}
