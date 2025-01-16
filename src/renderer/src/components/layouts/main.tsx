import { AppShell, Burger, Group, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { OllamaContainer } from '../../state/ollama';
import { Sidebar } from '../organisms/side-bar/side-bar';
import { Outlet } from 'react-router-dom';

export function Main() {
  const [opened, { toggle }] = useDisclosure(true);
  const { online } = OllamaContainer.useContainer();

  return (
    <AppShell
      layout="alt"
      header={{ height: 60 }}
      navbar={{ width: 350, breakpoint: 'sm', collapsed: { mobile: !opened, desktop: !opened } }}
      padding={0}
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
      <AppShell.Main style={{ display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
