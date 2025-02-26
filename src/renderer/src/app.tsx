import { createTheme, MantineProvider } from '@mantine/core';
import Router from './components/router';
import { OllamaContainer } from './state/ollama';
import { ConversationHistoryProvider } from './state/conversation-history';
import { ConfigurationContainer } from './state/configuration';
import { isDevelopment } from './core/utils/is-devevelopment';
import { init } from '@sentry/electron/renderer';
import { init as reactInit } from '@sentry/react';

const theme = createTheme({});

function App(): JSX.Element {
  return <Router />;
}

if (!isDevelopment()) {
  init(
    {
      dsn: 'https://7ce24a3e38e7693396017ad1756f035b@sentry.wearetriple.com/87',
    },
    // @ts-expect-error According to the docs, this is the correct way to initialize Sentry for React within Electron renderer
    reactInit,
  );
}

export default function AppWrapper() {
  return (
    <ConfigurationContainer.Provider>
      <OllamaContainer.Provider>
        <ConversationHistoryProvider.Provider>
          <MantineProvider theme={theme} defaultColorScheme="auto">
            <App />
          </MantineProvider>
        </ConversationHistoryProvider.Provider>
      </OllamaContainer.Provider>
    </ConfigurationContainer.Provider>
  );
}
