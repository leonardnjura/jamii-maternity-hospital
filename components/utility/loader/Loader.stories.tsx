import { ComponentMeta, ComponentStory } from '@storybook/react';
import Loader, { ILoader } from './Loader';
import { mockLoaderProps } from './Loader.mocks';

export default {
  title: 'utility/Loader',
  component: Loader,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
} as ComponentMeta<typeof Loader>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof Loader> = (args) => <Loader {...args} />;

export const Base = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args

Base.args = {
  ...mockLoaderProps.base,
} as ILoader;
