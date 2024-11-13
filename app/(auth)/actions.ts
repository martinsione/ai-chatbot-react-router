"use server";

import { z } from "zod";
import { ActionFunctionArgs } from "react-router";

import { createUser, getUser } from "@/db/queries";

import { signIn } from "./auth";

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export interface LoginActionState {
  status: "idle" | "in_progress" | "success" | "failed" | "invalid_data";
  headers?: Headers;
}

export const login = async (
  args: ActionFunctionArgs
): Promise<LoginActionState> => {
  try {
    const formData = await args.request.clone().formData();
    const { email, password } = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const res = await signIn(args, "credentials", {
      email,
      password,
      redirectTo: '/'
    });

    return { status: "success", headers: res.headers };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    return { status: "failed" };
  }
};

export interface RegisterActionState {
  status:
    | "idle"
    | "in_progress"
    | "success"
    | "failed"
    | "user_exists"
    | "invalid_data";
  headers?: Headers;
}

export const register = async (
  args: ActionFunctionArgs
): Promise<RegisterActionState> => {
  try {
    const formData = await args.request.clone().formData();
    const { email, password } = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    let [user] = await getUser(email);

    if (user) {
      return { status: "user_exists" } as RegisterActionState;
    } else {
      await createUser(email, password);
      const res = await signIn(args, "credentials", {
        email,
        password,
        redirectTo: '/'
      });

      return { status: "success", headers: res.headers };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: "invalid_data" };
    }

    console.log('error', error);
    return { status: "failed" };
  }
};
