import chalk from 'chalk';
import gravatar from 'gravatar';
import _ from 'lodash';
import { DateTime } from 'luxon';

import config from '../../config.json';

import { LogMessagePriority } from '../types';

/**
 * Generate log message.
 *
 * @param {string}             message  - Message to log.
 * @param {LogMessagePriority} priority - Can be 10 (error), 20 (warn), 30 (info), or 40 (debug).
 * @param {unknown}            error    - The response or error object.
 *
 * @since 1.0.0
 */
export function generateLogMessage(message: string, priority: LogMessagePriority, error?: unknown): void {
  const logLevel = _.get(config, 'settings.log-level');
  const timeZone = _.get(config, 'settings.time-zone');
  const currentTime = DateTime.now().setZone(timeZone).toFormat('yyyy-MM-dd HH:mm:ss ZZZZ');
  const responseData = _.get(error, 'response.data');

  if (logLevel >= priority) {
    // Messages will not be logged if priority is wrong.
    switch (priority) {
      case 10:
        console.error(`${currentTime} - ${chalk.red('ERROR')} - ${message} ...`);

        // Parse API response.
        if (_.isPlainObject(responseData)) {
          console.error(responseData);
        }

        if (_.isError(error) && error.stack) {
          console.error(error.stack);
        }
        break;
      case 20:
        console.warn(`${currentTime} - ${chalk.yellow('WARN')} - ${message} ...`);

        // Parse API response.
        if (_.isPlainObject(responseData)) {
          console.warn(responseData);
        }

        if (_.isError(error) && error.stack) {
          console.warn(error.stack);
        }
        break;
      case 30:
        console.log(`${currentTime} - ${chalk.magenta('INFO')} - ${message} ...`);

        // Parse API response.
        if (_.isPlainObject(responseData)) {
          console.log(responseData);
        }

        if (_.isError(error) && error.stack) {
          console.log(error.stack);
        }
        break;
      case 40:
        console.debug(`${currentTime} - ${chalk.gray('DEBUG')} - ${message} ...`);

        // Parse API response.
        if (_.isPlainObject(responseData)) {
          console.debug(responseData);
        }

        if (_.isError(error) && error.stack) {
          console.debug(error.stack);
        }
        break;
      default:
        break;
    }
  }
}

/**
 * Generate server message.
 *
 * @param {string}  message  - Message to log.
 * @param {boolean} failed   - If error related.
 * @param {number}  exitCode - Exit code.
 *
 * @since 1.0.0
 */
export function generateServerMessage(message: string, failed: boolean, exitCode?: number): void {
  const consoleMessage = [
    ...(failed) ? [chalk.red('Server failed to start!')] : [],
    message,
    '...',
  ].join(' ');

  if (failed) {
    console.error(consoleMessage);
  } else {
    console.log(consoleMessage);
  }

  // Kills the process with an exit code.
  if (_.isFinite(exitCode)) {
    process.exit(exitCode);
  }
}

/**
 * Get Gravatar url.
 *
 * @param {string} emailAddress - Email address.
 *
 * @returns {string}
 *
 * @since 1.0.0
 */
export function getGravatarUrl(emailAddress: string) {
  return gravatar.url(
    emailAddress,
    {
      size: '2048',
      rating: 'x',
      default: 'mp',
    },
    true,
  );
}
