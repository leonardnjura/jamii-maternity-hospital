import { NextApiRequest, NextApiResponse } from 'next';
import { validate } from '../../data/my-schemas';
import { IUserDataOrCustomData, IUserDataSchema } from '../../data/types';
import { myCipherService } from '../../services/cipher.service';
import { simpleErrorPlease } from '../../utils/preops';

interface IApiRequest extends NextApiRequest {}

export default handler; //note: this is a login-refresh endpoint ie refreshes cookie of an existing user

function handler(
  req: IApiRequest,
  res: NextApiResponse<IUserDataOrCustomData>
) {
  //authorization headers
  let lnoApiKey = req.headers.crudkey as string;

  const {
    body: { email, password, xxx },
  } = req;

  if (!password) {
    req.body.password = ''; //help null password or oauth from validation schema herre, :)
  }

  switch (req.method) {
    case 'POST':
      return createUserCookie();
    default:
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  async function createUserCookie() {
    /**Special*/
    //sets BE cookie header
    //**  =====  */
    let opAuthorized = true; //todo: check if user is authorized to call endpoint
    //**  =====  */
    try {
      if (opAuthorized) {
        //validate..
        let validRequest = await validate(req.body, IUserDataSchema);
        if (!validRequest)
          return res.status(422).json({
            success: false,
            message: `*required: ${IUserDataSchema.required}`,
            verbose: `valid fields: ${JSON.stringify(IUserDataSchema.fields)}`,
          });

        const browser_user = req.body;

        // console.log('!!browser_user', browser_user);

        //jwt..
        await myCipherService.signClaims(browser_user, res);

        return res.status(200).json({
          success: true,
          data: `Cookies successfully set for ${email}`, //needed field to tell lib func all was good, :|, :)
          message: `Cookies successfully set for ${email}`,
          verbose: { cookie_user: browser_user },
        });
      } else {
        return res.status(401).json({
          success: false,
          message: `Use a valid api key for BE COOKIE REFRESH ops`,
        });
      }
    } catch (e) {
      console.log(`Ayayai on setting cookies for user::${e}`);

      return res.status(500).json({
        success: false,
        message: `Server says urgh`,
        verbose: `${simpleErrorPlease(e)}`,
      });
    }
  }
}
