import { ComponentMeta, ComponentStory } from '@storybook/react';
import UserRoleType, { IUserRoleType } from './UserRoleType';
import { mockUserRoleTypeProps } from './UserRoleType.mocks';

export default {
  title: 'utility/UserRoleType',
  component: UserRoleType,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
} as ComponentMeta<typeof UserRoleType>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof UserRoleType> = (args) => (
  <UserRoleType {...args} />
);

export const Base = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args

Base.args = {
  ...mockUserRoleTypeProps.base,
} as IUserRoleType;
