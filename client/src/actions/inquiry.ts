"use server";

import { Inquiry } from "@/types/inquiry";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendInquiry(body: Inquiry): Promise<any> {
  try {
    const response = await fetch(`${process.env.FORMSPREE_ENDPOINT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData };
    }

    const data = await response.json();
    return data;
  } catch (err) {
    return { error: (err as Error).message || "Failed to send inquiry" };
  }
}
