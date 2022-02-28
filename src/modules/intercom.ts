import axios from 'axios';
import Bottleneck from 'bottleneck';
import _ from 'lodash';

import config from '../../config.json';

import { updateMemberfulMemberMetadata } from '../lib/api';
import { parseIntercomContactPayload, parseIntercomContactSearchQuery } from '../lib/data';
import { generateLogMessage } from '../lib/utilities';

/**
 * Configuration.
 *
 * @since 1.0.0
 */
const configIntercomAccessToken = _.get(config, 'intercom.access-token');

/**
 * Limiter.
 *
 * @since 1.0.0
 */
const intercomLimiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 250,
});

/**
 * Intercom contact create.
 *
 * @param {object} memberfulMember - Memberful member.
 *
 * @returns {Promise<boolean[]>}
 *
 * @since 1.0.0
 */
export function intercomContactCreate(memberfulMember: object): Promise<boolean[]> {
  return intercomLimiter.schedule(() => axios.post('https://api.intercom.io/contacts', parseIntercomContactPayload(memberfulMember), {
    headers: {
      Authorization: `Bearer ${configIntercomAccessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })).then((response) => {
    const memberfulMemberId = _.get(response, 'data.external_id');
    const intercomContactId = _.get(response, 'data.id');

    generateLogMessage(
      [
        'Successfully created contact',
        `(function: intercomContactCreate, memberful member id: ${memberfulMemberId}, intercom contact id: ${intercomContactId})`,
      ].join(' '),
      40,
    );

    return Promise.all(
      [
        true,
        // Update memberful member.
        updateMemberfulMemberMetadata(memberfulMemberId, { intercomId: intercomContactId }),
      ],
    );
  }).catch((error) => {
    const memberfulMemberId = _.get(memberfulMember, 'id');

    generateLogMessage(
      [
        'Failed to create contact',
        `(function: intercomContactCreate, memberful member id: ${memberfulMemberId})`,
      ].join(' '),
      10,
      error,
    );

    return [false, false];
  });
}

/**
 * Intercom contact update.
 *
 * @param {string} intercomContactId - Intercom contact id.
 * @param {object} memberfulMember   - Memberful member.
 *
 * @returns {Promise<boolean>}
 *
 * @since 1.0.0
 */
export function intercomContactUpdate(intercomContactId: string, memberfulMember: object): Promise<boolean> {
  return intercomLimiter.schedule(() => axios.put(`https://api.intercom.io/contacts/${intercomContactId}`, parseIntercomContactPayload(memberfulMember), {
    headers: {
      Authorization: `Bearer ${configIntercomAccessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })).then(() => {
    generateLogMessage(
      [
        'Successfully updated contact',
        `(function: intercomContactUpdate, intercom contact id: ${intercomContactId})`,
      ].join(' '),
      40,
    );

    return true;
  }).catch((error) => {
    generateLogMessage(
      [
        'Failed to update contact',
        `(function: intercomContactUpdate, intercom contact id: ${intercomContactId}, memberful member: ${JSON.stringify(memberfulMember)})`,
      ].join(' '),
      10,
      error,
    );

    return false;
  });
}

/**
 * Intercom sync.
 *
 * @param {object[]} memberfulMembers - Memberful members.
 *
 * @returns {Promise<(boolean|(boolean|boolean[])[])[]>}
 *
 * @since 1.0.0
 */
export function intercomSync(memberfulMembers: object[]): Promise<(boolean | (boolean | boolean[])[])[]> {
  return Promise.all(
    _.map(memberfulMembers, (memberfulMember) => {
      const memberfulMemberEmail = _.get(memberfulMember, 'email');
      const memberfulMemberId = _.get(memberfulMember, 'id');
      const memberfulMemberMetadataIntercomId = _.get(memberfulMember, 'metadata.intercomId');

      // If Memberful member does not have Intercom ID saved.
      if (memberfulMemberMetadataIntercomId === undefined) {
        return intercomLimiter.schedule(() => axios.post('https://api.intercom.io/contacts/search', parseIntercomContactSearchQuery(memberfulMemberEmail, memberfulMemberId), {
          headers: {
            Authorization: `Bearer ${configIntercomAccessToken}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        })).then((response) => {
          const jobs: Promise<boolean | boolean[]>[] = [];
          const totalCount = _.get(response, 'data.total_count');

          generateLogMessage(
            [
              'Successfully queried search results',
              `(function: intercomSync, memberful member id: ${memberfulMemberId}, total count: ${totalCount})`,
            ].join(' '),
            40,
          );

          // If Intercom contact exists.
          if (totalCount === 1) {
            const intercomContactId = _.get(response, 'data.data[0].id');

            // Update Intercom contact.
            jobs.push(intercomContactUpdate(intercomContactId, memberfulMember));

            // Update Memberful member.
            jobs.push(updateMemberfulMemberMetadata(memberfulMemberId, {
              intercomId: intercomContactId,
            }));
          } else {
            // Create Intercom contact.
            jobs.push(intercomContactCreate(memberfulMember));
          }

          return Promise.all(jobs).then((results) => results);
        }).catch((error) => {
          generateLogMessage(
            [
              'Failed to query search results',
              `(function: intercomSync, memberful member id: ${memberfulMemberId})`,
            ].join(' '),
            10,
            error,
          );

          return false;
        });
      }

      // Update Intercom contact.
      return intercomContactUpdate(memberfulMemberMetadataIntercomId, memberfulMember);
    }),
  );
}
