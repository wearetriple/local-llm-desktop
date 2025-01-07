import { AppShell, Burger, createTheme, Group, MantineProvider, Skeleton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Router from './components/router';

const theme = createTheme({});

export default function App(): JSX.Element {
  const [opened, { toggle }] = useDisclosure();
  return (
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <AppShell
        header={{ height: 60 }}
        navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
        padding="md"
      >
        <AppShell.Header>
          <Group h="100%" px="md">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
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
    </MantineProvider>
  );
}
