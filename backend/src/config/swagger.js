import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: { title: "Dhansetu API", version: "1.0.0", description: "Dhansetu loan-eligibility platform API." },
    servers: [{ url: "/api" }],
    components: { securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } } },
    paths: {
      "/auth/beneficiary-login": { post: { summary: "Beneficiary login", responses: { 200: { description: "Authenticated" }, 429: { description: "Rate limited" } } } },
      "/auth/officer-login": { post: { summary: "Officer or channel-partner login", responses: { 200: { description: "Authenticated" }, 429: { description: "Rate limited" } } } },
      "/uploads/document": { post: { summary: "Upload a verified PDF, JPEG, or PNG document", security: [{ bearerAuth: [] }], responses: { 201: { description: "Uploaded" }, 415: { description: "Unsupported file type" }, 422: { description: "Infected document" }, 503: { description: "Scanner unavailable" } } } },
    },
  },
  apis: [],
});
