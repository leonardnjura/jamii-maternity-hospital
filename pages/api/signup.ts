import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { addDoc, collection, getDocs, query } from 'firebase/firestore';
import { NextApiRequest, NextApiResponse } from 'next';
import { DAYS_TO_TRY_FREEMIUM_TOKEN } from '../../config';
import { dbois } from '../../config/db';
import { validate } from '../../data/my-schemas';
import {
  IUserData,
  IUserDataOrCustomData,
  IUserDataSchema,
} from '../../data/types';
import { myCipherService } from '../../services/cipher.service';
import {
  equalStrings_i,
  generateRandomAvatarUrl,
  noSpacesPlease,
  simpleErrorPlease,
  validEmail,
  validPassword,
} from '../../utils/preops';

interface IApiRequest extends NextApiRequest {
  body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    avatar: string;
    freemiumTokenExpiry: string;
  };
}

export default handler;

function handler(
  req: IApiRequest,
  res: NextApiResponse<IUserDataOrCustomData>
) {
  const FB_COLLECTION = 'profiles';

  //params after ? in endpoint url
  let skipKlaims = req.query.skipKlaims as string; //if batch added
  let skipFirebaseAuth = req.query.skipFirebaseAuth as string; //if called by mobile, as mobile does it by itself

  if (skipKlaims) {
    skipKlaims = noSpacesPlease(skipKlaims);
  }

  if (skipFirebaseAuth) {
    skipFirebaseAuth = noSpacesPlease(skipFirebaseAuth);
  }

  const skipCookie = equalStrings_i(skipKlaims, 'true');
  const skipRedudantFirebaseAuthCredentials = equalStrings_i(
    skipFirebaseAuth,
    'true'
  ); //redundancy useful with android auth in mobile app if user signs up via web

  const {
    body: { email, password, firstName, lastName, avatar }, //don't bother with auto fields, :)
  } = req;

  if (!password) {
    req.body.password = ''; //help null to pass validation schema herre, :)
  }
  if (!avatar) {
    req.body.avatar = ''; //help null to pass validation schema herre, :)
  }

  switch (req.method) {
    case 'POST':
      return createUser();
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  async function createUser() {
    //todo: allow custom _id

    try {
      //validate..
      let validRequest = await validate(req.body, IUserDataSchema);
      if (!validRequest)
        return res.status(422).json({
          success: false,
          message: `*required: ${IUserDataSchema.required}`,
          verbose: `valid fields: ${JSON.stringify(IUserDataSchema.fields)}`,
        });

      if (!(await validEmail(email)))
        return res.status(422).json({
          success: false,
          message: `valid email required`,
        });

      if (password && !(await validPassword(password)))
        return res.status(422).json({
          success: false,
          message: `must contain at least 8 characters, one uppercase, one lowercase, one number and one special character`,
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
        //record exists..
        let db_user: IUserData = filteredResults[0];

        return res.status(422).json({
          success: false,
          message: `User with that email already exists`,
          data: db_user,
          verbose: db_user._id,
        });
      } else {
        //create..

        //fb
        let firebaseAuthUser = null;

        if (password && !skipRedudantFirebaseAuthCredentials) {
          const auth = getAuth();

          const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

          firebaseAuthUser = userCredential.user; //go to console to check
        }

        //important if fb fails we dont reach here!!
        //-----------------------------------------------------

        //me
        //NOTE: if oauth signup was used no password was passed, so we dont create/update this field in fb
        //ie only users registered via api can have password fields
        //todo: create a separate profiles table for api users so we dont say emails registered via oauth/frontend as registered

        //hash password..
        //todo: password strength check
        let hashedPassword = null;
        if (password) {
          hashedPassword = await myCipherService.generatePasswordHash(password);
        }

        //alloc Ndays freemium period..
        let d = new Date();
        d.setDate(d.getDate() + DAYS_TO_TRY_FREEMIUM_TOKEN);
        const freemiumTokenExpiry = d.toISOString(); //utc,

        //generate default avatar..
        const dicebearAvatar = generateRandomAvatarUrl(email);

        const new_db_user = {
          ...req.body, //any field below if was included in req body, is overwritten.. we could leverage that for auto values, :)
          password: hashedPassword,
          freemiumTokenExpiry,
          avatar: avatar ?? dicebearAvatar,
          dateCreated: new Date().toISOString(), //utc
          dateUpdated: `-`,
        };

        const { id } = await addDoc(docsRef, new_db_user);

        console.log(
          `!!skipped signing claims for new user ${id}::${skipCookie}`
        );

        if (skipCookie) {
          //skip..
        } else {
          //sign jwt..

          const new_db_user_stuffed_with_id = { ...new_db_user, _id: id };

          await myCipherService.signClaims(new_db_user_stuffed_with_id, res);
        }

        return res.status(201).json({
          message: `Successful sign up`,
          data: { ...new_db_user, _id: id },
          verbose: { firebaseAuthUser },
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
