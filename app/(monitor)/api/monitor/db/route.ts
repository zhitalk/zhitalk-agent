import "server-only";

import { getFirstChatId } from "@/lib/db/queries";

export async function POST() {
  try {
    const id = await getFirstChatId();

    if (!id) {
      return Response.json({ errno: -1 });
    }

    return Response.json({ errno: 0, data: { id } });
  } catch (_error) {
    return Response.json({ errno: -1 });
  }
}

