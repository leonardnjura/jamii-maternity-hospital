import { ComponentMeta, ComponentStory } from '@storybook/react';
import StatsTab, { IStatsTab } from './StatsTab';
import { mockStatsTabProps } from './StatsTab.mocks';

export default {
  title: 'utility/StatsTab',
  component: StatsTab,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
} as ComponentMeta<typeof StatsTab>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof StatsTab> = (args) => (
  <StatsTab {...args} />
);

export const Base = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args

Base.args = {
  ...mockStatsTabProps.base,
} as IStatsTab;
