export interface INotFound {
  customMessage?: string;
}

const NotFound: React.FC<INotFound> = ({
  customMessage = 'Page not found',
}) => {
  return (
    <section className="f-width flex flex-row   items-center  pt-24 pb-20 pr-2">
      <h2 className="my-vrule">404</h2>
      <p className="my-vrule-text">{customMessage}</p>
    </section>
  );
};

export default NotFound;
