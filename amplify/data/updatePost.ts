import { util, Context } from "@aws-appsync/utils";

interface UpdatePostArguments {
  id: string;
  title: string;
  content: string;
  author: string;
}

export function request(ctx: Context<UpdatePostArguments>) {
  return {
    method: "POST",
    resourcePath: "/posts/" + ctx.arguments.id,
    params: {
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        title: ctx.arguments.title,
        content: ctx.arguments.content,
        author: ctx.arguments.author,
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