import type { Preview } from '@storybook/react';
import React from 'react';
import '../src/styles.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'antigravity',
      values: [
        {
          name: 'antigravity',
          value: '#0b0f1a',
        },
      ],
    },
  },
  decorators: [
    (Story, context) => React.createElement(
      'div',
      {
        className: 'dark',
        style: {
          height: '100%',
          width: '100%',
          
          
          color: '#e2e8f0',
          padding: context.parameters.layout === 'centered' ? '0' : '2rem',
          display: context.parameters.layout === 'centered' ? 'flex' : 'block',
          alignItems: context.parameters.layout === 'centered' ? 'center' : 'flex-start',
          justifyContent: context.parameters.layout === 'centered' ? 'center' : 'flex-start',
        },
      },
      React.createElement(Story)
    ),
  ],
};

export default preview;
