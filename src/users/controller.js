const { getAdminEntrepriseId, getUsersIdInCompany, parseUserResponse, decodeJwt, deleteUserInHasura, getUserInHasuraById, insertUserInHasura } = require('./functions.js');
const { connectToAdminCLI, connectToHasura, loadUserInfo, deleteUser, modifyUserInfos, searchByEmail, createUserInKc, addUserArmadacarRole } = require('../keycloak/functions.js')

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
  update: async (req, h) => {
    const bearerToken = req.headers.authorization.replace('Bearer ', '');
    //gets the id of the company of the caller if the caller is a armadacar user
    let continueComputing = false;
    if (typeof decodeJwt(bearerToken).resource_access["entreprise-management-ui"] == "undefined") {
      //and verify if the caller is modying a user in his company
      const usersInCompany = await getAdminEntrepriseId(bearerToken).then((res) => {
        return res.data.armadacar_utilisateurs[0].id_entreprise;
      }).then((id_entreprise) => {
        return connectToHasura().then((hasuraTokens) => {
          return getUsersIdInCompany(hasuraTokens.access_token, id_entreprise)
        })
      });
      if (usersInCompany.filter(user => user.id == req.params.id).length > 0){
        continueComputing = true;
      }
    } else {
      //verify if the user to modify stays in the same company
      const user = await getUserInHasuraById(bearerToken, req.params.id).then((res) => {
        return res;
      });
      if (user.id_entreprise == req.payload.id_entreprise){
        continueComputing = true;
      }
    }
    if (continueComputing){
      //modify the user's informations in keycloak
      const queryResult = await connectToAdminCLI().then((kcTokens) => {
        return modifyUserInfos(kcTokens.access_token, req.params.id, req.payload);
      });
      return queryResult.message? h.response(queryResult.message).code(queryResult.code) : h.response().code(204);
    } else {
      return h.response("You don't have the rights to modify this user").code(403);
    }
    //verify the end
  },
  create: async (req, h) => {
    const bearerToken = req.headers.authorization.replace('Bearer ', '');
    let addResponsable = false;
    //gets the id of the company of the caller if the caller is a armadacar user
    if (typeof decodeJwt(bearerToken).resource_access["entreprise-management-ui"] == "undefined") {
      //checks if the user to add is in the company of the caller
      const callerCompanyId = await getAdminEntrepriseId(bearerToken).then((res) => {
        return res.data.armadacar_utilisateurs[0].id_entreprise;
      });
      if (callerCompanyId != req.payload.id_entreprise){
        return h.response("Forbidden").code(403);
      }
    } else {
      // if the user is a startfleet manager, the user to add is a armadacar company manager
      addResponsable = true;
    }
    //checks if the email is not used by another user
    const usersWithEmailLength = await connectToAdminCLI().then(kcTokens => {
      return searchByEmail(kcTokens.access_token, req.payload.email).then(users => { 
        return users.length;
      });
    })
    if (usersWithEmailLength != 0) {
      return h.response().code(409);
    }
    //insert the user if it passed the checks
    const queryUserInsertionResult = await connectToAdminCLI().then(async kcTokens => {
      //insert the user
      const createResult = await createUserInKc(kcTokens.access_token, req.payload, addResponsable);
      if (typeof createResult.message !== "undefined"){
        return { "code": createResult.code, "message": createResult.message };
      }
      //get the id of the user and add its role in armadacar
      const insertedUserId = await searchByEmail(kcTokens.access_token, req.payload.email).then(users => { return users[0].id });
      const addUserRoleResult = await addUserArmadacarRole(kcTokens.access_token, insertedUserId, addResponsable);
      if (typeof addUserRoleResult.message !== "undefined") {
        return { "code": addUserRoleResult.code, "message": addUserRoleResult.message };
      }
      //if everything is fine in kc, insert the user in hasura
      const insertUserInHasuraResult = await connectToHasura().then(hasuraTokens => {
        return insertUserInHasura(hasuraTokens.access_token, { id: insertedUserId, id_entreprise: req.payload.id_entreprise});
      })
      console.log(insertUserInHasuraResult);
      if (typeof insertUserInHasuraResult.msg !== "undefined"){
        return { "code": 500, "message": insertUserInHasuraResult.msg }
      }
      return { "code": 201, "message": ""}
    });
    return h.response(queryUserInsertionResult.message).code(queryUserInsertionResult.code);
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