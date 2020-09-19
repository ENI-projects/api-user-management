const UserController =  require('./controller');

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
    //update users
    method: 'PUT',
    path: '/user/{id}',
    handler: UserController.update
  },
  {
    /*
      Recieve a post request with :
      header : authorization = value of the JWT of the user calling the API
      payload : the user to insert with following format :
      {
        email: $email
        name: $value
        surename: $surename
        id_entreprise: $id_entreprise
        adresse: $adresse
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