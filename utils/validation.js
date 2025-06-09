const Joi = require('joi');

const signupValidation = data => Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
}).validate(data);

const loginValidation = data => Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
}).validate(data);

const bookValidation = data => Joi.object({
    title: Joi.string().required(),
    author: Joi.string().required(),
    genre: Joi.string().required(),
    description: Joi.string().required(),
    publishedYear: Joi.number().integer().min(1000).max(new Date().getFullYear()).required(),
    isbn: Joi.string().optional()
}).validate(data);

const reviewValidation = data => Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().max(1000).required()
}).validate(data);

module.exports = { signupValidation, loginValidation, bookValidation, reviewValidation };