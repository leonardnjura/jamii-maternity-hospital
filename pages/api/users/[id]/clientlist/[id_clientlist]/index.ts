import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';

import type { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { lnoApiKeySysOps } from '../../../../../../config';
import { dbois } from '../../../../../../config/db';
import { validate } from '../../../../../../data/my-schemas';
import {
  ICustomData,
  IUserData,
  IClientListAssignment,
  IClientListAssignmentUpdateSchema,
} from '../../../../../../data/types';
import { loadOneUser } from '../../../../../../lib/get-users';
import { simpleErrorPlease } from '../../../../../../utils/preops';

interface IApiRequest extends NextApiRequest {
  body: {
    assignmentRef: string;
  };
}

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

  const id_user = req.query.id as string;
  const id_clientlist = req.query.id_clientlist as string; //clientlist item id
  const FB_COLLECTION = 'clientList';
  const FB_CHILD_COLLECTION = 'userClientList';
  const FB_CHILD_DOC_ID = id_user; //user id

  const {
    body: { assignmentRef },
  } = req;

  switch (req.method) {
    case 'GET':
      return getOne(id_clientlist);
    case 'PUT':
      return updateOne(id_clientlist);
    case 'DELETE':
      return deleteOne(id_clientlist);
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  async function getOne(id: string) {
    try {
      //validate 0..
      //validate if parent doc exists..------------------------------------------------------**
      let parentDocExists = false;
      let oneUser: IUserData = await loadOneUser(
        FB_CHILD_DOC_ID,
        lnoApiKeySysOps!
      );
      if (oneUser) {
        parentDocExists = oneUser._id == FB_CHILD_DOC_ID;
      }

      if (!parentDocExists)
        return res.status(422).json({
          success: false,
          message: `User of specified id does not exist`,
          verbose: `check parent doc id: ~api/users/{{userId}}/clientlist`,
        });
      //validate if parent doc exists..------------------------------------------------------**

      const docRef = doc(
        dbois,
        FB_COLLECTION,
        FB_CHILD_DOC_ID,
        FB_CHILD_COLLECTION,
        id
      );
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return res.status(200).json({
          message: 'all fields',
          data: {
            ...docSnap.data(),
            _id: docSnap.id,
          },
        });
      } else {
        return res.status(404).json({
          success: false,
          message: `Item of id ${id} not found under user`,
        });
      }
    } catch (e) {
      console.log(`Ayayai on fetching one clientlist item::${e}`);

      return res.status(500).json({
        success: false,
        message: `Server says urgh`,
        verbose: `${simpleErrorPlease(e)}`,
      });
    }
  }

  async function updateOne(id: string) {
    try {
      //validate 0..
      //validate if parent doc exists..------------------------------------------------------**
      let parentDocExists = false;
      let oneUser: IUserData = await loadOneUser(
        FB_CHILD_DOC_ID,
        lnoApiKeySysOps!
      );
      if (oneUser) {
        parentDocExists = oneUser._id == FB_CHILD_DOC_ID;
      }

      if (!parentDocExists)
        return res.status(422).json({
          success: false,
          message: `User of specified id does not exist`,
          verbose: `check parent doc id: ~api/users/{{userId}}/clientlist`,
        });
      //validate if parent doc exists..------------------------------------------------------**

      //validate 1..
      let validRequest = await validate(
        req.body,
        IClientListAssignmentUpdateSchema
      );
      if (!validRequest) {
        return res.status(422).json({
          success: false,
          message: `*required: ${IClientListAssignmentUpdateSchema.required}`,
          verbose: `valid fields: ${JSON.stringify(
            IClientListAssignmentUpdateSchema.fields
          )}`,
        });
      }

      //validate 2..
      //todo: check if assignmentRef exists

      const docRef = doc(
        dbois,
        FB_COLLECTION,
        FB_CHILD_DOC_ID,
        FB_CHILD_COLLECTION,
        id
      );
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
          message: `Item of id ${id} is not found under user.. Cannot update`,
        });
      }
    } catch (e) {
      console.log(`Ayayai on updating one user item::${e}`);

      return res.status(500).json({
        success: false,
        message: `Server says urgh`,
        verbose: `${simpleErrorPlease(e)}`,
      });
    }
  }

  async function deleteOne(id: string) {
    try {
      //validate 0..
      //validate if parent doc exists..------------------------------------------------------**
      let parentDocExists = false;
      let oneUser: IUserData = await loadOneUser(
        FB_CHILD_DOC_ID,
        lnoApiKeySysOps!
      );
      if (oneUser) {
        parentDocExists = oneUser._id == FB_CHILD_DOC_ID;
      }

      if (!parentDocExists)
        return res.status(422).json({
          success: false,
          message: `User of specified id does not exist`,
          verbose: `check parent doc id: ~api/users/{{userId}}/clientlist`,
        });
      //validate if parent doc exists..------------------------------------------------------**

      const docRef = doc(
        dbois,
        FB_COLLECTION,
        FB_CHILD_DOC_ID,
        FB_CHILD_COLLECTION,
        id
      );
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        await deleteDoc(docRef);
        return res.status(204).end(`Succesfully deleted`);
        // .json({ success: true, message: 'Succesfully deleted' });
      } else {
        return res.status(404).json({
          success: false,
          message: `Item of id ${id} is not found under user.. Cannot delete`,
        });
      }
    } catch (e) {
      console.log(`Ayayai on deleting one user item::${e}`);

      return res.status(500).json({
        success: false,
        message: `Server says urgh`,
        verbose: `${simpleErrorPlease(e)}`,
      });
    }
  }
}
