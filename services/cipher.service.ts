const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
import cookie from 'cookie';
import { verify } from 'jsonwebtoken';

import { sign } from 'jsonwebtoken';
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { JWT_CLAIMS_DURATION, TOKEN_MAX_AGE } from '../config';
import { IUserData } from '../data/types';
import { secret } from '../pages/api/secret';
import { utf8_to_b64 } from '../utils/preops';

const SALT_ROUNDS = 10;
const DEFAULT_ROLE_ID = '0';

async function generateUuidHash() {
  return uuidv4();
}

async function generatePasswordHash(plaintextPassword: string) {
  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  return bcrypt.hashSync(plaintextPassword, salt);
}

async function checkPassword(
  allegedPlaintextPassword: string,
  dbPasswordHash: string
) {
  return await bcrypt.compare(allegedPlaintextPassword, dbPasswordHash);
}

async function signClaims(user: IUserData, res: NextApiResponse) {
  //api
  //todo: refresh cookie?
  //claims may not have fufu and lulu and avatar but must have email and roleId

  const {
    _id,
    email,
    password,
    roleId,
    firstName,
    lastName,
    avatar,
    freemiumTokenExpiry,
  } = user;

  let safeAvatar = avatar;
  if (user.avatar) {
    safeAvatar = utf8_to_b64(user.avatar);
    // let safeAvatarReversed = b64_to_utf8(safeAvatar);
    // console.log(`\n\n!!safeAvatar`, safeAvatar);
    // console.log(`\n\n!!safeAvatarReversed`, safeAvatarReversed);
    // console.log(`\n\n`)
  }

  //note: we use claims in jwt to authenticate and set ui state.. ensure endpoint calling this fucntion passes all needed fields as destructured above

  const claims = {
    //not same as user obj, has one-liners, :)
    _id,
    email,
    password,
    roleId: roleId ?? DEFAULT_ROLE_ID, //if roleId is null, jwt will show field with fallback value
    firstName,
    lastName,
    avatar: safeAvatar,
    freemiumTokenExpiry, //N days set upon signup[stage called free, :(], updated via open promotional window[free], seasons greetings[free], or by some paywall[stage called premium, :)] where expiry is set to lifetime or infinity whichever way the user wants to call it, :)
  };
  const jwt = sign(claims, secret, { expiresIn: JWT_CLAIMS_DURATION });

  res.setHeader(
    'Set-Cookie',
    cookie.serialize('auth', jwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: TOKEN_MAX_AGE,
      path: '/',
    })
  );
  return jwt; //redudant if cookies are used
}

async function deleteClaims(res: NextApiResponse) {
  //api
  res.setHeader('Set-Cookie', [
    cookie.serialize('auth', '', {
      expires: new Date(0),
      path: '/',
    }),
    cookie.serialize('refresh', '', {
      //todo:
      expires: new Date(0),
      path: '/',
    }),
  ]);
}

export const authenticate =
  (fn: NextApiHandler) => async (req: NextApiRequest, res: NextApiResponse) => {
    verify(req.cookies.auth!, secret, async function name(err, decoded) {
      if (!err && decoded) {
        return await fn(req, res);
      }

      res.status(401).json({ message: 'You are not authorized to do that' });
    });
  };

export const myCipherService = {
  generateUuidHash,
  generatePasswordHash,
  checkPassword,
  signClaims,
  deleteClaims,
  authenticate,
};
