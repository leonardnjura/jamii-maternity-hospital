import { ComponentMeta, ComponentStory } from '@storybook/react';
import NotFound, { INotFound } from './NotFound';
import { mockNotFoundProps } from './NotFound.mocks';

export default {
  title: 'templates/NotFound',
  component: NotFound,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
} as ComponentMeta<typeof NotFound>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof NotFound> = (args) => (
  <NotFound {...args} />
);

export const Base = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args

Base.args = {
  ...mockNotFoundProps.base,
} as INotFound;
