import { Button, Text } from '@mantine/core';
import { logger } from '@renderer/core/logger';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function OllamaInstall() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkInterval = setInterval(() => {
      (async function () {
        try {
          if (await window.api.checkOllamaExists()) {
            void navigate('/ollama/configure');
          }
        } catch (error) {
          logger('Failed to check ollama', error);
        }
      })();
    }, 5000);

    return () => clearTimeout(checkInterval);
  }, []);

  return (
    <>
      <Text>We could not detect ollama on your system.</Text>
      <Button component="a" href="https://www.ollama.com" target="_blank">
        Download from ollama.com
      </Button>
    </>
  );
}
