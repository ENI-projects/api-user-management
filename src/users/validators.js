const Joi = require("@hapi/joi");

module.exports = {
  PutUserPayload: {
    payload: {
      email: Joi.string()
        .email({ 
          tlds: { 
            allow: false 
          }
        })
        .allow("")
        .required(),
      first_name: Joi.string()
        .allow("")
        .required(),
      last_name: Joi.string()
        .allow("")
        .required(),
      id_entreprise: Joi.number()
        .required(),
      address: Joi.string()
        .allow("")
        .required(),
      ville: Joi.string()
        .allow("")
        .required(),
      code_postal: Joi.string()
        .allow("")
        .required(),
      phone: Joi.string()
        .allow("")
        .required()
    }
  }
}