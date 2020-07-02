import { ListPluginVersions } from 'flex-plugins-api-toolkit/dist/scripts';
import { flags } from '@oclif/command';

import { createDescription } from '../../../../utils/general';
import InformationFlexPlugin from '../../../../sub-commands/information-flex-plugin';
import FlexPlugin from '../../../../sub-commands/flex-plugin';

export default class FlexPluginsListPluginVersions extends InformationFlexPlugin<ListPluginVersions[]> {
  static description = createDescription('Lists the plugin versions on the account', false);

  static flags = {
    ...FlexPlugin.flags,
    name: flags.string({
      required: true,
      description: 'The plugin name to list its versions',
    }),
  };

  async getResource() {
    return this.pluginsApiToolkit.listPluginVersions({ name: this._flags.name });
  }

  notFound() {
    this._logger.info(`!!Plugin **${this._flags.name}** was not found.!!`);
  }

  print(versions: ListPluginVersions[]) {
    const list = this.sortByActive(versions);

    this.printHeader('Plugin Name', this._flags.name);
    if (list.length) {
      this.printHeader('Plugin SID', list[0].pluginSid);
    }
    this._logger.newline();

    this.printHeader('Versions');
    list.forEach((version) => {
      this.printVersion(version.version, version.isActive ? '(Active)' : '');
      this.printPretty(version, 'isActive', 'pluginSid', 'version');
      this._logger.newline();
    });
  }

  get _flags() {
    return this.parse(FlexPluginsListPluginVersions).flags;
  }
}