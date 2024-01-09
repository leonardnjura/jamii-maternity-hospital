import { lnoApiKeySysOps } from '../config';
import { IUserData } from '../data/types';
import { createUserCookie, loadUsers } from '../lib/get-users';

export async function getLocalSearchResultsUsers(q: string) {
  // Creates a regex search pattern for a case insensitive match from the user's query term, q
  const searchPattern = new RegExp(q, 'i');

  let filteredResults: IUserData[] = [];

  console.log('lnoApiKeySysOps', lnoApiKeySysOps);

  let dbUsers: IUserData[] = await loadUsers(lnoApiKeySysOps!);

  console.log('dbUsers', dbUsers);

  if (dbUsers) {
    filteredResults = dbUsers.filter((result) => {
      return (
        searchPattern.test(result.firstName!) ||
        searchPattern.test(result.lastName!) ||
        searchPattern.test(result.email!)
      );
    });
  }

  return filteredResults;
}
