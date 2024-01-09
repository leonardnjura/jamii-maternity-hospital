import { addDoc, collection, getDocs, query } from 'firebase/firestore';
import { NextApiRequest, NextApiResponse } from 'next';
import { lnoApiKeySysOps } from '../../config';
import { dbois } from '../../config/db';
import { validate } from '../../data/my-schemas';
import {
  IEmailInfoSchema,
  IUserData,
  IUserDataOrCustomData,
} from '../../data/types';
import { deleteUser, loadOneUserByEmail } from '../../lib/get-users';
import { simpleErrorPlease, validEmail } from '../../utils/preops';
import NextCors from 'nextjs-cors';

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

async function handler(
  req: IApiRequest,
  res: NextApiResponse<IUserDataOrCustomData>
) {
  const FB_COLLECTION = 'deletedProfiles';

  //params after ? in endpoint url

  const {
    body: { email }, //don't bother with auto fields, :)
  } = req;

  switch (req.method) {
    case 'POST':
      return logDeletedUserProfile();
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  async function logDeletedUserProfile() {
    try {
      //validate..
      let validRequest = await validate(req.body, IEmailInfoSchema);
      if (!validRequest)
        return res.status(422).json({
          success: false,
          message: `*required: ${IEmailInfoSchema.required}`,
          verbose: `valid fields: ${JSON.stringify(IEmailInfoSchema.fields)}`,
        });

      if (!(await validEmail(email)))
        return res.status(422).json({
          success: false,
          message: `valid email required`,
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

      {
        //create/copy..

        const old_db_user = await loadOneUserByEmail(email, lnoApiKeySysOps!);

        if (old_db_user) {
          const logged_user = {
            ...old_db_user,
            dateDeleted: new Date().toISOString(), //utc
          };

          const old_id = old_db_user['_id'];

          //delete profile..
          await deleteUser(old_id, lnoApiKeySysOps!);

          const { id } = await addDoc(docsRef, logged_user);

          return res.status(201).json({
            message: `Successful a/c deletion`,
            data: { ...logged_user, _id: id, _id_deleted: old_id },
          });
        }
        return res.status(422).json({
          success: false,
          message: `Email does not exist`,
          verbose: { old_db_user },
        });
      }
    } catch (e) {
      console.log(`Ayayai on logging one user::${e}`);

      return res.status(500).json({
        success: false,
        message: `Server says urgh`,
        verbose: `${simpleErrorPlease(e)}`,
      });
    }
  }
}
