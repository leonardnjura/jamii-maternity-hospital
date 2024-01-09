import { collection, getDocs, query } from 'firebase/firestore';
import { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { dbois } from '../../config/db';
import { validate } from '../../data/my-schemas';
import {
  IEmailInfoSchema,
  IUserData,
  IUserDataOrCustomData,
} from '../../data/types';
import { equalStrings_i, simpleErrorPlease } from '../../utils/preops';

interface IApiRequest extends NextApiRequest {
  body: {
    email: string;
  };
}

export default handler; //chained during sign up, skip authentication cookie and use authorization, for efficiency

async function handler(
  req: IApiRequest,
  res: NextApiResponse<IUserDataOrCustomData>
) {
  //%%%%%%%%CORS%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%==-/
  await NextCors(req, res, {
    // Options
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });
  //%%%%%%%%CORS%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%==-/

  const FB_COLLECTION = 'profiles';

  //authorization headers
  let lnoApiKey = req.headers.crudkey as string;

  const {
    body: { email },
  } = req;

  switch (req.method) {
    case 'POST':
      return getEmailInfo();
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  async function getEmailInfo() {
    //**  =====  */
    let opAuthorized = true; //todo: check if user is authorized to call endpoint
    //**  =====  */

    try {
      if (opAuthorized) {
        //validate..
        let validRequest = await validate(req.body, IEmailInfoSchema);
        if (!validRequest)
          return res.status(422).json({
            success: false,
            message: `*required: ${IEmailInfoSchema.required}`,
            verbose: `valid fields: ${JSON.stringify(IEmailInfoSchema.fields)}`,
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

          return res.status(200).json({
            message: `Email info`,
            data: db_user,
          });
        } else {
          return res.status(401).json({
            success: false,
            message: `User of that email does not exist`,
          });
        }
      } else {
        return res.status(401).json({
          success: false,
          message: `Use a valid api key for GET ops`,
        });
      }
    } catch (e) {
      console.log(`Ayayai on getting email info one user::${e}`);

      return res.status(500).json({
        success: false,
        message: `Server says urgh`,
        verbose: `${simpleErrorPlease(e)}`,
      });
    }
  }
}
