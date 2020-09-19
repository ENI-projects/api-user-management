const { getAdminEntrepriseId, getUsersIdInCompany, parseUserResponse, decodeJwt, deleteUserInHasura } = require('./functions.js');
const { connectToAdminCLI, connectToHasura, loadUserInfo, deleteUser } = require('../keycloak/functions.js')

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
    const id_entreprise = getAdminEntrepriseId(req.headers.authorization);
    
    const userData = {
      email: req.payload.email,
      first_name: req.payload.first_name,
      last_name: req.payload.last_name,
      id_entreprise: id_entreprise,
      address: req.payload.adress,
      ville: req.payload.ville,
      code_postal: req.payload.code_postal,
      phone: req.payload.phone,
    };

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