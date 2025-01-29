import { shell } from 'electron';

export async function openFileInOS(filePath: string) {
  await shell.openPath(filePath);
}
