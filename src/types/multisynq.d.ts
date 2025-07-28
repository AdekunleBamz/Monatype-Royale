import { Model, Session } from '@multisynq/client';

declare module '@multisynq/client' {
  interface Session<T extends Model> {
    id: string;
    isConnected: boolean;
    publish(channel: string, event: string, payload: any): void;
    leave(): void;
  }
}
