import { ComponentMeta, ComponentStory } from '@storybook/react';
import NavRhs, { INavRhs } from './NavRhs';
import { mockNavRhsProps } from './NavRhs.mocks';

export default {
  title: 'utility/NavRhs',
  component: NavRhs,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
} as ComponentMeta<typeof NavRhs>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof NavRhs> = (args) => <NavRhs {...args} />;

export const Base = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args

Base.args = {
  ...mockNavRhsProps.base,
} as INavRhs;
