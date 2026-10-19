/**
 * Zod validation middleware factory.
 * @param {import('zod').ZodSchema} schema - Zod schema to validate req.body against
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return res.status(400).json({ success: false, error: 'Validation failed.', details: errors });
    }
    req.body = result.data;
    next();
  };
};
