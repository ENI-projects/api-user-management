
const deleteUserById = `mutation deleteUserById($id: String!) {
    delete_armadacar_utilisateurs(where: {id: {_eq: $id}}) {
      affected_rows
    }
  }`;

  module.exports = {
    deleteUserById
  }