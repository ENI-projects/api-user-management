
const deleteUserById = `mutation deleteUserById($id: String!) {
    delete_armadacar_utilisateurs(where: {id: {_eq: $id}}) {
      affected_rows
    }
  }`;

  const createUser = `mutation ($id: String!, idEntreprise: Int!){
    insert_armadacar_utilisateurs(objects: {
      id: $id,
      id_entreprise: $idEntreprise
    })
  }`

  module.exports = {
    deleteUserById,
    createUser
  }