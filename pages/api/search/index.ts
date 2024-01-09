// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

import NextCors from 'nextjs-cors';
import { noSpacesPlease } from '../../../utils/preops';
import { ICustomData } from '../../../data/types';
import { getLocalSearchResultsUsers } from '../../../services/search.service';

interface IApiRequest extends NextApiRequest {
  body: { q?: string };
}

export default async function handler(
  req: IApiRequest,
  res: NextApiResponse<ICustomData[]>
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
  let mode = req.query.mode as string;

  if (mode) {
    mode = noSpacesPlease(mode);
  }

  const {
    body: { q },
  } = req;

  if (req.method === 'POST' && q && q.length > 0) {
    let filteredResults: any;
    if (mode && mode == 'otherItems') {
      filteredResults = await getLocalSearchResultsUsers(q);
    } else {
      filteredResults = await getLocalSearchResultsUsers(q);
    }

    res.status(200).json(filteredResults);
  } else {
    res.status(400).json([]);
  }
}
