import { SourceMapGenerator } from 'source-map'

import Warning, { WarningOptions } from './warning'
import { ProcessOptions } from './postcss'
import Processor from './processor'
import Root from './root'
import Node from './node'

export interface Message {
  /**
   * Message type.
   */
  type: string

  /**
   * Source PostCSS plugin name.
   */
  plugin: string

  [others: string]: any
}

export interface ResultOptions extends ProcessOptions {
  /**
   * The CSS node that was the source of the warning.
   */
  node?: Node

  /**
   * Name of plugin that created this warning. `Result#warn()` will fill it
   * automatically with plugin.postcssPlugin value.
   */
  plugin?: string
}

/**
 * Provides the result of the PostCSS transformations.
 *
 * A Result instance is returned by `LazyResult#then`
 * or `Root#toResult` methods.
 *
 * ```js
 * postcss([autoprefixer]).process(css).then(result => {
 *  console.log(result.css)
 * })
 * ```
 *
 * ```js
 * const result2 = postcss.parse(css).toResult()
 * ```
 */
export default class Result {
  /**
   * The Processor instance used for this transformation.
   *
   * ```js
   * for (const plugin of result.processor.plugins) {
   *   if (plugin.postcssPlugin === 'postcss-bad') {
   *     throw 'postcss-good is incompatible with postcss-bad'
   *   }
   * })
   * ```
   */
  processor: Processor

  /**
   * Contains messages from plugins (e.g., warnings or custom messages).
   * Each message should have type and plugin properties.
   *
   * ```js
   * postcss.plugin('postcss-min-browser', () => {
   *   return (root, result) => {
   *     const browsers = detectMinBrowsersByCanIUse(root)
   *     result.messages.push({
   *       type: 'min-browser',
   *       plugin: 'postcss-min-browser',
   *       browsers
   *     })
   *   }
   * })
   * ```
   */
  messages: Message[]

  /**
   * Root node after all transformations.
   *
   * ```js
   * root.toResult().root === root
   * ```
   */
  root: Root

  /**
   * Options from the `Processor#process` or `Root#toResult` call
   * that produced this Result instance.]
   *
   * ```js
   * root.toResult(opts).opts === opts
   * ```
   */
  opts: ResultOptions

  /**
   * A CSS string representing of `Result#root`.
   *
   * ```js
   * postcss.parse('a{}').toResult().css //=> "a{}"
   * ```
   */
  css: string

  /**
   * An instance of `SourceMapGenerator` class from the `source-map` library,
   * representing changes to the `Result#root` instance.
   *
   * ```js
   * result.map.toJSON() //=> { version: 3, file: 'a.css', … }
   * ```
   *
   * ```js
   * if (result.map) {
   *   fs.writeFileSync(result.opts.to + '.map', result.map.toString())
   * }
   * ```
   */
  map: SourceMapGenerator

  /**
   * @param processor Processor used for this transformation.
   * @param root      Root node after all transformations.
   * @param opts      Options from the `Processor#process` or `Root#toResult`.
   */
  constructor (processor: Processor, root: Root, opts: ResultOptions)

  /**
   * An alias for the `Result#css` property.
   * Use it with syntaxes that generate non-CSS output.
   *
   * ```js
   * result.css === result.content
   * ```
   */
  get content (): string

  /**
   * Returns for @{link Result#css} content.
   *
   * ```js
   * result + '' === result.css
   * ```
   *
   * @return String representing of `Result#root`.
   */
  toString (): string

  /**
   * Creates an instance of `Warning` and adds it to `Result#messages`.
   *
   * ```js
   * if (decl.important) {
   *   result.warn('Avoid !important', { node: decl, word: '!important' })
   * }
   * ```
   *
   * @param text Warning message.
   * @param opts Warning options.
   * @return Created warning.
   */
  warn (message: string, options?: WarningOptions): void

  /**
   * Returns warnings from plugins. Filters `Warning` instances
   * from `Result#messages`.
   *
   * ```js
   * result.warnings().forEach(warn => {
   *   console.warn(warn.toString())
   * })
   * ```
   *
   * @return Warnings from plugins.
   */
  warnings (): Warning[]
}