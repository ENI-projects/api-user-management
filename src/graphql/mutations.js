
const deleteUserById = `mutation deleteUserById($id: String!) {
    delete_armadacar_utilisateurs(where: {id: {_eq: $id}}) {
      affected_rows
    }
  }`;

const insertUser = `mutation insertUser($id: String!, $id_entreprise: Int!) {
    insert_armadacar_utilisateurs(objects: {id_entreprise: $id_entreprise, id: $id}) {
      affected_rows
    }
  }`;

  module.exports = {
    deleteUserById,
    insertUser
  }