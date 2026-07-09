const Joi = require("joi");

const correct = Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().required(),
    image: Joi.string().allow("", null),
    price: Joi.number().min(0).required(),
    location: Joi.string().required(),
    country: Joi.string().required()
});

// const correctreview=Joi.object({
//     comment:Joi.string().required(),
//     rating:Joi.number().min(1).max(5),
// });

const correctreview = Joi.object({
    comment: Joi.string().required(),
    rating: Joi.number().min(1).max(5).required(),
});

module.exports = {
    correct,
    correctreview,
};