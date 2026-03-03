/**
 * Validation middleware factory
 */
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const data = {
        body: req.body,
        query: req.query,
        params: req.params,
      };

      const result = schema.parse(data);

      // Replace req properties with validated data
      if (result.body) req.body = result.body;
      if (result.query) req.query = result.query;
      if (result.params) req.params = result.params;

      next();
    } catch (error) {
      next(error);
    }
  };
};

