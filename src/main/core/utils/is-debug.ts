export function isDebug(): boolean {
  return process.env.NODE_ENV === 'development';
}
