// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { dbois } from '../../../config/db';

import { validate } from '../../../data/my-schemas';
import {
  ICustomData,
  IHospitalClient,
  IHospitalClientSchema,
  IUserData,
} from '../../../data/types';
import {
  determineLeastAllocUser,
  equalStrings_i,
  simpleErrorPlease,
  validEmail,
} from '../../../utils/preops';

import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore';
import { lnoApiKeySysOps } from '../../../config';
import { loadUsers_MidwivesWithAssignments } from '../../../lib/get-users';
import { addOneItemToUserClientList } from '../../../lib/get-users-clientlist-info';

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

  const FB_COLLECTION = 'clients';

  //params after ? in endpoint url

  //authorization headers
  let lnoApiKey = req.headers.crudkey as string;

  const {
    body: { clientEmail, createdBy },
  } = req;

  switch (req.method) {
    case 'GET':
      return getAll();
    case 'POST':
      return createClient();
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  async function createClient() {
    //**  =====  */
    let opAuthorized = true; //todo: check if user is authorized to call endpoint
    //**  =====  */
    try {
      if (opAuthorized) {
        //validate 1..
        let validRequest = await validate(req.body, IHospitalClientSchema);
        if (!validRequest)
          return res.status(422).json({
            success: false,
            message: `*required: ${IHospitalClientSchema.required}`,
            verbose: `valid fields: ${JSON.stringify(
              IHospitalClientSchema.fields
            )}`,
          });

        if (!(await validEmail(clientEmail)))
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
        const allRecords: IHospitalClient[] = entriesData.map((entry) => {
          let engorgedRecordEntry: any = entry;

          return engorgedRecordEntry;
        });

        //get one..

        let filteredResults = allRecords.filter((entry) =>
          equalStrings_i(entry.clientEmail, clientEmail)
        );

        if (filteredResults.length > 0) {
          console.log(`!!fb client record exists`);
          //record exists..
          let dbItem: IHospitalClient = filteredResults[0];

          return res.status(422).json({
            success: false,
            message: `Client with email "${dbItem.clientEmail}" already exists`,
            verbose: `${dbItem._id}`, //quick ref
          });
        }

        //[2.]create..

        //**special check if client with email exists and is not discharged */

        const midwivesStuffedWithAssignments: IUserData[] =
          await loadUsers_MidwivesWithAssignments(lnoApiKeySysOps!);

        const leastAllocMidwife: IUserData = determineLeastAllocUser(
          midwivesStuffedWithAssignments
        );

        //alloc Ndays hospitalization period..
        let d = new Date();
        d.setDate(d.getDate() + req.body.hospitalizationDays);
        const hospitalizationExpiry = d.toISOString(); //utc,

        //auto 1..
        //create client record
        const preparedRecord = {
          ...req.body,
          handlerMedicId: leastAllocMidwife._id,
          hospitalizationExpiry,
          dateCreated: new Date().toISOString(), //utc
          dateUpdated: `-`,
        };

        const { id } = await addDoc(docsRef, preparedRecord);

        //auto 2..
        //add client ref to user clientslist
        const refBody = {
          //clientId
          assignmentRef: id,
        };

        let totalAssignments = 0;

        if (leastAllocMidwife.clientAssignments) {
          totalAssignments = leastAllocMidwife.clientAssignments.length + 1;
        }

        await addOneItemToUserClientList(
          leastAllocMidwife._id!,
          refBody,
          lnoApiKeySysOps!
        );

        return res.status(201).json({
          message: `Successful registration`,
          data: { ...preparedRecord, _id: id },
          verbose: {
            medicEmail: leastAllocMidwife.email,
            medicNames: `${leastAllocMidwife.firstName} ${leastAllocMidwife.lastName}`,
            totalAssignments,
          },
        });
      } else {
        return res.status(401).json({
          success: false,
          message: `Use a valid api key for POST ops`,
        });
      }
    } catch (e) {
      console.log(`Ayayai on creating one client::${e}`);

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
      console.log(`Ayayai on fetching clients fb::${e}`);

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
