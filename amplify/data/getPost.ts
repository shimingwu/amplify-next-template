import { util, Context } from "@aws-appsync/utils";

interface GetPostArguments {
  id: string;
}

export function request(ctx: Context<GetPostArguments>) {
  return {
    method: "GET",
    resourcePath: "/posts/" + ctx.arguments.id,
    params: {
      headers: {
        "Content-Type": "application/json",
      },
    },
  };
}

export function response(ctx: Context): any {
  if (ctx.error) {
    return util.error(ctx.error.message, ctx.error.type);
  }
  if (ctx.result.statusCode === 200) {
    return JSON.parse(ctx.result.body).data;
  } else {
    return util.appendError(ctx.result.body, "ctx.result.statusCode");
  }
}