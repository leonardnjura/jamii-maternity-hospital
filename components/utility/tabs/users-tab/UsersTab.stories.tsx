import { ComponentMeta, ComponentStory } from '@storybook/react';
import UsersTab, { IUsersTab } from './UsersTab';
import { mockUsersTabProps } from './UsersTab.mocks';

export default {
  title: 'utility/UsersTab',
  component: UsersTab,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
} as ComponentMeta<typeof UsersTab>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof UsersTab> = (args) => (
  <UsersTab {...args} />
);

export const Base = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args

Base.args = {
  ...mockUsersTabProps.base,
} as IUsersTab;
