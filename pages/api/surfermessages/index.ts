// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { dbois } from '../../../config/db';

import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore';
import { validate } from '../../../data/my-schemas';
import {
  ICustomData,
  IMessageData,
  IMessageDataSchema,
} from '../../../data/types';
import {
  equalStrings_i,
  noSpacesPlease,
  simpleErrorPlease,
} from '../../../utils/preops';

interface IApiRequest extends NextApiRequest {}

export default async function handler(
  req: IApiRequest,
  res: NextApiResponse<ICustomData>
) {
  //%%%%%%%%CORS%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%==-/
  await NextCors(req, res, {
    // Options
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });
  //%%%%%%%%CORS%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%==-/

  const FB_COLLECTION = 'surfermessages';

  //params after ? in endpoint url
  let firebase = req.query.firebase as string;

  //authorization headers
  let lnoApiKey = req.headers.crudkey as string;

  if (firebase) {
    firebase = noSpacesPlease(firebase);
  }

  const {
    body: { surferMessage, createdBy },
  } = req;

  switch (req.method) {
    case 'GET':
      return getAll();
    case 'POST':
      return createSurferMessage();
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  async function createSurferMessage() {
    //**  =====  */
    let opAuthorized = true; //any one can send a message to Countryooze LLC?
    //**  =====  */
    try {
      if (opAuthorized) {
        //validate..
        let validRequest = await validate(req.body, IMessageDataSchema);
        if (!validRequest)
          return res.status(422).json({
            success: false,
            message: `*required: ${IMessageDataSchema.required}`,
            verbose: `valid fields: ${JSON.stringify(
              IMessageDataSchema.fields
            )}`,
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
        const allRecords: IMessageData[] = entriesData.map((entry) => {
          let engorgedRecordEntry: any = entry;

          return engorgedRecordEntry;
        });

        //get one..
        let filteredResults = allRecords.filter((entry) =>
          equalStrings_i(entry.surferMessage, surferMessage)
        );

        if (filteredResults.length > 0) {
          //exists..
          let db_surfermessage: IMessageData = filteredResults[0];

          return res.status(422).json({
            success: false,
            message: `Message "${surferMessage}" already exists`,
            verbose: `${db_surfermessage._id}`, //quick ref
          });
        } else {
          //create..

          const { id } = await addDoc(docsRef, {
            ...req.body,
            dateCreated: new Date().toISOString(), //utc
            dateUpdated: `-`,
          });

          return res.status(201).json({
            message: `Message sent`,
            data: { _id: id, ...req.body },
            verbose: `${id}`, //quick ref
          });
        }
      } else {
        return res.status(401).json({
          success: false,
          message: `Use a valid api key for POST ops`,
        });
      }
    } catch (e) {
      console.log(`Ayayai on creating one surfermessage::${e}`);

      return res.status(500).json({
        success: false,
        message: `Server says urgh`,
        verbose: `${simpleErrorPlease(e)}`,
      });
    }
  }

  async function getAll() {
    //**  =====  */
    let opAuthorized = true; //todo: check if user is authorized to call endpoint
    //**  =====  */
    try {
      if (opAuthorized) {
        const docsRef = collection(dbois, FB_COLLECTION);

        // const q = query(docsRef, where("fieldName", "==", "criteria"));
        const q = query(docsRef, orderBy('dateCreated'));
        const querySnapshot = await getDocs(q);
        // querySnapshot.forEach((doc) => {
        //   console.log(doc.id, ' => ', doc.data());
        // });

        const entriesData = querySnapshot.docs.map((entry) => ({
          ...entry.data(),
          _id: entry.id, //🥀order matters case _id field corrupted in PUTs
        }));

        return res.status(200).json({
          message: 'all fields',
          data: entriesData,
        });
      } else {
        return res.status(401).json({
          success: false,
          message: `Use a valid api key for GET ops`,
        });
      }
    } catch (e) {
      console.log(`Ayayai on fetching surfermessages fb::${e}`);

      return res.status(500).json({
        success: false,
        message: `Server says urgh`,
        verbose: `${simpleErrorPlease(e)}`,
      });
    }
  }
}

//Fixes NextJs false positive warning "API resolved without sending a response for ~"
export const config = {
  api: {
    externalResolver: true,
  },
};
