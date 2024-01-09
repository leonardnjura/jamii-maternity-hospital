import { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';
import { IUserDataOrCustomData } from '../../../data/types';
import { myCipherService } from '../../../services/cipher.service';
import { simpleErrorPlease } from '../../../utils/preops';

//NOTE: since we will be refreshing cookie with this page, database calls to check if user exists are better if not called
//we will just sign with the last authenticated user object needing more jwt life, after all its jwt life that we need to update in the cookie

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

  //params after ? in endpoint url
  let input = req.query.input as string;

  if (input) {
    input = input.trim(); //inside-string spaces ok, around spaces trimmed off
  }

  switch (req.method) {
    case 'GET':
      return generateHash();
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  async function generateHash() {
    //generates hash from BE, FE cannot use cipher service directly.. gonna see errors, :)
    //use anothe endpoint to check hash

    if (input && input.length > 0) {
      //validate..
      try {
        const hash = await myCipherService.generatePasswordHash(input);

        return res.status(200).json({
          message: `Hash`,
          data: hash,
        });
      } catch (e) {
        console.log(`Ayayai on generating hash::${e}`);

        return res.status(500).json({
          success: false,
          message: `Server says urgh`,
          verbose: `${simpleErrorPlease(e)}`,
        });
      }
    } else {
      return res.status(422).json({
        success: false,
        message: `Use a valid string in url param ?input=`,
      });
    }
  }
}
