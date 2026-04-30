import { NextResponse } from "next/server";

export type ApiErrorBody = { status: false; message: string };
export type ApiOkBody<T> = { status: true; data: T };

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ status: true, data } satisfies ApiOkBody<T>, init);
}

export function jsonError(message: string, status: number = 400) {
  return NextResponse.json(
    { status: false, message } satisfies ApiErrorBody,
    { status }
  );
}

export function notImplemented() {
  return jsonError("Not implemented yet", 501);
}
