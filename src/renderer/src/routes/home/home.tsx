import { Button, Notification, Text } from '@mantine/core';
import { OllamaContainer } from '@renderer/state/ollama';
import { ERROR_OLLAMA_NOT_FOUND } from '@shared/api-ipc/ollama';
import { useNavigate } from 'react-router-dom';
import { ApiIpcError } from '@shared/api-ipc/error';
import { useEffect, useState } from 'react';
import { ConfigurationContainer } from '@renderer/state/configuration';

export default function Home() {
  const { online, refresh, areAllRequiredModelsAvailable } = OllamaContainer.useContainer();
  const [displayError, setDisplayError] = useState('');
  const [startLoader, setStartLoader] = useState<boolean>(false);
  const { configuration } = ConfigurationContainer.useContainer();

  const navigate = useNavigate();

  const startOllama = async () => {
    setStartLoader(true);
    try {
      await window.api.startOllamaServer();
      await refresh();
    } catch (error) {
      if (error instanceof ApiIpcError && error.code === ERROR_OLLAMA_NOT_FOUND) {
        await navigate('/ollama/install');
        return;
      }
      setDisplayError(
        'Could not start ollama server, please check your ollama installation, try it manually and try again.',
      );
    } finally {
      setStartLoader(false);
    }
  };

  useEffect(() => {
    if (configuration === undefined || !online) {
      return;
    }
    if (configuration === null) {
      void navigate('/configure');
      return;
    }

    if (!areAllRequiredModelsAvailable()) {
      void navigate('/download');
      return;
    }

    void navigate('/chat');
  }, [configuration, online, areAllRequiredModelsAvailable]);

  return (
    <>
      {displayError && <Notification color="red">{displayError}</Notification>}
      <Text>Ollama is {online ? 'available' : 'not available'}</Text>
      {!online && (
        <Button loading={startLoader} disabled={startLoader} onClick={() => void startOllama()}>
          Start Ollama
        </Button>
      )}
    </>
  );
}
