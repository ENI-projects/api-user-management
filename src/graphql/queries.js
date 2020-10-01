const getIdEntreprise = `query getIdEntreprise {
  armadacar_utilisateurs {
    id_entreprise
  }
}`

const getUsersByIdEntreprise = `query getUsersByIdEntreprise($id: Int!) {
  armadacar_utilisateurs(where: {id_entreprise: {_eq: $id}}) {
    id
  }
}`

const getUserById = `query getUserIdEntrepriseById($id: String!) {
  armadacar_utilisateurs(where: {id: {_eq: $id}}) {
    id
    id_entreprise
  }
}`

module.exports = {
  getIdEntreprise,
  getUsersByIdEntreprise,
  getUserById
}