import { server } from '../config';
import { stripFields } from '../data/my-schemas';

/**CLIENTLIST - CRUD */
export async function addOneItemToUserClientList(
  userId: string,
  body: object,
  lnoApiKey: string,
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    const res = await fetch(`${server}/api/users/${userId}/clientlist`, {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        CrudKey: lnoApiKey,
      },
      method: 'POST',
    });
    //**pure res or processed to tsobj*/
    if (!returnProcessedData) return res;

    let rawData = await res.json();

    if (excludeFields != null) {
      return JSON.parse(stripFields(rawData['data'], excludeFields));
    }
    return rawData['data'];
  } catch (e) {
    console.log(`!!ayayai on addOneItemToUserClientList():: ${e}`);
    return null;
  }
}

export async function updateOneItemFromUserClientList(
  userId: string,
  itemId: string,
  body: object,
  lnoApiKey: string,
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    const res = await fetch(
      `${server}/api/users/${userId}/clientlist/${itemId}`,
      {
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          CrudKey: lnoApiKey,
        },
        method: 'PUT',
      }
    );
    //**pure res or processed to tsobj*/
    if (!returnProcessedData) return res;

    let rawData = await res.json();

    if (excludeFields != null) {
      return JSON.parse(stripFields(rawData['data'], excludeFields));
    }
    return rawData['data'];
  } catch (e) {
    console.log(`!!ayayai on updateOneItemFromUserClientList():: ${e}`);
    return null;
  }
}

export async function loadClientList(
  userId: string,
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    const res = await fetch(`${server}/api/users/${userId}/clientlist`);
    //**pure res or processed to tsobj*/
    if (!returnProcessedData) return res;

    let rawData = await res.json();

    if (excludeFields != null) {
      return JSON.parse(stripFields(rawData['data'], excludeFields));
    }
    return rawData['data'];
  } catch (e) {
    console.log(`!!ayayai on loadClientList():: ${e}`);
    return null;
  }
}

export async function loadOneItemFromClientList(
  userId: string,
  itemId: string,
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    const res = await fetch(
      `${server}/api/users/${userId}/clientlist/${itemId}`
    );
    //**pure res or processed to tsobj*/
    if (!returnProcessedData) return res;

    let rawData = await res.json();

    if (excludeFields != null) {
      return JSON.parse(stripFields(rawData['data'], excludeFields));
    }
    return rawData['data'];
  } catch (e) {
    console.log(`!!ayayai on loadOneItemFromClientList():: ${e}`);
    return null;
  }
}

export async function deleteOneItemFromClientList(
  userId: string,
  itemId: string,
  lnoApiKey: string,
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    /*SPECIAL*/
    const res = await fetch(
      `${server}/api/users/${userId}/clientlist/${itemId}`,
      {
        headers: {
          CrudKey: lnoApiKey,
        },
        method: 'DELETE',
      }
    );
    //**pure res or processed to tsobj*/
    if (!returnProcessedData) return res;

    let rawData = null;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      rawData = await res.json();
    } else {
      rawData = await res.text();
    }

    if (excludeFields != null) {
      return JSON.parse(stripFields(rawData['data'], excludeFields));
    }
    return rawData['data'];
  } catch (e) {
    console.log(`!!ayayai on deleteOneItemFromClientList():: ${e}`);
    return null;
  }
}

export async function transferOneItemFromUserClientList(
  userId: string,
  itemId: string,
  receivingMidwifeId: string,
  lnoApiKey: string,
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    const res = await fetch(
      `${server}/api/users/${userId}/clientlist/${itemId}/transfer`,
      {
        body: JSON.stringify({ receivingMidwifeId }),
        headers: {
          'Content-Type': 'application/json',
          CrudKey: lnoApiKey,
        },
        method: 'POST',
      }
    );
    //**pure res or processed to tsobj*/
    if (!returnProcessedData) return res;

    let rawData = await res.json();

    if (excludeFields != null) {
      return JSON.parse(stripFields(rawData['data'], excludeFields));
    }
    return rawData['data'];
  } catch (e) {
    console.log(`!!ayayai on transferOneItemFromUserClientList():: ${e}`);
    return null;
  }
}
