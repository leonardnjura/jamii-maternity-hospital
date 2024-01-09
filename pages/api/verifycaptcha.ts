import type { NextApiRequest, NextApiResponse } from 'next';
import { ICustomData } from '../../data/types';
import { noSpacesPlease, simpleErrorPlease } from '../../utils/preops';
import { server } from '../../config';

interface IApiRequest extends NextApiRequest {}

export default function handler(
  req: IApiRequest,
  res: NextApiResponse<ICustomData>
) {
  //params after ? in endpoint url
  let secret = req.query.secret as string;
  let userSiteInteractionToken = req.query.token as string;

  if (secret) {
    secret = noSpacesPlease(secret);
  }

  if (userSiteInteractionToken) {
    userSiteInteractionToken = noSpacesPlease(userSiteInteractionToken);
  }

  switch (req.method) {
    case 'GET':
      return verifyCaptcha();
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  async function verifyCaptcha() {
    let url = `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${userSiteInteractionToken}`;

    try {
      const thirdPartyRes = await fetch(`${url}`);

      let results = await thirdPartyRes.json();

      if (thirdPartyRes.status == 200) {
        return res.status(200).json({
          message: 'all fields',
          data: results,
        });
      } else {
        return res.status(thirdPartyRes.status).json({
          success: false,
          message: `Something bad happened`,
          verbose: { url },
        });
      }
    } catch (e) {
      console.log(`Ayayai on verifyCaptcha=::${e}`);

      return res.status(500).json({
        success: false,
        message: `Server says urgh`,
        verbose: `${simpleErrorPlease(e)}`,
      });
    }
  }
}
