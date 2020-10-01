const jwtDecode = require('jwt-decode');
const { fetchAsync, fetcher } = require("../graphql/fetcher");
const mutations = require('../graphql/mutations');
const queries = require("../graphql/queries");

function getAdminEntrepriseId(jwt) {
  return fetchAsync(
    jwt,
    fetcher,
    queries.getIdEntreprise,
    {}
  );
};

async function getUserInHasuraById(jwt, id) {
  const res = (await fetchAsync(
    jwt,
    fetcher,
    queries.getUserById,
    { id }
  ))
  return res.data ? res.data.armadacar_utilisateurs[0]: {"msg" : "Something went wrong while getting the users from the database"}
}

async function getUsersIdInCompany(jwt, id) {
  const res = (await fetchAsync(
    jwt,
    fetcher,
    queries.getUsersByIdEntreprise, 
    { id }
  ));
  return res.data ? res.data.armadacar_utilisateurs:  {"msg": "Something went wrong while getting the users from the database"} ;
}

async function deleteUserInHasura(jwt, id){
  const res = await fetchAsync(
    jwt,
    fetcher,
    mutations.deleteUserById,
    { id }
  );
  return res.data ? res.data.delete_armadacar_utilisateurs: {"msg": "Something went wrong while deleting the user from the database"};
}

function parseUserResponse(user) {
  let parsedUser = {
    email: user.email ? user.email : "",
    first_name: user.firstName ? user.firstName : "",
    last_name: user.lastName ? user.lastName : "",
    address: "",
    ville: "",
    code_postal: "",
    phone: ""
  };
  const attributes = user.attributes; 
  if (typeof attributes !== 'undefined'){
    parsedUser.address = attributes.address ? attributes.address[0] : parsedUser.address;
    parsedUser.ville = attributes.ville ? attributes.ville[0] : parsedUser.ville;
    parsedUser.code_postal = attributes.code_postal ? attributes.code_postal[0] : parsedUser.code_postal;
    parsedUser.phone = attributes.phone ? attributes.phone[0] : parsedUser.phone;
  }
  return parsedUser;
}
function verifyAdminPrivilege(jwt) {
  const adminDecodedJWT = decodeJwt(jwt);
  if (adminDecodedJWT.resource_access["armadacar-frontend-app"].roles.includes('adminentreprise')){
    return true;
  }
  return false;
}

function decodeJwt(jwt) {
  return jwtDecode(jwt);
}

module.exports = {
  getAdminEntrepriseId,
  getUsersIdInCompany,
  decodeJwt,
  verifyAdminPrivilege,
  parseUserResponse,
  deleteUserInHasura,
  getUserInHasuraById
};