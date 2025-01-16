import { createTheme, MantineProvider } from '@mantine/core';
import Router from './components/router';
import { OllamaContainer } from './state/ollama';
import { ConversationHistoryProvider } from './state/conversation-history';
import { ConfigurationContainer } from './state/configuration';

const theme = createTheme({});

function App(): JSX.Element {
  return <Router />;
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
