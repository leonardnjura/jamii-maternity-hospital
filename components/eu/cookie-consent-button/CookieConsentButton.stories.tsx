import { ComponentMeta, ComponentStory } from '@storybook/react';
import CookieConsentButton, {
  ICookieConsentButton,
} from './CookieConsentButton';
import { mockCookieConsentButtonProps } from './CookieConsentButton.mocks';

export default {
  title: 'buttons/CookieConsentButton',
  component: CookieConsentButton,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
} as ComponentMeta<typeof CookieConsentButton>;

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template: ComponentStory<typeof CookieConsentButton> = (args) => (
  <CookieConsentButton {...args} />
);

export const Base = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args

Base.args = {
  ...mockCookieConsentButtonProps.base,
} as ICookieConsentButton;
