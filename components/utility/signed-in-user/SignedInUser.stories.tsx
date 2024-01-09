import { ComponentMeta, ComponentStory } from '@storybook/react';
import SignedInUser, { ISignedInUser } from './SignedInUser';
import { mockSignedInUserProps } from './SignedInUser.mocks';

export default {
  title: 'utility/SignedInUser',
  component: SignedInUser,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
} as ComponentMeta<typeof SignedInUser>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof SignedInUser> = (args) => (
  <SignedInUser {...args} />
);

export const Base = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args

Base.args = {
  ...mockSignedInUserProps.base,
} as ISignedInUser;
