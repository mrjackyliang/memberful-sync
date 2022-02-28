import _ from 'lodash';

/**
 * WordPress sync.
 *
 * @param {object[]} memberfulMembers - Memberful members.
 *
 * @since 1.0.0
 */
export function wordpressSync(memberfulMembers: object[]): Promise<(boolean|boolean[])[]> {
  return Promise.all(_.map(memberfulMembers, (memberfulMember) => {
    // TODO work in progress
    console.log(memberfulMember);

    return true;
  }));
}
