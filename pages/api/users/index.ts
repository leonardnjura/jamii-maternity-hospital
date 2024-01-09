import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { MIDWIFE_ROLE_ID } from '../../../config';
import { dbois } from '../../../config/db';
import { IUserData, IUserDataOrCustomData } from '../../../data/types';
import { loadClientList } from '../../../lib/get-users-clientlist-info';
import {
  determineLeastAllocUser,
  equalStrings_i,
  noSpacesPlease,
  simpleErrorPlease,
} from '../../../utils/preops';

interface IApiRequest extends NextApiRequest {
  body: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    gender: string;
    status: number;
    avatar: string;
  };
}

// export default authenticate(handler);
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

  //params after ? in endpoint url
  let assignments = req.query.assignments as string; //if batch added
  let midwives = req.query.midwives as string; //if batch added

  if (assignments) {
    assignments = noSpacesPlease(assignments);
  }

  if (midwives) {
    midwives = noSpacesPlease(midwives);
  }

  const showClientAssignmentsAllocatedToUser = equalStrings_i(
    assignments,
    'true'
  );

  const showMidwivesOnly = equalStrings_i(midwives, 'true');

  //authorization headers
  let lnoApiKey = req.headers.crudkey as string;

  switch (req.method) {
    case 'GET':
      return getUsers();
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  async function getUsers() {
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

        let preferredUsersList: IUserData[] = [];

        for (let i = 0; i < entriesData.length; i++) {
          let db_user_raw: any = entriesData[i];
          let db_user: IUserData = db_user_raw;

          preferredUsersList.push(db_user);
        }

        //rolespecific..%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%=-
        if (showMidwivesOnly) {
          let midwivesUsersList: IUserData[] = [];

          for (let i = 0; i < preferredUsersList.length; i++) {
            let db_user: IUserData = preferredUsersList[i];

            if (equalStrings_i(db_user.roleId, MIDWIFE_ROLE_ID)) {
              midwivesUsersList.push(db_user);
            } else {
              console.log(`!!skipped non-midwifry user ${db_user.email}`);
            }
          }

          preferredUsersList = midwivesUsersList;
        }
        //rolespecific..%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%=-

        //stuffings..%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%=-
        if (showClientAssignmentsAllocatedToUser) {
          let stuffedUsersList: IUserData[] = [];

          for (let i = 0; i < preferredUsersList.length; i++) {
            let db_user: IUserData = preferredUsersList[i];
            let id = db_user._id;

            const assignments = await loadClientList(id!);
            db_user.clientAssignments = assignments;

            stuffedUsersList.push(db_user);
          }

          const leastAllocUser: IUserData =
            determineLeastAllocUser(stuffedUsersList);

          return res.status(200).json({
            message: 'all fields',
            data: stuffedUsersList,
            verbose: { leastAllocUser: leastAllocUser._id },
          });
        }
        //stuffings..%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%=-

        return res.status(200).json({
          message: 'all fields',
          data: preferredUsersList,
        });
      } else {
        return res.status(401).json({
          success: false,
          message: `Use a valid api key for GET ops`,
        });
      }
    } catch (e) {
      console.log(`Ayayai on fetching all users::${e}`);

      return res.status(500).json({
        success: false,
        message: `Server says urgh`,
        verbose: `${simpleErrorPlease(e)}`,
      });
    }
  }
}
