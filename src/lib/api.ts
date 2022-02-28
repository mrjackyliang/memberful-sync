import axios from 'axios';
import _ from 'lodash';

import config from '../../config.json';

import { parseMemberfulGraphqlMembersQuery, parseMemberfulGraphqlMemberUpdateMutation } from './data';
import { generateLogMessage } from './utilities';

/**
 * Configuration.
 *
 * @since 1.0.0
 */
const configSettingsMemberfulApiKey = _.get(config, 'settings.memberful-api-key');
const configSettingsMemberfulSubdomain = _.get(config, 'settings.memberful-subdomain');

/**
 * Get Memberful members.
 *
 * @param {string|undefined} afterThisCursor - Start next query after this cursor.
 * @param {object[]}         members         - Members storage.
 *
 * @returns Promise<object[]>
 *
 * @since 1.0.0
 */
export function getMemberfulMembers(afterThisCursor?: string, members: object[] = []): Promise<object[]> {
  return axios.post(`https://${configSettingsMemberfulSubdomain}.memberful.com/api/graphql`, {
    query: parseMemberfulGraphqlMembersQuery(afterThisCursor),
  }, {
    headers: {
      Authorization: `Bearer ${configSettingsMemberfulApiKey}`,
    },
  }).then((response) => {
    const newMembers = _.get(response, 'data.data.members.nodes');
    const startCursor = _.get(response, 'data.data.members.pageInfo.startCursor');
    const endCursor = _.get(response, 'data.data.members.pageInfo.endCursor');
    const hasPreviousPage = _.get(response, 'data.data.members.pageInfo.hasPreviousPage', false);
    const hasNextPage = _.get(response, 'data.data.members.pageInfo.hasNextPage', false);

    // Save all members into data.
    members.push(...newMembers);

    generateLogMessage(
      [
        'Successfully fetched members',
        `(function: getMemberfulMembers, fetched members: ${members.length}, start cursor: ${startCursor}, end cursor: ${endCursor}, has previous page: ${hasPreviousPage}, has next page: ${hasNextPage})`,
      ].join(' '),
      40,
    );

    // If there are more results.
    if (endCursor && hasNextPage === true) {
      return getMemberfulMembers(endCursor, members);
    }

    return members;
  }).catch((error) => {
    generateLogMessage(
      [
        'Failed to fetch members',
        `(function: getMemberfulMembers, fetched members: ${members.length}, after this cursor: ${afterThisCursor})`,
      ].join(' '),
      10,
      error,
    );

    // Return whatever is available.
    return members;
  });
}

/**
 * Update Memberful member metadata.
 *
 * @param {string} memberId       - Member id.
 * @param {object} memberMetadata - Member metadata.
 *
 * @returns Promise<boolean>
 *
 * @since 1.0.0
 */
export function updateMemberfulMemberMetadata(memberId: string, memberMetadata: object): Promise<boolean> {
  return axios.post(`https://${configSettingsMemberfulSubdomain}.memberful.com/api/graphql`, {
    query: parseMemberfulGraphqlMemberUpdateMutation(memberId, memberMetadata),
  }, {
    headers: {
      Authorization: `Bearer ${configSettingsMemberfulApiKey}`,
    },
  }).then((response) => {
    if (_.has(response, 'data.errors')) {
      throw response;
    }

    generateLogMessage(
      [
        'Successfully updated Memberful member metadata',
        `(function: updateMemberfulMemberMetadata, member id: ${memberId})`,
      ].join(' '),
      40,
    );

    return true;
  }).catch((error) => {
    generateLogMessage(
      [
        'Failed to update Memberful member metadata',
        `(function: updateMemberfulMemberMetadata, member id: ${memberId}, member metadata: ${JSON.stringify(memberMetadata)})`,
      ].join(' '),
      10,
      error,
    );

    return false;
  });
}
