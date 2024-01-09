import { lnoApiKeySysOps, server } from '../config';
import { stripFields } from '../data/my-schemas';
import { IUserData } from '../data/types';

export async function loadUsers(
  lnoApiKey: string,
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    /**Auth*/
    const res = await fetch(`${server}/api/users`, {
      headers: {
        'Content-Type': 'application/json',
        CrudKey: lnoApiKey,
      },
    });
    //**pure res or processed to tsobj*/
    if (!returnProcessedData) return res;

    let rawData = await res.json();

    if (excludeFields != null) {
      return JSON.parse(stripFields(rawData['data'], excludeFields));
    }
    return rawData['data'];
  } catch (e) {
    console.log(`!!Oops on loadUsers():: ${e}`);
    return null;
  }
}

export async function loadUsers_Midwives(
  lnoApiKey: string,
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    /**Auth*/
    const res = await fetch(`${server}/api/users?midwives=true`, {
      headers: {
        'Content-Type': 'application/json',
        CrudKey: lnoApiKey,
      },
    });
    //**pure res or processed to tsobj*/
    if (!returnProcessedData) return res;

    let rawData = await res.json();

    if (excludeFields != null) {
      return JSON.parse(stripFields(rawData['data'], excludeFields));
    }
    return rawData['data'];
  } catch (e) {
    console.log(`!!Oops on loadUsers_Midwives():: ${e}`);
    return null;
  }
}

export async function loadUsers_WithAssignments(
  lnoApiKey: string,
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    /**Auth*/
    const res = await fetch(
      `${server}/api/users?assignments=true&midwives=true`,
      {
        headers: {
          'Content-Type': 'application/json',
          CrudKey: lnoApiKey,
        },
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
    console.log(`!!Oops on loadUsers_WithAssignments():: ${e}`);
    return null;
  }
}

export async function loadUsers_MidwivesWithAssignments(
  lnoApiKey: string,
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    /**Auth*/
    const res = await fetch(
      `${server}/api/users?assignments=true&midwives=true`,
      {
        headers: {
          'Content-Type': 'application/json',
          CrudKey: lnoApiKey,
        },
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
    console.log(`!!Oops on loadUsers_MidwivesWithAssignments():: ${e}`);
    return null;
  }
}

export async function loadOneUser(
  itemId: string,
  lnoApiKey: string,
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    /**Auth*/
    const res = await fetch(`${server}/api/users/${itemId}`, {
      headers: {
        'Content-Type': 'application/json',
        CrudKey: lnoApiKey,
      },
    });
    //**pure res or processed to tsobj*/
    if (!returnProcessedData) return res;

    let rawData = await res.json();

    if (excludeFields != null) {
      return JSON.parse(stripFields(rawData['data'], excludeFields));
    }
    return rawData['data'];
  } catch (e) {
    console.log(`!!Oops on loadOneUser():: ${e}`);
    return null;
  }
}

export async function loadOneUserByEmail(
  email: string,
  lnoApiKey: string,
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    /**Auth*/
    const res = await fetch(`${server}/api/email`, {
      body: JSON.stringify({ email }),
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
    console.log(`!!Oops on loadOneUserByEmail():: ${e}`);
    return null;
  }
}

export async function signupUser(
  body: object,
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    const res = await fetch(`${server}/api/signup`, {
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
    console.log(`!!Oops on signupUser():: ${e}`);
    return null;
  }
}

export async function signupUserSkipKlaims(
  body: object,
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    const res = await fetch(`${server}/api/signup?skipKlaims=true`, {
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
    console.log(`!!Oops on signupUserSkipKlaims():: ${e}`);
    return null;
  }
}

export async function signinUser(
  body: object,
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    const res = await fetch(`${server}/api/signin`, {
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
    console.log(`!!Oops on signinUser():: ${e}`);
    return null;
  }
}

export async function createUserCookie(
  body: object,
  lnoApiKey: string,
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    const res = await fetch(`${server}/api/cookie`, {
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
    console.log(`!!Oops on createUserCookie():: ${e}`);
    return null;
  }
}

export async function deleteUserCookie(
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    /*SPECIAL*/
    const res = await fetch(`${server}/api/logout`, {
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
    console.log(`!!Oops on deleteUserCookie():: ${e}`);
    return null;
  }
}

export async function deleteUser(
  itemId: string,
  lnoApiKey: string,
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    /*SPECIAL*/
    const res = await fetch(`${server}/api/users/${itemId}`, {
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
    console.log(`!!Oops on deleteUser():: ${e}`);
    return null;
  }
}

export async function deleteUser_SelfAccountDeletion(
  email: string,
  lnoApiKey: string,
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    /*GOOGLSPECIAL*/

    const res = await fetch(`${server}/api/logdeletedprofile`, {
      body: JSON.stringify({ email }),
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
    console.log(`!!Oops on deleteUser_SelfAccountDeletion():: ${e}`);
    return null;
  }
}

export async function updateUser(
  itemId: string,
  body: object,
  lnoApiKey: string,
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    const res = await fetch(`${server}/api/users/${itemId}`, {
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
    console.log(`!!Oops on updateUser():: ${e}`);
    return null;
  }
}

export async function updateUserProfilePictureUrl(
  userId: string,
  avatarUrl: string,
  lnoApiKey: string,
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    const res = await fetch(`${server}/api/updatefield_profileavatar`, {
      body: JSON.stringify({ userId, avatar: avatarUrl }),
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
    console.log(`!!Oops on updateUserProfilePictureUrl():: ${e}`);
    return null;
  }
}

export async function updateUserProfilePictureBase64(
  userId: string,
  base64FileData: any,
  lnoApiKey: string,
  returnProcessedData = true,
  excludeFields?: string[]
) {
  try {
    const res = await fetch(`${server}/api/updatefield_profileavatarbase64`, {
      body: JSON.stringify({ userId, file: base64FileData }),
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
    console.log(`!!Oops on updateUserProfilePictureBase64():: ${e}`);
    return null;
  }
}

export async function createUserCookieOauthUser(oauthUser: IUserData) {
  let cookiedUser: IUserData = {} as IUserData;

  if (oauthUser.email) {
    //[1.]
    //check if user exists in db
    const existingUserByEmail: IUserData = await loadOneUserByEmail(
      oauthUser.email,
      lnoApiKeySysOps!
    );

    if (existingUserByEmail) {
      //user exists

      let uid = existingUserByEmail._id;
      //[2.]
      const existingUserById: IUserData = await loadOneUser(
        uid!,
        lnoApiKeySysOps!
      );

      if (existingUserById) {
        //200
        cookiedUser = existingUserById;
        //cookies..
      }
    } else {
      //user does not exist

      console.log(`!!oauth user ${oauthUser.email} does not exist`);
      const newUserBySignup: IUserData = await signupUser(oauthUser);
      if (newUserBySignup) {
        //201
        cookiedUser = newUserBySignup;
        //cookies..
      }
    }
  }

  const resBodyCookie = await createUserCookie(cookiedUser, lnoApiKeySysOps!);

  return cookiedUser;
}
