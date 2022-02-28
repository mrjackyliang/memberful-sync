import { jsonToGraphQLQuery } from 'json-to-graphql-query';
import _ from 'lodash';

import { getGravatarUrl } from './utilities';

/**
 * Parse Intercom contact payload.
 *
 * @param {object} memberfulMember - Memberful member.
 *
 * @returns {object}
 *
 * @since 1.0.0
 */
export function parseIntercomContactPayload(memberfulMember: object): object {
  const memberfulMemberAddressPostalCode = _.get(memberfulMember, 'address.postalCode', null);
  const memberfulMemberCreditCard = _.get(memberfulMember, 'creditCard');
  const memberfulMemberDiscordUserId = _.get(memberfulMember, 'discordUserId');
  const memberfulMemberDownloads = _.get(memberfulMember, 'downloads');
  const memberfulMemberEmail = _.get(memberfulMember, 'email');
  const memberfulMemberFullName = _.get(memberfulMember, 'fullName');
  const memberfulMemberId = _.get(memberfulMember, 'id');
  const memberfulMemberPhoneNumber = _.get(memberfulMember, 'phoneNumber');
  const memberfulMemberStripeCustomerId = _.get(memberfulMember, 'stripeCustomerId');
  const memberfulMemberSubscriptions = _.get(memberfulMember, 'subscriptions');
  const memberfulMemberTotalSpendCents = _.get(memberfulMember, 'totalSpendCents');
  const memberfulMemberUnrestrictedAccess = _.get(memberfulMember, 'unrestrictedAccess');

  return {
    role: 'user',
    external_id: memberfulMemberId,
    email: memberfulMemberEmail,
    phone: memberfulMemberPhoneNumber,
    name: memberfulMemberFullName,
    avatar: getGravatarUrl(memberfulMemberEmail),
    custom_attributes: {
      credit_card: parseMemberfulCreditCard(memberfulMemberCreditCard),
      discord_user_id: memberfulMemberDiscordUserId,
      downloads: parseMemberfulDownloads(memberfulMemberDownloads),
      last_updated: Math.floor(Date.now() / 1000),
      postal_code: memberfulMemberAddressPostalCode,
      stripe_customer_id: memberfulMemberStripeCustomerId,
      subscriptions: parseMemberfulSubscriptions(memberfulMemberSubscriptions),
      total_spend: parseMemberfulTotalSpend(memberfulMemberTotalSpendCents),
      unrestricted_access: memberfulMemberUnrestrictedAccess,
    },
  };
}

/**
 * Parse Intercom contact search query.
 *
 * @param {string} memberfulEmail - Memberful member email.
 * @param {string} memberfulId    - Memberful member id.
 *
 * @returns {object}
 *
 * @since 1.0.0
 */
export function parseIntercomContactSearchQuery(memberfulEmail: string, memberfulId: string): object {
  return {
    query: {
      operator: 'OR',
      value: [
        {
          operator: 'AND',
          value: [
            {
              field: 'role',
              operator: '=',
              value: 'user',
            },
            {
              field: 'email',
              operator: '=',
              value: memberfulEmail,
            },
          ],
        },
        {
          operator: 'AND',
          value: [
            {
              field: 'role',
              operator: '=',
              value: 'user',
            },
            {
              field: 'external_id',
              operator: '=',
              value: memberfulId,
            },
          ],
        },
      ],
    },
  };
}

/**
 * Parse Memberful credit card.
 *
 * @param {object|null} creditCard - CreditCard object.
 *
 * @returns {string|null}
 *
 * @since 1.0.0
 */
export function parseMemberfulCreditCard(creditCard: object | null): string | null {
  const brand = _.get(creditCard, 'brand');
  const expMonth = _.get(creditCard, 'expMonth');
  const expYear = _.get(creditCard, 'expYear');
  const lastFourDigits = _.get(creditCard, 'lastFourDigits');

  if (lastFourDigits) {
    const cardProperties = [];

    // If card expiration exists.
    if (expMonth && expYear) {
      cardProperties.push(`expiration: ${expMonth}/${expYear}`);
    }

    // If card brand exists.
    if (brand) {
      cardProperties.push(`brand: ${brand}`);
    }

    return `${lastFourDigits}${(!_.isEmpty(cardProperties)) ? ` (${cardProperties.join(', ')})` : ''}`;
  }

  return null;
}

