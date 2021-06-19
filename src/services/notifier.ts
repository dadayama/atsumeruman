export interface Notifier {
  notify(...args: unknown[]): Promise<void>
}
