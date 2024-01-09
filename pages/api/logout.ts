import { NextApiRequest, NextApiResponse } from 'next';
import { IUserDataOrCustomData } from '../../data/types';
import { myCipherService } from '../../services/cipher.service';
import { simpleErrorPlease } from '../../utils/preops';

interface IApiRequest extends NextApiRequest {
  body: {
    email: string;
    password: string;
  };
}

export default handler;

function handler(
  req: IApiRequest,
  res: NextApiResponse<IUserDataOrCustomData>
) {
  switch (req.method) {
    case 'DELETE':
      return deleteCookie();
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  async function deleteCookie() {
    try {
      await myCipherService.deleteClaims(res);

      return res.status(204).end(`Cookies deleted`);
      // .json({ success: true, message: 'Cookies deleted' });
    } catch (e) {
      console.log(`Ayayai on deleting cookies::${e}`);

      return res.status(500).json({
        success: false,
        message: `Server says urgh`,
        verbose: `${simpleErrorPlease(e)}`,
      });
    }
  }
}
