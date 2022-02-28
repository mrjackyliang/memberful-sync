import _ from 'lodash';
import schedule from 'node-schedule';

import config from '../../config.json';

import { getMemberfulMembers } from '../lib/api';
import { generateLogMessage } from '../lib/utilities';
import { intercomSync } from './intercom';
import { wordpressSync } from './wordpress';

/**
 * Configuration.
 *
 * @since 1.0.0
 */
const configIntercomAccessToken = _.get(config, 'intercom.access-token');
const configWordpressApplicationPassword = _.get(config, 'wordpress.application-password');

/**
 * Initialize.
 *
 * @since 1.0.0
 */
export function initialize() {
  let isSyncing = false;

  schedule.scheduleJob('* * * * * *', async () => {
    // Only one instance is allowed.
    if (!isSyncing) {
      const jobs: Promise<(boolean | (boolean | boolean[])[])[]>[] = [];

      // Set syncing status to on.
      isSyncing = true;

      generateLogMessage(
        [
          'Sync started',
          '(function: initialize)',
        ].join(' '),
        30,
      );

      try {
        const members = await getMemberfulMembers();

        generateLogMessage(
          [
            'Successfully fetched all members',
            `(function: initialize, fetched members: ${members.length})`,
          ].join(' '),
          40,
        );

        // Pass members to Intercom sync.
        if (configIntercomAccessToken) {
          jobs.push(intercomSync(members));
        }

        // Pass members to WordPress sync.
        if (configWordpressApplicationPassword) {
          jobs.push(wordpressSync(members));
        }
      } catch (error) {
        generateLogMessage(
          [
            'Sync failed',
            '(function: initialize)',
          ].join(' '),
          10,
          error,
        );
      }

      Promise.all(jobs).then((results) => {
        const resultsTotal = _.flatten(results).length;
        const resultsSuccess = _.filter(_.flatten(results), (result) => result === true).length;
        const resultsFailed = _.filter(_.flatten(results), (result) => result === false).length;

        generateLogMessage(
          [
            'Sync completed',
            `(function: initialize, total jobs: ${resultsTotal}, succeeded jobs: ${resultsSuccess}, failed jobs: ${resultsFailed})`,
          ].join(' '),
          30,
        );

        // Set syncing status to off.
        isSyncing = false;
      });
    }
  });
}
