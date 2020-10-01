const UserController =  require('./controller');
const validators = require('./validators');

module.exports = [
  {
    //get user params for for admin entreprise
    method: 'GET',
    path: '/user/{id}',
    handler: UserController.get,
    config: {
      description: "protected endpoint",
      cors: {
        origin: ["*"]
      },
      auth: {
        strategies: ["keycloak-jwt"],
        access: {
          scope: ["armadacar-frontend-app:adminentreprise", "entreprise-management-ui:entreprise-management-admin"]
        }
      }
    }
  },
  {
    //get list users params
    method: 'GET',
    path: '/users',
    handler: UserController.list,
    config: {
      description: "protected endpoint",
      cors: {
        origin: ["*"]
      },
      auth: {
        strategies: ["keycloak-jwt"],
        access: {
          scope: ["armadacar-frontend-app:adminentreprise"]
        }
      }
    }
  },
  {
    /*
      Recieve a post request with :
      header : authorization = value of the JWT of the user calling the API
      payload : the user to insert with following format :
      {
        email: $email
        first_name: $last_name
        last_name: $last_name
        id_entreprise: $id_entreprise
        adress: $adress
        ville: $ville
        code_postal: $code_postal
        phone: $phone
      }
    */
    //update users
    method: 'PUT',
    path: '/user/{id}',
    handler: UserController.update,
    config: {
      description: "protected endpoint",
      cors: {
        origin: ["*"]
      },
      auth: {
        strategies: ["keycloak-jwt"],
        access: {
          scope: ["armadacar-frontend-app:adminentreprise", "entreprise-management-ui:entreprise-management-admin"]
        }
      },
      validate: validators.PutUserPayload
    }
  },
  {
    /*
      Recieve a post request with :
      header : authorization = value of the JWT of the user calling the API
      payload : the user to insert with following format :
      {
        email: $email
        last_name: $value
        first_name: $value
        id_entreprise: $id_entreprise
        address: $adress
        ville: $ville
        code_postal: $code_postal
        phone: $phone
      }
    */
    method: 'POST',
    path: '/user',
    handler: UserController.create
  },
  {
    //delete user
    method: 'DELETE',
    path: '/user/{id}',
    handler: UserController.remove,
    config: {
      description: "protected endpoint",
      cors: {
        origin: ["*"]
      },
      auth: {
        strategies: ["keycloak-jwt"],
        access: {
          scope: ["armadacar-frontend-app:adminentreprise", "entreprise-management-ui:entreprise-management-admin"]
        }
      }
    }
  }
];