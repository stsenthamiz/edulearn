exports.validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            allowUnknown: true, // Allow fields not defined in schema to pass through
            stripUnknown: true // Remove unknown fields
        });

        if (error) {
            const errorMessages = error.details.map((detail) => detail.message);
            return res.status(400).json({
                status: 'fail',
                message: 'Validation Error',
                errors: errorMessages
            });
        }

        // Replace req.body with validated value (strips unknown params)
        req.body = value;
        next();
    };
};
