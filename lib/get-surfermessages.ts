import { server } from '../config';
import { stripFields } from '../data/my-schemas';

/**SURFERMESSAGES  - CRUD */
export async function loadSurferMessages(
  lnoApiKey: string, //protected conversation
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    const res = await fetch(`${server}/api/surfermessages`, {
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
    console.log(`!!ayayai on loadSurferMessages():: ${e}`);
    return null;
  }
}

export async function loadOneItemFromSurferMessages(
  itemId: string,
  lnoApiKey: string, //protected conversation
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    const res = await fetch(`${server}/api/surfermessages/${itemId}`, {
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
    console.log(`!!ayayai on loadOneItemFromSurferMessages():: ${e}`);
    return null;
  }
}

export async function createSurferMessage(
  body: object,
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    const res = await fetch(`${server}/api/surfermessages`, {
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
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
    console.log(`!!ayayai on createSurferMessage():: ${e}`);
    return null;
  }
}

export async function updateSurferMessage(
  itemId: string,
  body: object,
  lnoApiKey: string, //sys PUT on special fields eg, IS_MESSAGE_READ flag?
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    const res = await fetch(`${server}/api/surfermessages/${itemId}`, {
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
    console.log(`!!ayayai on updateSurferMessage():: ${e}`);
    return null;
  }
}

export async function updateSurferMessageStatus(
  surferMessageId: string,
  status: string,
  lnoApiKey: string,
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    const res = await fetch(`${server}/api/updatefield_surfermessagestatus`, {
      body: JSON.stringify({ surferMessageId, status }),
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
    console.log(`!!ayayai on updateSurferMessageStatus():: ${e}`);
    return null;
  }
}

export async function deleteOneItemFromSurferMessages(
  itemId: string,
  lnoApiKey: string,
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    /*SPECIAL*/
    const res = await fetch(`${server}/api/surfermessages/${itemId}`, {
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
    console.log(`!!ayayai on deleteOneItemFromSurferMessages():: ${e}`);
    return null;
  }
}
