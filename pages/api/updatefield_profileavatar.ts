import { doc, updateDoc } from 'firebase/firestore';
import { NextApiRequest, NextApiResponse } from 'next';
import { dbois } from '../../config/db';
import { IUserDataOrCustomData } from '../../data/types';
import { simpleErrorPlease } from '../../utils/preops';

interface IApiRequest extends NextApiRequest {
  body: {
    userId: string;
    avatar: string;
  };
}

export default handler;

function handler(
  req: IApiRequest,
  res: NextApiResponse<IUserDataOrCustomData>
) {
  const FB_COLLECTION = 'profiles';

  const {
    body: { userId, avatar },
  } = req;

  switch (req.method) {
    case 'PUT':
      return updateField();
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  async function updateField() {
    try {
      //validate..
      //let user as confused decode postman, tired of checking if user exists on field updates, :)

      const downloadUrl = avatar;

      const docRef = doc(dbois, FB_COLLECTION, userId);
      await updateDoc(docRef, {
        //fields we want to update..
        avatar: downloadUrl,
      });

      return res.status(200).json({
        message: `Successful field update`,
        data: downloadUrl,
      });
    } catch (e) {
      console.log(`Ayayai on updating one field::${e}`);

      return res.status(500).json({
        success: false,
        message: `Server says urgh`,
        verbose: `${simpleErrorPlease(e)}`,
      });
    }
  }
}
