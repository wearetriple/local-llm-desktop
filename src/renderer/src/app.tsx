import { AppShell, Burger, createTheme, Group, MantineProvider, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Router from './components/router';
import { OllamaContainer } from './state/ollama';
import { Sidebar } from './components/organisms/side-bar/side-bar';
import { ConversationHistoryProvider } from './state/conversation-history';

const theme = createTheme({});

function App(): JSX.Element {
  const [opened, { toggle }] = useDisclosure(true);
  const { online } = OllamaContainer.useContainer();
  return (
    <AppShell
      layout="alt"
      header={{ height: 60 }}
      navbar={{ width: 350, breakpoint: 'sm', collapsed: { mobile: !opened, desktop: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          {!opened && <Burger opened={opened} onClick={toggle} size="sm" />}
          <Text className="is-pulled-right">{online ? 'Online' : 'Offline'}</Text>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <Burger opened={opened} onClick={toggle} size="sm" mb="md" />
        <Sidebar />
      </AppShell.Navbar>
      <AppShell.Main>
        <Router />
      </AppShell.Main>
    </AppShell>
  );
}

export default function AppWrapper() {
  return (
    <OllamaContainer.Provider>
      <ConversationHistoryProvider.Provider>
        <MantineProvider theme={theme} defaultColorScheme="auto">
          <App />
        </MantineProvider>
      </ConversationHistoryProvider.Provider>
    </OllamaContainer.Provider>
  );
}
