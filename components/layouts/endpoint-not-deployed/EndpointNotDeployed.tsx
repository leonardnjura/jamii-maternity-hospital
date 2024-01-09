import { ParsedUrlQuery } from 'querystring';

export interface IEndpointNotDeployed {
  q?: string;
  customMessage?: string;
}

const EndpointNotDeployed: React.FC<IEndpointNotDeployed> = ({
  q = 'id:',
  customMessage = 'Endpoint undeployed or unengaged',
}) => {
  return (
    <section className="f-width flex flex-row   items-center pt-24 pb-20 pr-2">
      <h2 className="my-vrule">{q}</h2>
      <p className="my-vrule-text">{customMessage}</p>
    </section>
  );
};

export default EndpointNotDeployed;
