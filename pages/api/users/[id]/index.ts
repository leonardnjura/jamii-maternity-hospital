import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';

import type { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { dbois } from '../../../../config/db';
import { IUserData, IUserDataOrCustomData } from '../../../../data/types';
import { loadClientList } from '../../../../lib/get-users-clientlist-info';
import { simpleErrorPlease } from '../../../../utils/preops';

interface IApiRequest extends NextApiRequest {}

export default handler;

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

  const id = req.query.id as string;
  const FB_COLLECTION = 'profiles';

  //authorization headers
  let lnoApiKey = req.headers.crudkey as string;

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
          let db_user_raw: any = docSnap.data();
          let db_user: IUserData = db_user_raw;
          let email = db_user.email;

          //stuffings..%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%=-
          const clientList = await loadClientList(id);
          //stuffings..%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%=-

          return res.status(200).json({
            message: 'all fields',
            data: {
              ...db_user,
              clientAssignments: clientList,
              _id: docSnap.id,
            }, //ordinal _id
            // verbose: { clientList },
          });
        } else {
          return res
            .status(404)
            .json({ success: false, message: `Item of id ${id} not found` });
        }
      } else {
        return res.status(401).json({
          success: false,
          message: `Use a valid api key for GET ops`,
        });
      }
    } catch (e) {
      console.log(`Ayayai on fetching one user::${e}`);

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
        const docRef = doc(dbois, FB_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          //update..
          await updateDoc(docRef, {
            ...req.body,
            dateUpdated: new Date().toISOString(),
          });

          return res.status(200).json({
            message: `successfully updated`,
            verbose: { _id: id },
          });
        } else {
          return res.status(404).json({
            success: false,
            message: `Item of id ${id} is not found.. Cannot update`,
          });
        }
      } else {
        return res.status(401).json({
          success: false,
          message: `Use a valid api key for PUT ops`,
        });
      }
    } catch (e) {
      console.log(`Ayayai on updating one user::${e}`);

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
          // .json({ success: true, message: 'Succesfully deleted' }); //Tehehe, Warning: ~ A body was attempted to be set with a 204 statusCode
        } else {
          return res.status(404).json({
            success: false,
            message: `Item of id ${id} is not found.. Cannot delete`,
          });
        }
      } else {
        return res.status(401).json({
          success: false,
          message: `Use a valid api key for DELETE ops`,
        });
      }
    } catch (e) {
      console.log(`Ayayai on deleting one user::${e}`);

      return res.status(500).json({
        success: false,
        message: `Server says urgh`,
        verbose: `${simpleErrorPlease(e)}`,
      });
    }
  }
}

//Fixes NextJs false positive warning "API resolved without sending a response for ~"?
export const config = {
  api: {
    externalResolver: true,
  },
};
