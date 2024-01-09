import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';

import type { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { dbois } from '../../../config/db';
import { validate } from '../../../data/my-schemas';
import {
  ICustomData,
  IHospitalClient,
  IHospitalClientUpdateSchema,
} from '../../../data/types';
import {
  determineDaysLeftBeforeClientDischarge,
  determineIfClientDischargeIsDue,
} from '../../../services/subscription.service';
import { simpleErrorPlease } from '../../../utils/preops';

interface IApiRequest extends NextApiRequest {}

export default handler;

async function handler(req: IApiRequest, res: NextApiResponse<ICustomData>) {
  //%%%%%%%%CORS%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%==-/
  await NextCors(req, res, {
    // Options
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });
  //%%%%%%%%CORS%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%==-/

  const id = req.query.id as string;

  const FB_COLLECTION = 'clients';

  //authorization headers
  let lnoApiKey = req.headers.crudkey as string;

  const {
    body: { clientEmail, updatedBy },
  } = req;

  switch (req.method) {
    case 'GET':
      return getOne(id);
    case 'PUT':
      return updateOne(id);
    case 'DELETE':
      return deleteOne(id);
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  async function getOne(id: string) {
    //**  =====  */
    let opAuthorized = true; //todo: check if user is authorized to call endpoint
    //**  =====  */
    try {
      if (opAuthorized) {
        const docRef = doc(dbois, FB_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          //stuffings=====================----------------------------------------
          const client_raw: any = docSnap.data();
          const client: IHospitalClient = client_raw;
          const daysLeft = determineDaysLeftBeforeClientDischarge(client);
          const dischargeDue = determineIfClientDischargeIsDue(client);
          //stuffings=====================----------------------------------------

          return res.status(200).json({
            message: 'all fields',
            data: {
              ...docSnap.data(),
              _id: docSnap.id,
            },
            verbose: { daysLeft, dischargeDue },
          });
        } else {
          return res.status(404).json({
            success: false,
            message: `Client of id ${id} not found`,
          });
        }
      } else {
        return res.status(401).json({
          success: false,
          message: `Use a valid api key for GET ops`,
        });
      }
    } catch (e) {
      console.log(`Ayayai on fetching one client fb::${e}`);

      return res.status(500).json({
        success: false,
        message: `Server says urgh`,
        verbose: `${simpleErrorPlease(e)}`,
      });
    }
  }

  async function updateOne(id: string) {
    //**  =====  */
    let opAuthorized = true; //todo: check if user is authorized to call endpoint
    //**  =====  */

    try {
      if (opAuthorized) {
        const docsRef = collection(dbois, FB_COLLECTION);
        const docRef = doc(dbois, FB_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          //validate update 1..
          let validRequest = await validate(
            req.body,
            IHospitalClientUpdateSchema
          );
          if (!validRequest) {
            let errMsg = `*required: ${IHospitalClientUpdateSchema.required}`;
            let errMsgVerbose = `valid fields: ${JSON.stringify(
              IHospitalClientUpdateSchema.fields
            )}`;
            console.log(`422::`, errMsg);

            return res.status(422).json({
              success: false,
              message: `${errMsg}`,
              verbose: `${errMsgVerbose}`,
            });
          }

          const dateUpdated = new Date().toISOString();
          const preparedUpdateRecord = {
            ...req.body,
            dateDischarged: req.body.discharged ? dateUpdated : '-',
            dateUpdated,
          };

          await updateDoc(docRef, preparedUpdateRecord);

          return res.status(200).json({
            message: `successfully updated`,
            data: { ...preparedUpdateRecord, _id: id },
          });
        } else {
          return res.status(404).json({
            success: false,
            message: `Client of id ${id} not found`,
          });
        }
      } else {
        return res.status(401).json({
          success: false,
          message: `Use a valid api key for PUT ops`,
        });
      }
    } catch (e) {
      console.log(`Ayayai on fetching one client fb::${e}`);

      return res.status(500).json({
        success: false,
        message: `Server says urgh`,
        verbose: `${simpleErrorPlease(e)}`,
      });
    }
  }

  async function deleteOne(id: string) {
    //**  =====  */
    let opAuthorized = true; //todo: check if user is authorized to call endpoint
    //**  =====  */

    try {
      if (opAuthorized) {
        const docRef = doc(dbois, FB_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          await deleteDoc(docRef);
          return res.status(204).end(`Succesfully deleted`);
          // .json({ success: true, message: 'Succesfully deleted' });
        } else {
          return res.status(404).json({
            success: false,
            message: `Client of id ${id} not found`,
          });
        }
      } else {
        return res.status(401).json({
          success: false,
          message: `Use a valid api key for DELETE ops`,
        });
      }
    } catch (e) {
      console.log(`Ayayai on fetching one client fb::${e}`);

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
