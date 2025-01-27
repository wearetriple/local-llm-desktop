import { Tabs, TabsList } from '@mantine/core';
import { HistoryPanel } from '../history-panel/history-panel';
import { PersonaPanel } from '../personas-panel/persona-panel';
import { KnowledgePanel } from '../knowledge-panel/knowledge-panel';

export function Sidebar() {
  return (
    <Tabs defaultValue="history">
      <TabsList>
        <Tabs.Tab value="history">History</Tabs.Tab>
        <Tabs.Tab value="knowledge">Knowledge</Tabs.Tab>
        <Tabs.Tab value="personas">Personas</Tabs.Tab>
      </TabsList>

      <Tabs.Panel value="history">
        <HistoryPanel />
      </Tabs.Panel>
      <Tabs.Panel value="knowledge">
        <KnowledgePanel />
      </Tabs.Panel>
      <Tabs.Panel value="personas">
        <PersonaPanel />
      </Tabs.Panel>
    </Tabs>
  );
}
