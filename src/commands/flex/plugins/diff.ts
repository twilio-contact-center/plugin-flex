import { Difference } from 'flex-plugins-api-toolkit/dist/tools/diff';

import { createDescription } from '../../../utils/general';
import FlexPlugin, { ConfigData, SecureStorage } from '../../../sub-commands/flex-plugin';
import { TwilioCliError } from '../../../exceptions';
import { isNullOrUndefined } from '../../../utils/strings';

/**
 * Configuration sid parser
 * @param input the input from the CLI
 */
export const parser = (input: string) => {
  if (input === 'active') {
    return input;
  }

  if (!input || !input.startsWith('FJ')) {
    throw new TwilioCliError(`Identifier must of a ConfigurationSid instead got ${input}`);
  }

  return input;
};

/**
 * Builds and then deploys the Flex plugin
 */
export default class FlexPluginsDiff extends FlexPlugin {
  static pluginDiffPrefix = '..│.. ';

  static description = createDescription('Finds the diff between two configurations', false);

  static args = [
    {
      name: 'oldId',
      required: true,
      parse: parser,
    },
    {
      name: 'newId',
      required: true,
      arse: parser,
    },
  ];

  constructor(argv: string[], config: ConfigData, secureStorage: SecureStorage) {
    super(argv, config, secureStorage, { runInDirectory: false });
  }

  /**
   * @override
   */
  async doRun() {
    const diffs = await this.getDiffs();
    diffs.configuration.forEach((diff) => this.printDiff(diff));
    this._logger.newline();

    this.printHeader('Plugins');
    Object.keys(diffs.plugins).forEach((key) => {
      const isDeleted = diffs.plugins[key].every(
        (diff) => isNullOrUndefined(diff.after) && !isNullOrUndefined(diff.before),
      );
      const isAdded = diffs.plugins[key].every(
        (diff) => isNullOrUndefined(diff.before) && !isNullOrUndefined(diff.after),
      );
      if (isDeleted) {
        this._logger.info(`**--- ${key}--**`);
      } else if (isAdded) {
        this._logger.info(`**+++ ${key}++**`);
      } else {
        this._logger.info(`**${key}**`);
      }

      diffs.plugins[key].forEach((diff) => this.printDiff(diff, FlexPluginsDiff.pluginDiffPrefix));
      this._logger.newline();
    });
  }

  /**
   * Finds the diff
   */
  async getDiffs() {
    return this.pluginsApiToolkit.diff({
      resource: 'configuration',
      oldIdentifier: this._args.oldId,
      newIdentifier: this._args.newId,
    });
  }

  /**
   * Prints the diff
   * @param diff    the diff to print
   * @param prefix  the prefix to add to each entry
   */
  printDiff<T>(diff: Difference<T>, prefix: string = '') {
    const path = diff.path as string;
    const before = diff.before as string;
    const after = diff.after as string;

    const header = FlexPlugin.getHeader(path);
    if (diff.hasDiff) {
      if (before) {
        this._logger.info(`${prefix}--- ${header}: ${FlexPlugin.getValue(path, before)}--`);
      }
      if (after) {
        this._logger.info(`${prefix}+++ ${header}: ${FlexPlugin.getValue(path, after)}++`);
      }
    } else {
      this._logger.info(`${prefix}${header}: ${FlexPlugin.getValue(path, before)}`);
    }
  }

  /* istanbul ignore next */
  get _flags() {
    return this.parse(FlexPluginsDiff).flags;
  }

  /* istanbul ignore next */
  get _args() {
    return this.parse(FlexPluginsDiff).args;
  }
}
