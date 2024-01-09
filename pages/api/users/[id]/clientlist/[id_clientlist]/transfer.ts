// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { dbois } from '../../../../../../config/db';

import {
  IClientListAssignment,
  ICustomData,
  IHospitalClient,
  IHospitalClientTransferSchema,
  IUserData,
} from '../../../../../../data/types';
import { simpleErrorPlease } from '../../../../../../utils/preops';

import { doc, getDoc } from 'firebase/firestore';
import { lnoApiKeySysOps } from '../../../../../../config';
import { validate } from '../../../../../../data/my-schemas';
import {
  loadOneItemFromClients,
  updateClient,
} from '../../../../../../lib/get-clients';
import { loadOneUser } from '../../../../../../lib/get-users';
import {
  addOneItemToUserClientList,
  deleteOneItemFromClientList,
  loadOneItemFromClientList,
} from '../../../../../../lib/get-users-clientlist-info';

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

  //params after ? in endpoint url

  //authorization headers
  let lnoApiKey = req.headers.crudkey as string;

  const {
    body: { receivingMidwifeId, transferedBy },
  } = req;

  switch (req.method) {
    case 'POST':
      return transferClient(id_clientlist);
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  async function transferClient(id: string) {
    try {
      //validate 0..
      let validRequest = await validate(
        req.body,
        IHospitalClientTransferSchema
      );
      if (!validRequest) {
        return res.status(422).json({
          success: false,
          message: `*required: ${IHospitalClientTransferSchema.required}`,
          verbose: `valid fields: ${JSON.stringify(
            IHospitalClientTransferSchema.fields
          )}`,
        });
      }

      //validate 1a..
      //validate if midwife doc exists..----------------------------------------------------**
      let midwifeDocExists = false;
      let oneMidwife: IUserData = await loadOneUser(
        receivingMidwifeId,
        lnoApiKeySysOps!
      );
      if (oneMidwife) {
        midwifeDocExists = oneMidwife._id == receivingMidwifeId;
      }

      if (!midwifeDocExists)
        return res.status(422).json({
          success: false,
          message: `Midwife of specified id does not exist`,
        });
      //validate if midwife doc exists..-----------------------------------------------------**

      //validate 1b..
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
        let oldClientListRecord: IClientListAssignment =
          await loadOneItemFromClientList(id_user, id_clientlist);

        console.log('!!oldClientListRecord', oldClientListRecord);

        const clientId = oldClientListRecord.assignmentRef;
        const clientRecordToBeTransferred: IHospitalClient =
          await loadOneItemFromClients(clientId, lnoApiKey!);

        const transferringMidwifeId = id_user;

        const createBody_ForClientListItem = {
          //clientId
          assignmentRef: clientId,
        };

        const updateBody_ForClientRecord = {
          discharged: false, //redundant, for schema pass
          handlerMedicId: receivingMidwifeId,
        };

        //0. update client record field: handlerMedicId
        await updateClient(clientId, updateBody_ForClientRecord, lnoApiKey!);

        //1. add to receiving midwife's clientslist
        await addOneItemToUserClientList(
          receivingMidwifeId,
          createBody_ForClientListItem,
          lnoApiKey!
        );

        //2. delete from transferring midwife's clientslist
        await deleteOneItemFromClientList(
          transferringMidwifeId,
          id_clientlist,
          lnoApiKey!
        );

        return res.status(200).json({
          message: 'all fields',
          data: `transferred client ${clientId} from midwife ${transferringMidwifeId} to midwife ${receivingMidwifeId}`,
          verbose: { id_user, id_clientlist },
        });
      } else {
        return res.status(404).json({
          success: false,
          message: `Item of id ${id} not found under user ${id_user}`,
        });
      }
    } catch (e) {
      console.log(`Ayayai on transferring one clientlist item::${e}`);

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
