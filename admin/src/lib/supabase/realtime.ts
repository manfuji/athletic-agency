import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

export type PostgresChangesFilter = {
  schema?: string;
  table: string;
  filter?: string;
  event?: "*" | "INSERT" | "UPDATE" | "DELETE";
};

/**
 * Subscribe to Postgres changes. Unsubscribe with {@link unsubscribeRealtimeChannel}.
 */
export function subscribeToPostgresChanges(
  client: SupabaseClient,
  opts: PostgresChangesFilter,
  onPayload: (payload: unknown) => void
): RealtimeChannel {
  const schema = opts.schema ?? "public";
  const event = opts.event ?? "*";
  const channelName = `rt:${schema}:${opts.table}:${crypto.randomUUID()}`;

  return client
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event,
        schema,
        table: opts.table,
        filter: opts.filter,
      },
      (payload) => onPayload(payload)
    )
    .subscribe();
}

export function unsubscribeRealtimeChannel(
  client: SupabaseClient,
  channel: RealtimeChannel
) {
  client.removeChannel(channel);
}
