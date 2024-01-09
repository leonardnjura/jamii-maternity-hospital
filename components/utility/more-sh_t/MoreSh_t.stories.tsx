import { ComponentMeta, ComponentStory } from '@storybook/react';
import MoreSh_t, { IMoreSh_t } from './MoreSh_t';
import { mockMoreSh_tProps } from './MoreSh_t.mocks';

export default {
  title: 'utility/MoreSh_t',
  component: MoreSh_t,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
} as ComponentMeta<typeof MoreSh_t>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof MoreSh_t> = (args) => (
  <MoreSh_t {...args} />
);

export const Base = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args

Base.args = {
  ...mockMoreSh_tProps.base,
} as IMoreSh_t;
