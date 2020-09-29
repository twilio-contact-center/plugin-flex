import { Logger, singleLineString, boxen, coloredStrings } from 'flex-plugins-utils-logger';
import { DeployResult } from 'flex-plugin-scripts/dist/scripts/deploy';

import { createConfiguration as createConfigurationDocs } from '../commandDocs.json';
import { getDefaultConfigurationName } from '../sub-commands/create-configuration';

/**
 * Prints the successful message of a plugin deployment
 */
export const deploySuccessful = (logger: Logger) => (
  name: string,
  availability: string,
  deployedData: DeployResult,
) => {
  logger.newline();
  logger.success(
    `🚀 Plugin (${availability}) **${name}**@**${deployedData.nextVersion}** was successfully deployed using Plugins API`,
  );
  logger.newline();

  // update this description
  logger.info('**Next Steps:**');
  logger.info(
    singleLineString(
      'Run {{$ twilio flex:plugins:release',
      `\\-\\-plugin ${name}@${deployedData.nextVersion}`,
      `\\-\\-name "${getDefaultConfigurationName()}"`,
      `\\-\\-description "${createConfigurationDocs.defaults.description}"}}`,
      'to enable this plugin on your flex instance',
    ),
  );
  logger.newline();
};

/**
 * Warns about having legacy plugins
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const warnHasLegacy = (logger: Logger) => () => {
  const cmd = coloredStrings.code('$ twilio flex:plugins:upgrade-plugin --remove-legacy-plugin');
  boxen.warning(`You have a legacy bundle of this plugin. Remove it by running ${cmd}`);
};

export default (logger: Logger) => ({
  deploySuccessful: deploySuccessful(logger),
  warnHasLegacy: warnHasLegacy(logger),
});
