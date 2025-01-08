import {
  AppShell,
  Burger,
  createTheme,
  Group,
  MantineProvider,
  Skeleton,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Router from './components/router';
import { OllamaContainer } from './state/ollama';

const theme = createTheme({});

function App(): JSX.Element {
  const [opened, { toggle }] = useDisclosure();
  const { online } = OllamaContainer.useContainer();
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Text className="is-pulled-right">{online ? 'Online' : 'Offline'}</Text>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        Navbar
        {Array.from({ length: 15 })
          .fill(0)
          .map((_, index) => (
            <Skeleton key={index} h={28} mt="sm" animate={false} />
          ))}
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
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <App />
      </MantineProvider>
    </OllamaContainer.Provider>
  );
}
