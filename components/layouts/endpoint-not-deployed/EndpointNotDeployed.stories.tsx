import { ComponentMeta, ComponentStory } from '@storybook/react';
import EndpointNotDeployed, {
  IEndpointNotDeployed,
} from './EndpointNotDeployed';
import { mockEndpointNotDeployedProps } from './EndpointNotDeployed.mocks';

export default {
  title: 'templates/EndpointNotDeployed',
  component: EndpointNotDeployed,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
} as ComponentMeta<typeof EndpointNotDeployed>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof EndpointNotDeployed> = (args) => (
  <EndpointNotDeployed {...args} />
);

export const Base = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args

Base.args = {
  ...mockEndpointNotDeployedProps.base,
} as IEndpointNotDeployed;
