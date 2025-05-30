export const validateBody = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ status:'Body Validation' , message: error.details[0].message });
  next();
};