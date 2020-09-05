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

module.exports = {
  getIdEntreprise,
  getUsersByIdEntreprise
}