import { GetServerSideProps } from 'next';
import { lnoApiKeySysOps, server } from '../../config';
import { IUserData } from '../../data/types';
import { loadUsers } from '../../lib/get-users';

const DATA_URL_USER = `${server}/user`;

function generateSiteMap(users: IUserData[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   <!--We manually set the URLs we know already-->
     <url>
       <loc>${server}</loc> 
     </url>
     <url>
       <loc>${server}/about</loc>
     </url>

     <!--Indices of ~/{ID}-->
     <url>
       <loc>${DATA_URL_USER}</loc>
     </url>
     

     <!--We loop herre-->
          <!--loop 0-->
          ${users
            .map((item: IUserData) => {
              return `
            <url>
                <loc>${`${DATA_URL_USER}/${item._id}`}</loc>
            </url>
          `;
            })
            .join('')}       
          
       </urlset>
 `;
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

interface IPageProps {}

export const getServerSideProps: GetServerSideProps<IPageProps> = async ({
  query,
  res,
}) => {
  // We make an API call to gather items to prepare URLs for our site
  const allUsers: IUserData[] = await loadUsers(lnoApiKeySysOps!);

  // We generate the XML sitemap with the items data
  const sitemap = generateSiteMap(allUsers);

  res.setHeader('Content-Type', 'text/xml');
  // we send the XML to the browser
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default SiteMap;
