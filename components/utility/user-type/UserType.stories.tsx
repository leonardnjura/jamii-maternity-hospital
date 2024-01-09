import { ComponentMeta, ComponentStory } from '@storybook/react';
import UserType, { IUserType } from './UserType';
import { mockUserTypeProps } from './UserType.mocks';

export default {
  title: 'utility/UserType',
  component: UserType,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
} as ComponentMeta<typeof UserType>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof UserType> = (args) => (
  <UserType {...args} />
);

export const Base = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args

Base.args = {
  ...mockUserTypeProps.base,
} as IUserType;
