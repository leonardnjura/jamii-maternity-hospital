// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from 'firebase/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { lnoApiKeySysOps } from '../../../../../config';
import { dbois } from '../../../../../config/db';
import { validate } from '../../../../../data/my-schemas';
import {
  ICustomData,
  IUserData,
  IClientListAssignmentSchema,
  IClientListAssignment,
} from '../../../../../data/types';
import { loadOneUser } from '../../../../../lib/get-users';
import { equalStrings_i, simpleErrorPlease } from '../../../../../utils/preops';

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
      return getClientList();
    case 'POST':
      return addToClientList(id_clientlist);
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  async function addToClientList(id: string) {
    try {
      //validate 0..
      //validate if parent doc exists..------------------------------------------------------**
      let parentDocExists = false;
      let oneuser: IUserData = await loadOneUser(
        FB_CHILD_DOC_ID,
        lnoApiKeySysOps!
      );
      if (oneuser) {
        parentDocExists = oneuser._id == FB_CHILD_DOC_ID;
      }

      if (!parentDocExists)
        return res.status(422).json({
          success: false,
          message: `User of specified id does not exist`,
          verbose: `check parent doc id: ~api/users/{{userId}}/clientlist`,
        });
      //validate if parent doc exists..------------------------------------------------------**

      //validate 1..
      let validRequest = await validate(req.body, IClientListAssignmentSchema);

      if (!validRequest) {
        return res.status(422).json({
          success: false,
          message: `*required: ${IClientListAssignmentSchema.required}`,
          verbose: `valid fields: ${JSON.stringify(
            IClientListAssignmentSchema.fields
          )}`,
        });
      }

      //validate 2..
      //check if ref is valid
      const docRef = doc(dbois, 'clients', assignmentRef);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return res.status(404).json({
          success: false,
          message: `Client of id ${assignmentRef} not found`,
        });
      }

      //semantics..
      const docsRef = collection(
        dbois,
        FB_COLLECTION,
        FB_CHILD_DOC_ID,
        FB_CHILD_COLLECTION
      );

      const q = query(docsRef);
      const querySnapshot = await getDocs(q);

      const entriesData = querySnapshot.docs.map((entry) => ({
        ...entry.data(),
        _id: entry.id, //🥀order matters case _id field corrupted in PUTs
      }));

      //since where clause doesn't have case insensitive search..
      const allRecords: IClientListAssignment[] = entriesData.map((entry) => {
        let recordEntry: any = entry;

        return recordEntry;
      });

      //get one..
      //*special: duo comparison
      //refactor: should 1st part comparison ie for assignment be case insesitive since we are using fb uids?
      let filteredResults = allRecords.filter((entry) =>
        equalStrings_i(entry.assignmentRef, assignmentRef)
      );

      if (filteredResults.length > 0) {
        //record exists..
        let db_assignment: IClientListAssignment = filteredResults[0];
        let msg = `Assignment with ref "${db_assignment.assignmentRef}" already exists under user`;
        console.log(`!!msg:: ${msg}`);

        return res.status(422).json({
          success: false,
          message: msg,
          verbose: db_assignment._id,
        });
      } else {
        //create..
        const { id } = await addDoc(docsRef, {
          ...req.body,
          dateCreated: new Date().toISOString(), //utc
          dateUpdated: `-`,
        });

        return res.status(201).json({
          message: `Successful create`,
          data: { _id: id, ...req.body },
        });
      }
    } catch (e) {
      console.log(`Ayayai on creating one assignment::${e}`);

      return res.status(500).json({
        success: false,
        message: `Server says urgh`,
        verbose: `${simpleErrorPlease(e)}`,
      });
    }
  }

  async function getClientList() {
    try {
      //validate 0..
      //todo: check if user exists..

      const docsRef = collection(
        dbois,
        FB_COLLECTION,
        FB_CHILD_DOC_ID,
        FB_CHILD_COLLECTION
      );

      const q = query(docsRef, orderBy('dateCreated'));
      const querySnapshot = await getDocs(q);

      const entriesData = querySnapshot.docs.map((entry) => ({
        ...entry.data(),
        _id: entry.id, //🥀order matters case _id field corrupted in PUTs
      }));

      return res.status(200).json({
        message: 'all fields',
        data: entriesData,
      });
    } catch (e) {
      console.log(`Ayayai on fetching user's clientlist::${e}`);

      return res.status(500).json({
        success: false,
        message: `Server says urgh`,
        verbose: `${simpleErrorPlease(e)}`,
      });
    }
  }
}
