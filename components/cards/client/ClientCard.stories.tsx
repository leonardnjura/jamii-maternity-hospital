import { ComponentMeta, ComponentStory } from '@storybook/react';
import ClientCard, { IClientCard } from './ClientCard';
import { mockClientCardProps } from './ClientCard.mocks';

export default {
  title: 'cards/ClientCard',
  component: ClientCard,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
} as ComponentMeta<typeof ClientCard>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof ClientCard> = (args) => (
  <ClientCard {...args} />
);

export const Base = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args

Base.args = {
  ...mockClientCardProps.base,
} as IClientCard;
