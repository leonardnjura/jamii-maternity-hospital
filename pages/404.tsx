import NotFound from '../components/layouts/not-found/NotFound';
import PrimaryLayout from '../components/layouts/primary/PrimaryLayout';
import { NextPageWithLayout } from './page';

export interface INotFoundProps {}

const NotFoundPage: NextPageWithLayout<INotFoundProps> = () => {
  return <NotFound />;
};

export default NotFoundPage;

NotFoundPage.getLayout = (page) => {
  return <PrimaryLayout titleBar="Not Found">{page}</PrimaryLayout>;
};
