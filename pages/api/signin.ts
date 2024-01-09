import { collection, getDocs, query } from 'firebase/firestore';

import { NextApiRequest, NextApiResponse } from 'next';
import { dbois } from '../../config/db';
import { validate } from '../../data/my-schemas';
import {
  IUserData,
  IUserDataOrCustomData,
  IUserLoginSchema,
} from '../../data/types';
import { myCipherService } from '../../services/cipher.service';
import { equalStrings_i, simpleErrorPlease } from '../../utils/preops';

interface IApiRequest extends NextApiRequest {
  body: {
    email: string;
    password: string;
  };
}

export default handler;

function handler(
  req: IApiRequest,
  res: NextApiResponse<IUserDataOrCustomData>
) {
  const FB_COLLECTION = 'profiles';

  const {
    body: { email, password },
  } = req;

  if (!password) {
    req.body.password = ''; //help null password or oauth from validation schema herre, :)
  }

  switch (req.method) {
    case 'POST':
      return loginUser();
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  async function loginUser() {
    //todo: allow custom _id

    try {
      //validate..
      let validRequest = await validate(req.body, IUserLoginSchema);
      if (!validRequest)
        return res.status(422).json({
          success: false,
          message: `*required: ${IUserLoginSchema.required}`,
          verbose: `valid fields: ${JSON.stringify(IUserLoginSchema.fields)}`,
        });

      //semantics..
      const docsRef = collection(dbois, FB_COLLECTION);

      const q = query(docsRef);
      const querySnapshot = await getDocs(q);

      const entriesData = querySnapshot.docs.map((entry) => ({
        ...entry.data(),
        _id: entry.id, //🥀order matters case _id field corrupted in PUTs
      }));

      //since where clause doesn't have case insensitive search..
      const allRecords: IUserData[] = entriesData.map((entry) => {
        let recordEntry: any = entry;

        return recordEntry;
      });

      //get one..
      let filteredResults = allRecords.filter((entry) =>
        equalStrings_i(entry.email, email)
      );

      if (filteredResults.length > 0) {
        //okay to login
        let db_user: IUserData = filteredResults[0];

        const db_password = db_user.password;
        const alleged_password = req.body.password;

        const correctPassword = await myCipherService.checkPassword(
          alleged_password, //no nulls! checked by login schema
          `${db_password}` //no nulls! guard by backticks
        );

        if (correctPassword) {
          //jwt..
          await myCipherService.signClaims(db_user, res);

          // console.log('!!db_user', db_user);

          // if you wan to minimize output fields ie to hide from postman, you could do it in BE [signIn obj, getOne, getOneByEmail] comment field below or exclude in FE via lib/ loaders,
          // if you don't, return full fb obj
          // full fb obj already signed in claims so jwt in headers has roleId, etc
          return res.status(200).json({
            message: 'Successful signin',
            data: db_user,
            verbose: {
              msg: `Auth token set in headers via cookie.. This is for smooth authentication in rest clients, browser tabs.. Also guards against XSS or CSRF`,
            },
          });
        } else {
          return res.status(401).json({
            success: false,
            message: `Invalid credentials`,
          });
        }
      } else {
        //record does not exist
        return res.status(401).json({
          success: false,
          message: `User with that email is not registered`,
        });
      }
    } catch (e) {
      console.log(`Ayayai on creating one user::${e}`);

      return res.status(500).json({
        success: false,
        message: `Server says urgh`,
        verbose: `${simpleErrorPlease(e)}`,
      });
    }
  }
}
