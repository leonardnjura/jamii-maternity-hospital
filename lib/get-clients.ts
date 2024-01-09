import { server } from '../config';
import { stripFields } from '../data/my-schemas';

/**CLIENTS  - CRUD */
export async function loadClients(
  lnoApiKey: string,
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    const res = await fetch(`${server}/api/clients`, {
      headers: {
        'Content-Type': 'application/json',
        CrudKey: lnoApiKey,
      },
      method: 'GET',
    });
    //**pure res or processed to tsobj*/
    if (!returnProcessedData) return res;

    let rawData = await res.json();

    if (excludeFields != null) {
      return JSON.parse(stripFields(rawData['data'], excludeFields));
    }
    return rawData['data'];
  } catch (e) {
    console.log(`!!ayayai on loadClients():: ${e}`);
    return null;
  }
}

export async function loadOneItemFromClients(
  itemId: string,
  lnoApiKey: string,
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    const res = await fetch(`${server}/api/clients/${itemId}`, {
      headers: {
        'Content-Type': 'application/json',
        CrudKey: lnoApiKey,
      },
      method: 'GET',
    });
    //**pure res or processed to tsobj*/
    if (!returnProcessedData) return res;

    let rawData = await res.json();

    if (excludeFields != null) {
      return JSON.parse(stripFields(rawData['data'], excludeFields));
    }
    return rawData['data'];
  } catch (e) {
    console.log(`!!ayayai on loadOneItemFromClients():: ${e}`);
    return null;
  }
}

export async function createClient(
  body: object,
  lnoApiKey: string,
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    const res = await fetch(`${server}/api/clients`, {
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
    console.log(`!!ayayai on createClient():: ${e}`);
    return null;
  }
}

export async function updateClient(
  itemId: string,
  body: object,
  lnoApiKey: string,
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    const res = await fetch(`${server}/api/clients/${itemId}`, {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        CrudKey: lnoApiKey,
      },
      method: 'PUT',
    });
    //**pure res or processed to tsobj*/
    if (!returnProcessedData) return res;

    let rawData = await res.json();

    if (excludeFields != null) {
      return JSON.parse(stripFields(rawData['data'], excludeFields));
    }
    return rawData['data'];
  } catch (e) {
    console.log(`!!ayayai on updateClient():: ${e}`);
    return null;
  }
}

export async function deleteOneItemFromClients(
  itemId: string,
  lnoApiKey: string,
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    /*SPECIAL*/
    const res = await fetch(`${server}/api/clients/${itemId}`, {
      headers: {
        CrudKey: lnoApiKey,
      },
      method: 'DELETE',
    });
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
    console.log(`!!ayayai on deleteOneItemFromClients():: ${e}`);
    return null;
  }
}
