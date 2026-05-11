import { createSwaggerSpec } from "next-swagger-doc";

const URL_PARSE_DEPRECATION_CODE = "DEP0169";

function ignoreSwaggerUrlParseWarning<T>(callback: () => T): T {
  const emitWarning = process.emitWarning;

  process.emitWarning = ((warning, ...args) => {
    const [typeOrOptions, code] = args;
    const warningCode =
      typeof typeOrOptions === "object" && typeOrOptions !== null
        ? typeOrOptions.code
        : code;

    if (warningCode === URL_PARSE_DEPRECATION_CODE) {
      return;
    }

    return Reflect.apply(emitWarning, process, [warning, ...args]);
  }) as typeof process.emitWarning;

  try {
    return callback();
  } finally {
    process.emitWarning = emitWarning;
  }
}

export const getApiDocs = async () => {
  const spec = ignoreSwaggerUrlParseWarning(() =>
    createSwaggerSpec({
      apiFolder: "src/app/api",
      definition: {
        openapi: "3.0.0",
        info: {
          title: "Athletic Agency API Documentation",
          version: "1.0",
        },
        components: {
          securitySchemes: {
            BearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
            },
          },
        },
        security: [],
      },
    }),
  );
  return spec;
};
