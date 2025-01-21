import { Avatar } from '@mantine/core';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function nameToColor(name: string): string {
  let hash = 0;
  for (let iter = 0; iter < name.length; iter++) {
    hash = (name.codePointAt(iter) ?? 0) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 60%)`;
}

export function NameAvatar({ name }: { name: string }) {
  return (
    <Avatar size="md" radius="xl" color={nameToColor(name)}>
      {getInitials(name)}
    </Avatar>
  );
}
