import { AppShell, Box, Burger, Group, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { OllamaContainer } from '../../state/ollama';
import { Sidebar } from '../organisms/side-bar/side-bar';
import { Outlet } from 'react-router-dom';
import { PersonasContainer } from '@renderer/state/personas';
import { KnowledgeContainer } from '@renderer/state/knowledge';
import { HypersolidIconBlack } from '../atom/hypersolid-icon-black';

export function Main() {
  const [opened, { toggle }] = useDisclosure(true);
  const { online } = OllamaContainer.useContainer();

  return (
    <PersonasContainer.Provider>
      <KnowledgeContainer.Provider>
        <AppShell
          layout="alt"
          header={{ height: 60 }}
          navbar={{
            width: 350,
            breakpoint: 'sm',
            collapsed: { mobile: !opened, desktop: !opened },
          }}
          padding={0}
        >
          <AppShell.Header>
            <Group h="100%" px="md">
              <Group justify="space-between" style={{ width: '100%' }}>
                <Group>
                  {!opened && <Burger opened={opened} onClick={toggle} size="sm" />}
                  <Text className="is-pulled-right">{online ? 'Online' : 'Offline'}</Text>
                </Group>
                <Box>
                  <a
                    href="https://www.hypersolid.com/"
                    target="_blank"
                    title="Created at Hypersolid"
                    rel="noreferrer"
                  >
                    <HypersolidIconBlack size={24} />
                  </a>
                </Box>
              </Group>
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
      </KnowledgeContainer.Provider>
    </PersonasContainer.Provider>
  );
}
