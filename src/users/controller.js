const { getAdminEntrepriseId, getUsersIdInCompany, parseUserResponse, decodeJwt, deleteUserInHasura, createUserInHasura } = require('./functions.js');
const { connectToAdminCLI, connectToHasura, loadUserInfo, deleteUser, createUser, searchByEmail } = require('../keycloak/functions.js');

module.exports = {
  list: async (req, h) => {
    const bearerToken = req.headers.authorization.replace('Bearer ', '');
    //define a list which will be enhanced during the function
    const listOfParsedUsersInCompany = getAdminEntrepriseId(bearerToken).then((res) => {
      return res.data.armadacar_utilisateurs[0].id_entreprise;
    }).then((id_entreprise) => {
      //gets the list of the users in the company which the caller is in
      return connectToHasura().then((hasuraTokens) => {
        return getUsersIdInCompany(hasuraTokens.access_token, id_entreprise)
      })
    }).then((usersId) => {
      //gets all the users infos from keycloak
      return connectToAdminCLI().then((kcTokens) => {
        return usersId.map((user) => loadUserInfo(kcTokens.access_token, user.id))
      });
    }).then((promiseUsers) => {
      //format the users we got from keycloak
      return Promise.all(promiseUsers).then((allCompanyUsers) => {
        return allCompanyUsers.map((user) => { 
          return parseUserResponse(user);
        });
      });
    })
    //returns the formatted list
    return h.response((await listOfParsedUsersInCompany)).code(200);
  },
  get: async (req, h) => {
    const bearerToken = req.headers.authorization.replace('Bearer ', '');
    //if the user is a startfleet manager :
    if (typeof decodeJwt(bearerToken).resource_access["entreprise-management-ui"] !== "undefined") {
      const queryResult = await connectToAdminCLI().then((kcTokens) => {
        return loadUserInfo(kcTokens.access_token, req.params.id);
      });
      if (typeof queryResult.code !== 'undefined'){
        return h.response(queryResult.message).code(queryResult.code);
      } else {
        return h.response(parseUserResponse(queryResult)).code(200);
      }
    } else {
    //else : the user is a company manager
      const usersInCompany = await getAdminEntrepriseId(bearerToken).then((res) => {
        return res.data.armadacar_utilisateurs[0].id_entreprise;
      }).then((id_entreprise) => {
        return connectToHasura().then((hasuraTokens) => {
          return getUsersIdInCompany(hasuraTokens.access_token, id_entreprise)
        })
      })
      if (typeof usersInCompany !== 'undefined'){
        if (usersInCompany.filter(user => user.id == req.params.id).length > 0){
          const userInfos = await connectToAdminCLI().then((kcTokens) => {
            return loadUserInfo(kcTokens.access_token, req.params.id);
          });
          return h.response(parseUserResponse(userInfos)).code(200);
        } else {
          return h.response("Not Found").code(404);
        }
      } else {
        return h.response(usersInCompany.message).code(usersInCompany.code)
      }
    }
  },
  update: (req, h) => {
    const id = req.params.id;
    const id_entreprise = getAdminEntrepriseId(req.headers.authorization);
  },
  create: (req, h) => {
    const bearerToken = req.headers.authorization.replace('Bearer ', '');
    const id_entreprise = getAdminEntrepriseId(bearerToken).then((res) => {
      return res.data.armadacar_utilisateurs[0].id_entreprise;
    })
    const userData = {
      username: req.payload.email,
      email: req.payload.email,
      firstName: req.payload.first_name,
      lastName: req.payload.last_name,
      attributes: [
        { address : req.payload.address },
        { ville : req.payload.ville },
        { code_postal : req.payload.code_postal },
        { phone : req.payload.phone },  
      ],
      clientRoles: [
        {"armadacar-frontend-app":"user"},
        {"hasura-keycloak-connector": "user"}          
      ]
    };    
    // create the user in keycloak
    const queryResult = connectToAdminCLI().then((kcTokens) => {
      return createUser(kcTokens.access_token, userData);
    });
    //check the result of the delete function
    if (typeof queryResult.code !== 'undefined'){
      return h.response(queryResult.message).code(queryResult.code);
    } else {
      //if okay, get id User In Keycloak before of to create in hasura
      const idUser = connectToAdminCLI().then((kcTokens) => {
        return searchByEmail(kcTokens.access_token, req.payload.email)
      }).then((promiseUser) => {
        return Promise.all(promiseUser).then((userFound) => {
          return userFound.id
        });
      });
      //if okay, create in hasura
      // const isUserCreated = connectToHasura().then((hasuraTokens) => {
      //   return createUserInHasura(hasuraTokens.access_token, idUser, id_entreprise );
      // });
      // return isUserCreated.affected_rows ? h.response().code(204): h.response(isUserCreated.msg).code(500);
      return idUser
    }  
  },
  remove: async (req, h) => {
    const bearerToken = req.headers.authorization.replace('Bearer ', '');
    //if the user is a startfleet manager :
    if (typeof decodeJwt(bearerToken).resource_access["entreprise-management-ui"] !== "undefined") {
      const queryResult = await connectToAdminCLI().then((kcTokens) => {
        return deleteUser(kcTokens.access_token, req.params.id);
      });
      if (typeof queryResult.code !== 'undefined'){
        return h.response(queryResult.message).code(queryResult.code);
      } else {
        //if okay, deletes in hasura
        const isUserDeleted = await connectToHasura().then((hasuraTokens) => {
          return deleteUserInHasura(hasuraTokens.access_token, req.params.id);
        });
        return isUserDeleted.affected_rows ? h.response().code(204): h.response(isUserDeleted.msg).code(500);
      }
    } else {
      //else : the user is a company manager
      const usersInCompany = await getAdminEntrepriseId(bearerToken).then((res) => {
        return res.data.armadacar_utilisateurs[0].id_entreprise;
      }).then((id_entreprise) => {
        return connectToHasura().then((hasuraTokens) => {
          return getUsersIdInCompany(hasuraTokens.access_token, id_entreprise)
        })
      });
      if (typeof usersInCompany !== 'undefined'){
        // check if the user is in the company of the caller
        if (usersInCompany.filter(user => user.id == req.params.id).length > 0){
          // delete the user in keycloak
          const queryResult = await connectToAdminCLI().then((kcTokens) => {
            return deleteUser(kcTokens.access_token, req.params.id);
          });
          //check the result of the delete function
          if (typeof queryResult.code !== 'undefined'){
            return h.response(queryResult.message).code(queryResult.code);
          } else {
            //if okay, deletes in hasura
            const isUserDeleted = await connectToHasura().then((hasuraTokens) => {
              return deleteUserInHasura(hasuraTokens.access_token, req.params.id);
            });
            return isUserDeleted.affected_rows ? h.response().code(204): h.response(isUserDeleted.msg).code(500);
          }
        } else {
          return h.response("Not Found").code(404);
        }
      } else {
        return h.response(usersInCompany.message).code(usersInCompany.code)
      }
    }
  }
}