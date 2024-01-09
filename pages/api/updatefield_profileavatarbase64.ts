import { doc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { NextApiRequest, NextApiResponse } from 'next';
import { dbois, fbStorage } from '../../config/db';
import { IUserDataOrCustomData } from '../../data/types';
import { simpleErrorPlease } from '../../utils/preops';

interface IApiRequest extends NextApiRequest {
  body: {
    userId: string;
    file: string;
  };
}

export default handler;

function handler(
  req: IApiRequest,
  res: NextApiResponse<IUserDataOrCustomData>
) {
  const FB_COLLECTION = 'profiles';

  const {
    body: { userId, file },
  } = req;

  switch (req.method) {
    case 'PUT':
      return updateField();
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  async function updateField() {
    const storage = fbStorage;
    const storageRef = ref(storage, `users/${userId}`);

    try {
      //validate..
      //let user as confused decode postman, tired of checking if user exists on field updates, :)

      //semantics..
      const downloadUrl = await uploadString(storageRef, file, 'data_url', {
        contentType: 'image/jpg',
      }).then(() => {
        return getDownloadURL(storageRef);
      });

      const docRef = doc(dbois, FB_COLLECTION, userId);
      await updateDoc(docRef, {
        //fields we want to update..
        avatar: downloadUrl,
      });

      uploadString(storageRef, file, 'data_url').then((snapshot) => {
        console.log('Uploaded a data_url string!', snapshot);
        return res.status(200).json({
          message: `Successful file upload && field update`,
          data: downloadUrl,
        });
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
