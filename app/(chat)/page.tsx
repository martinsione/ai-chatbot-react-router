import type { Route } from 'types:(chat)/+types.page';
import { LoaderFunctionArgs } from 'react-router';

// import { cookies } from 'next/headers';

import { DEFAULT_MODEL_NAME, models } from '@/ai/models';
import { Chat } from '@/components/custom/chat';
import { convertToUIMessages, generateUUID } from '@/lib/utils';
import { getMessagesByChatId } from '@/db/queries';

export async function loader({ params }: LoaderFunctionArgs) {
  const id = params.id || null;
  const messagesFromDb = id ? await getMessagesByChatId({ id }) : [];

  return {
    initialMessages: convertToUIMessages(messagesFromDb),
  };
}

export default function Page({ loaderData, params }: Route.ComponentProps) {
  const id = params.id || generateUUID();

  // const cookieStore = await cookies();
  // const modelIdFromCookie = cookieStore.get('model-id')?.value;

  // const selectedModelId =
  //   models.find((model) => model.id === modelIdFromCookie)?.id ||
  //   DEFAULT_MODEL_NAME;

  const selectedModelId = DEFAULT_MODEL_NAME;

  return (
    <Chat
      key={id}
      id={id}
      initialMessages={loaderData.initialMessages}
      selectedModelId={selectedModelId}
    />
  );
}
