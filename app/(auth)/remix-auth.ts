import type { AuthConfig } from '@auth/core';
import type { Session } from '@auth/core/types';
import {
  Auth,
  createActionURL,
  setEnvDefaults,
  skipCSRFCheck,
} from '@auth/core';

import type { LoaderFunctionArgs, ActionFunctionArgs } from 'react-router';
import { redirect } from 'react-router';
import { BuiltInProviderType, ProviderType } from '@auth/core/providers';

function getEnv(args: LoaderFunctionArgs | ActionFunctionArgs) {
  return args.context?.cloudflare?.env || {};
}

export function RemixAuth(authConfig: AuthConfig) {
  const handlers = {
    loader: async ({ request, params, context }: LoaderFunctionArgs) => {
      setEnvDefaults(getEnv(context), authConfig);
      authConfig.basePath = getBasePath({ request, params });
      return await Auth(request, authConfig as AuthConfig);
    },

    action: async ({ request, params, context = {} }: ActionFunctionArgs) => {
      setEnvDefaults(getEnv(context), authConfig);
      authConfig.basePath = getBasePath({ request, params });
      return await Auth(request, authConfig as AuthConfig);
    },
  };

  const getCsrfToken = async ({
    request,
    context,
  }: Omit<
    LoaderFunctionArgs | ActionFunctionArgs,
    'params'
  >): Promise<Response> => {
    setEnvDefaults(getEnv(context), authConfig);
    const url = createActionURL(
      'csrf',
      request.headers.get('x-forwarded-proto') ?? new URL(request.url).protocol,
      request.headers,
      getEnv(context),
      authConfig
    );

    const response = await Auth(new Request(url), authConfig as AuthConfig);

    if (!response.ok) {
      throw new Error((await response.json()).message);
    }
    return response;
  };

  const auth = async (
    args: Request | Omit<LoaderFunctionArgs | ActionFunctionArgs, 'params'>
  ): GetSessionResult => {
    const request = args instanceof Request ? args : args.request;
    const env = args instanceof Request ? {} : args.context;
    setEnvDefaults(getEnv(env), authConfig);
    const url = createActionURL(
      'session',
      request.headers.get('x-forwarded-proto') ?? new URL(request.url).protocol,
      request.headers,
      env,
      authConfig
    );

    const response = await Auth(
      new Request(url, {
        headers: { cookie: request.headers.get('cookie') ?? '' },
      }),
      authConfig as AuthConfig
    );

    const { status = 200 } = response;

    const data = await response.json();

    if (!data || !Object.keys(data).length) return null;
    if (status === 200) return data as Session;
    throw new Error((data as Error).message);
  };

  const signIn = async (
    {
      request,
      context,
    }: Omit<LoaderFunctionArgs | ActionFunctionArgs, 'params'>,
    provider?: BuiltInProviderType,
    options: { redirectTo?: string } & Record<string, unknown> = {},
    authorizationParams?:
      | string[][]
      | Record<string, string>
      | string
      | URLSearchParams
  ) => {
    setEnvDefaults(getEnv(context), authConfig);
    const headers = new Headers(request.headers);
    const { redirectTo } = options;

    const callbackUrl = redirectTo?.toString() ?? headers.get('Referer') ?? '/';
    const signInURL = createActionURL(
      'signin',
      headers.get('x-forwarded-proto') ?? new URL(request.url).protocol,
      headers,
      getEnv(context),
      authConfig
    );

    if (!provider) {
      signInURL.searchParams.append('callbackUrl', callbackUrl);
      return redirect(signInURL.toString());
    }

    let url = `${signInURL}/${provider}?${new URLSearchParams(
      authorizationParams
    )}`;
    let foundProvider: { id?: BuiltInProviderType; type?: ProviderType } = {};

    for (const providerConfig of authConfig.providers) {
      const { options, ...defaults } =
        typeof providerConfig === 'function'
          ? providerConfig()
          : providerConfig;
      const id = (options?.id as string | undefined) ?? defaults.id;
      if (id === provider) {
        foundProvider = {
          id,
          type: (options?.type as ProviderType | undefined) ?? defaults.type,
        };
        break;
      }
    }

    if (!foundProvider.id) {
      const url = `${signInURL}?${new URLSearchParams({ callbackUrl })}`;
      return redirect(url);
    }

    if (foundProvider.type === 'credentials') {
      url = url.replace('signin', 'callback');
    }

    headers.set('Content-Type', 'application/x-www-form-urlencoded');
    const body = new URLSearchParams({
      ...Object.fromEntries(await request.clone().formData()),
      callbackUrl,
    });
    const newReq = new Request(url, { method: 'POST', headers, body });
    const res = await Auth(newReq, { ...authConfig, skipCSRFCheck });

    // if (res.status === 302) {
    //   throw redirect(res.headers.get('Location')!, { headers: res.headers });
    // }
    return res;
  };

  const signOut = async (
    {
      request,
      context,
    }: Omit<LoaderFunctionArgs | ActionFunctionArgs, 'params'>,
    options: { redirectTo?: string } = {}
  ) => {
    setEnvDefaults(getEnv(context), authConfig);
    const headers = new Headers(request.headers);
    headers.set('Content-Type', 'application/x-www-form-urlencoded');

    const url = createActionURL(
      'signout',
      headers.get('x-forwarded-proto') ?? new URL(request.url).protocol,
      headers,
      context.cloudflare.env,
      authConfig
    );
    const callbackUrl = options?.redirectTo ?? headers.get('Referer') ?? '/';
    const body = new URLSearchParams({
      ...Object.fromEntries(await request.clone().formData()),
      callbackUrl,
    });
    const newReq = new Request(url, { method: 'POST', headers, body });

    const res = await Auth(newReq, { ...authConfig });

    return res;
  };

  return { handlers, auth, getCsrfToken, signIn, signOut };
}

export type GetSessionResult = Promise<Session | null>;

export function getBasePath({
  request,
  params,
}: Omit<LoaderFunctionArgs | ActionFunctionArgs, 'context'>) {
  const url = new URL(request.url);
  const [firstParams] = Object.values(params);
  if (!firstParams) {
    throw new Error('Value of first params is undefined');
  }
  return url.pathname.split(firstParams[0])[0].replace(/\/$/, '');
}
