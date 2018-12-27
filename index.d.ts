
export = cleanupPlugin

declare function cleanupPlugin (options?: cleanupPlugin.Options): import('rollup').Plugin

// tslint:disable-next-line:no-namespace
declare namespace cleanupPlugin {

  interface Options {
    /**
     * Determinates which comments must be preserved.
     * @default ['some']
     */
    comments?: string | RegExp | Array<string | RegExp>
    /**
     * Should js-cleanup also compact whitespace and blank lines
     * in the preserved multiline comments?
     *
     * Line-ending normalization is always done.
     * @default true
     */
    compactComments?: boolean
    /**
     * Type of Line-ending for normalization.
     * @default 'unix'
     */
    lineEndings?: 'unix' | 'mac' | 'win'
    /**
     * Maximum successive empty lines to preserve in the output.
     *
     * Use a positive value, or `-1` to keep all the lines.
     * @default 0
     */
    maxEmptyLines?: number
    /**
     * Should generate a sourcemap?
     * @default true
     */
    sourcemap?: boolean
    /**
     * minimatch or array of minimatch patterns for paths to include in the process.
     * @see https://github.com/isaacs/minimatch
     */
    include?: string | string[]
    /**
     * minimatch or array of minimatch patterns for paths to exclude of the process.
     * @see https://github.com/isaacs/minimatch
     */
    exclude?: string | string[]
    /**
     * String or array of strings with extensions of files to process.
     * @default ['js','jsx','tag']
     */
    extensions?: string | string[]
  }
}
