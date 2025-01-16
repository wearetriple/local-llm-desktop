import { Code } from '@mantine/core';

import { ActionIcon, Box, CopyButton, Tooltip } from '@mantine/core';

export function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <Box pos="relative">
      <CopyButton value={children?.toString() ?? ''} timeout={2000}>
        {({ copied, copy }) => (
          <Tooltip label={copied ? 'Copied' : 'Copy'} position="left">
            <ActionIcon
              pos="absolute"
              top={8}
              right={8}
              variant="subtle"
              onClick={copy}
              color={copied ? 'teal' : 'gray'}
            >
              {copied ? '☑' : '☐'}
            </ActionIcon>
          </Tooltip>
        )}
      </CopyButton>
      <Code block>{children}</Code>
    </Box>
  );
}
