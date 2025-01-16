import { Center, Paper } from '@mantine/core';
import { OllamaModelsContainer } from '@renderer/state/ollama-models';
import { Outlet } from 'react-router-dom';

export function Start() {
  return (
    <OllamaModelsContainer.Provider>
      <Center>
        <Paper>
          <Outlet />
        </Paper>
      </Center>
    </OllamaModelsContainer.Provider>
  );
}