/**
 * Parse Memberful downloads.
 *
 * @param {object[]} downloads - Downloads object.
 *
 * @returns {string|null}
 *
 * @since 1.0.0
 */
export function parseMemberfulDownloads(downloads: object[]): string | null {
  if (!_.isEmpty(downloads)) {
    return _.map(downloads, (download) => _.get(download, 'name', 'Unknown')).join(', ');
  }

  return null;
}

/**
 * Parse Memberful GraphQL "members" query.
 *
 * @param {string|undefined} after - MemberConnection after cursor.
 *
 * @returns {string}
 *
 * @since 1.0.0
 */
export function parseMemberfulGraphqlMembersQuery(after?: string): string {
  const query = {
    query: {
      members: {
        __args: {
          ...(after) ? { after } : {},
        },
        nodes: {
          address: {
            city: true,
            country: true,
            postalCode: true,
            state: true,
            street: true,
          },
          creditCard: {
            brand: true,
            expMonth: true,
            expYear: true,
            lastFourDigits: true,
          },
          discordUserId: true,
          downloads: {
            id: true,
            name: true,
          },
          email: true,
          fullName: true,
          id: true,
          metadata: true,
          phoneNumber: true,
          stripeCustomerId: true,
          subscriptions: {
            activatedAt: true,
            active: true,
            additionalMembers: true,
            autorenew: true,
            coupon: {
              code: true,
              id: true,
            },
            createdAt: true,
            expiresAt: true,
            id: true,
            pastDue: true,
            plan: {
              id: true,
              name: true,
            },
            trialEndAt: true,
            trialStartAt: true,
          },
          totalSpendCents: true,
          trackingParams: true,
          unrestrictedAccess: true,
        },
        pageInfo: {
          startCursor: true,
          endCursor: true,
          hasPreviousPage: true,
          hasNextPage: true,
        },
      },
    },
  };

  return jsonToGraphQLQuery(query);
}

/**
 * Parse Memberful GraphQL "memberUpdate" mutation.
 *
 * @param {string} id       - Member id.
 * @param {string} metadata - Member metadata.
 *
 * @returns {string}
 *
 * @since 1.0.0
 */
export function parseMemberfulGraphqlMemberUpdateMutation(id: string, metadata: object): string {
  const mutation = {
    mutation: {
      memberUpdate: {
        __args: {
          id,
          metadata,
        },
        member: {
          id: true,
          metadata: true,
        },
      },
    },
  };

  return jsonToGraphQLQuery(mutation);
}

/**
 * Parse Memberful subscriptions.
 *
 * @param {object[]} subscriptions - Array of subscriptions.
 *
 * @returns {string|null}
 *
 * @since 1.0.0
 */
export function parseMemberfulSubscriptions(subscriptions: object[]): string | null {
  if (!_.isEmpty(subscriptions)) {
    return _.map(subscriptions, (subscription) => {
      const planProperties = [];
      const active = _.get(subscription, 'active');
      const autoRenew = _.get(subscription, 'autorenew');
      const couponCode = _.get(subscription, 'coupon.code');
      const pastDue = _.get(subscription, 'pastDue');
      const planName = _.get(subscription, 'plan.name', 'Unknown');

      // If plan has "active".
      if (active !== undefined) {
        planProperties.push(`active: ${(active === true) ? 'yes' : 'no'}`);
      }

      // If plan has "auto-renew".
      if (autoRenew !== undefined) {
        planProperties.push(`auto renew: ${(autoRenew === true) ? 'on' : 'off'}`);
      }

      // If plan is past due.
      if (pastDue !== undefined) {
        planProperties.push(`past due: ${(pastDue === true) ? 'yes' : 'no'}`);
      }

      // If plan has coupon applied.
      if (couponCode !== undefined) {
        planProperties.push(`coupon: ${couponCode}`);
      }

      return `${planName}${(!_.isEmpty(planProperties) ? ` (${planProperties.join(', ')})` : '')}`;
    }).join(', ');
  }

  return null;
}

/**
 * Parse Memberful total spend.
 *
 * @param {number} cents - Total spent in cents.
 *
 * @returns {number}
 *
 * @since 1.0.0
 */
export function parseMemberfulTotalSpend(cents: number): number {
  if (cents === 0) {
    return 0;
  }

  return cents / 100;
}
