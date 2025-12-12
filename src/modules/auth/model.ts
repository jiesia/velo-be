import { t } from "elysia";

export namespace AuthModel {
  // sign-up DTO validation schema
  export const signUpBody = t.Object({
    email: t.String({ format: "email" }),
    password: t.String({ minLength: 8 }),
  });

  // sign-up request body type
  export type signUpBody = typeof signUpBody.static;

  // sign-in DTO validation schema
  export const signInBody = t.Object({
    email: t.String({ format: "email" }),
    password: t.String({ minLength: 8 }),
  });

  // sign-in request body type
  export type signInBody = typeof signInBody.static;
}
