export function validateBody(schema) {
  return function (req, res, next) {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ source:'Payload Validation' , message: error.details[0].message });
    }
    next();
  };
}
