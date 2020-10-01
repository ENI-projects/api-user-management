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
    method: 'POST',
    path: '/user/create',
    handler: UserController.create,
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