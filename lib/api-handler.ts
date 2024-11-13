import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';

export type HTTPVerb = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type Handler = (
  request: Request,
  args: LoaderFunctionArgs | ActionFunctionArgs
) => Promise<Response>;

export function handler({
  GET,
  ...methods
}: Partial<{ [key in HTTPVerb]: Handler }>) {
  return {
    loader: async (args: LoaderFunctionArgs) => {
      if (!GET) {
        return new Response('Method not allowed', { status: 405 });
      }
      return await GET(args.request, args);
    },
    action: async (args: ActionFunctionArgs) => {
      const method = methods[args.request.method as Exclude<HTTPVerb, 'GET'>];
      if (!method) {
        return new Response('Method not allowed', { status: 405 });
      }
      return await method(args.request, args);
    },
  };
}
