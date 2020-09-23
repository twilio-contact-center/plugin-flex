import { progress } from 'flex-plugins-utils-logger';
import { flags } from '@oclif/command';

import { createDescription } from '../../../utils/general';
import { ConfigData, SecureStorage } from '../../../sub-commands/flex-plugin';
import CreateConfiguration from '../../../sub-commands/create-configuration';
import { createConfiguration as createConfigurationDocs, release as releaseDocs } from '../../../commandDocs.json';

/*
 * --description is required if you are creating a configuration and release in one step
 * however, if the configuration-sid is provided, this is no longer required and in fact should throw an error
 */

/**
 * Creates a Flex Plugin Configuration and releases and sets it to active
 */
export default class FlexPluginsRelease extends CreateConfiguration {
  static description = createDescription(releaseDocs.description, false);

  public static flags = {
    ...CreateConfiguration.flags,
    'configuration-sid': flags.string({
      description: releaseDocs.flags.configurationSid,
      exclusive: ['description', 'name', 'new', 'plugin'],
    }),
    // Duplicated to remove the required field
    plugin: flags.string({
      description: createConfigurationDocs.flags.plugin,
      multiple: true,
    }),
  };

  constructor(argv: string[], config: ConfigData, secureStorage: SecureStorage) {
    super(argv, config, secureStorage, { strict: false, runInDirectory: false });

    this.scriptArgs = [];
  }

  /**
   * @override
   */
  async doRun() {
    if (this._flags['configuration-sid'] && !this._flags.plugin) {
      await this.doCreateRelease(this._flags['configuration-sid']);
    } else {
      const config = await super.doCreateConfiguration();
      await this.doCreateRelease(config.sid);
    }
  }

  async doCreateRelease(configurationSid: string) {
    await progress(
      `Enabling configuration **${configurationSid}**`,
      async () => this.createRelease(configurationSid),
      false,
    );

    this._logger.newline();
    this._logger.success(`🚀 Configuration **${configurationSid}** was successfully enabled`);
    this._logger.newline();
  }

  /**
   * Registers a configuration with Plugins API
   * @returns {Promise}
   */
  async createRelease(configurationSid: string) {
    return this.pluginsApiToolkit.release({ configurationSid });
  }

  get _flags() {
    return this.parse(FlexPluginsRelease).flags;
  }
}
