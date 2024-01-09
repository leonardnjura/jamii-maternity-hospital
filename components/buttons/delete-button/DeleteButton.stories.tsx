import { ComponentMeta, ComponentStory } from '@storybook/react';
import DeleteButton, { IDeleteButton } from './DeleteButton';
import { mockDeleteButtonProps } from './DeleteButton.mocks';

export default {
  title: 'buttons/DeleteButton',
  component: DeleteButton,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
} as ComponentMeta<typeof DeleteButton>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof DeleteButton> = (args) => (
  <DeleteButton {...args} />
);

export const Base = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args

Base.args = {
  ...mockDeleteButtonProps.base,
} as IDeleteButton;
