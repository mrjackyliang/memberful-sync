import chalk from 'chalk';
import _ from 'lodash';

import config from '../config.json';

import { generateServerMessage } from './lib/utilities';
import { initialize } from './modules/initialize';

/**
 * Configuration.
 *
 * @since 1.0.0
 */
const configSettingsTimeZone = _.get(config, 'settings.time-zone');
const configSettingsLogLevel = _.get(config, 'settings.log-level');
const configSettingsMemberfulApiKey = _.get(config, 'settings.memberful-api-key');
const configSettingsMemberfulSubdomain = _.get(config, 'settings.memberful-subdomain');

/**
 * Configuration pre-checks.
 *
 * @since 1.0.0
 */
if (
  (!_.isString(configSettingsTimeZone) || _.isEmpty(configSettingsTimeZone))
  || !_.includes([10, 20, 30, 40], configSettingsLogLevel)
) {
  if (!_.isString(configSettingsTimeZone) || _.isEmpty(configSettingsTimeZone)) {
    generateServerMessage('"settings.time-zone" is not configured', true, 1);
  }

  if (!_.includes([10, 20, 30, 40], configSettingsLogLevel)) {
    generateServerMessage('"settings.log-level" is not configured or is invalid', true, 1);
  }

  if (!_.isString(configSettingsMemberfulApiKey) || _.isEmpty(configSettingsMemberfulApiKey)) {
    generateServerMessage('"settings.memberful-api-key" is not configured', true, 1);
  }

  if (!_.isString(configSettingsMemberfulSubdomain) || _.isEmpty(configSettingsMemberfulSubdomain)) {
    generateServerMessage('"settings.memberful-subdomain" is not configured', true, 1);
  }
} else {
  generateServerMessage(
    [
      chalk.green('Server is ready!'),
      'Starting sync processes',
    ].join(' '),
    false,
  );

  /**
   * Initialize.
   *
   * @since 1.0.0
   */
  initialize();
}

/**
 * Capture signal interruption.
 *
 * @since 1.0.0
 */
process.on('SIGINT', () => {
  generateServerMessage('Stopping server', false, 0);
});
