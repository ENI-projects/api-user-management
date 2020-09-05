const { getAdminEntrepriseId, getUsersIdInCompany, parseUserResponse } = require('./functions.js');
const { connectToAdminCLI, connectToHasura, loadUserInfo } = require('../keycloak/functions.js')

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
  get: (req, h) => {
    const id = req.params.id;
    const id_entreprise = getAdminEntrepriseId(req.headers.authorization);
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
  remove: (req, h) => {
    const id = req.params.id;
    const id_entreprise = getAdminEntrepriseId(req.headers.authorization);

  }
}