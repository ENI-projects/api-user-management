const fetch = require("node-fetch");
const KEYCLOAK_CONNECT_URL = `${process.env.KEYCLOAK_PROTOCOL}://${process.env.KEYCLOAK_DOMAIN}/auth/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`

async function connectToHasura(){
  const data = prepareConnectRequestBodyData(
    "armadacar-frontend-app",
    "password",
    process.env.API_USER_LOGIN,
    process.env.API_USER_PASSWORD
  );
  const res = (await connectToKeycloak(KEYCLOAK_CONNECT_URL, data));
  try {
    return await parseResponse(res);
  } catch {
    return parseError(error);
  }
}

async function connectToAdminCLI() {
  const data = prepareConnectRequestBodyData(
    "admin-cli",
    "password",
    process.env.API_USER_LOGIN,
    process.env.API_USER_PASSWORD
  );
  const res = (await connectToKeycloak(KEYCLOAK_CONNECT_URL, data));
  try {
    return await parseResponse(res);
  } catch(error) {
    return parseError(error);
  }
}

async function loadUserInfo(jwt, id) {
  const url = `${process.env.KEYCLOAK_PROTOCOL}://${process.env.KEYCLOAK_DOMAIN}/auth/admin/realms/${process.env.KEYCLOAK_REALM}/users/${id}`;
  const response = await fetch(
      url, {
      method: "GET",
      headers: {
        "authorization": `Bearer ${jwt}`
      }
    }
  )
  try {
    return await parseResponse(response);
  } catch (error) {
    return parseError(error);
  }
}

async function createUserInKc(jwt, infos, responsable) {
  const url = `${process.env.KEYCLOAK_PROTOCOL}://${process.env.KEYCLOAK_DOMAIN}/auth/admin/realms/${process.env.KEYCLOAK_REALM}/users`;  
  let armadacar_role = "user"
  if (responsable == true){
    armadacar_role = "adminentreprise"
  }
  const response = await fetch(
    url, {
      method: "POST",
      headers: {
        "authorization": `Bearer ${jwt}`,
        "Content-Type" : "application/json"
      },
      body: JSON.stringify({
        "username": infos.email,
        "email": infos.email,
        "firstName": infos.first_name,
        "lastName": infos.last_name,
        "attributes": {
          "address": [infos.address],
          "ville": [infos.ville],
          "code_postal": [infos.code_postal],
          "phone": [infos.phone]
        },
        "enabled" : true,
        "credentials" : [
          { "temporary": true },
          { "value": "password.to.change1234" }
        ]
      })
    }
  )
  if (response.status !== 201){
    return parseError({ message: response.status });
  }
  return response.status;
}

async function addUserArmadacarRole(jwt, id, responsable){
  const url = `${process.env.KEYCLOAK_PROTOCOL}://${process.env.KEYCLOAK_DOMAIN}/auth/admin/realms/${process.env.KEYCLOAK_REALM}/users/${id}/role-mappings/clients/${process.env.ARMADACAR_CONTAINER_ID}`;
  let roleId = process.env.ARMADACAR_USER_ROLE_ID;
  let roleName = "user"; 
  if (responsable == true){
    roleId = process.env.ARMADACAR_ADMIN_ROLE_ID;
    roleName = "adminentreprise"
  }
  const response = await fetch(
    url, {
      method: "POST",
      headers: {
        "authorization": `Bearer ${jwt}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify([
        {
          "id": roleId,
          "name": roleName,
          "composite": false,
          "clientRole": true,
          "containerId": `${process.env.ARMADACAR_CONTAINER_ID}` 
        }
      ])
    }
  );
  if (response.status !== 204){
    return parseError({ message: response.status });
  }
  return response.status;
}

async function modifyUserInfos(jwt, id, infos) {
  const url = `${process.env.KEYCLOAK_PROTOCOL}://${process.env.KEYCLOAK_DOMAIN}/auth/admin/realms/${process.env.KEYCLOAK_REALM}/users/${id}`;
  const response = await fetch(
    url, {
      method: "PUT",
      headers: {
        "authorization": `Bearer ${jwt}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "firstName": infos.first_name,
        "lastName": infos.last_name,
        "email": infos.email,
        "attributes": {
          "ville": [infos.ville],
          "address": [infos.address],
          "code_postal": [infos.code_postal],
          "phone": [infos.phone]
        }
      })
    }
  )
  if (response.status !== 204){
    return parseError({ message: response.status });
  }
  return response.status;
}

async function deleteUser(jwt, id) {
  const url = `${process.env.KEYCLOAK_PROTOCOL}://${process.env.KEYCLOAK_DOMAIN}/auth/admin/realms/${process.env.KEYCLOAK_REALM}/users/${id}`;
  const response = await fetch(
      url, {
      method: "DELETE",
      headers: {
        "authorization": `Bearer ${jwt}`
      }
    }
  )
  if (response.status !== 204){
    return parseError({ message: response.status });
  }
  return response.status;
}

async function searchByEmail(jwt, email){
  const url = `${process.env.KEYCLOAK_PROTOCOL}://${process.env.KEYCLOAK_DOMAIN}/auth/admin/realms/${process.env.KEYCLOAK_REALM}/users?email=${email}`;
  const response = await fetch(
    url, {
      method: "GET",
      headers: {
        "authorization": `Bearer ${jwt}`
      }
    }
  )  
  try {
    return await parseResponse(response);
  } catch (error) {
    return parseError(error);
  }
}


function prepareConnectRequestBodyData(client_id, grant_type, username, password){
  const data = new URLSearchParams();
  data.append("client_id", client_id);
  data.append("grant_type", grant_type);
  data.append("username", username);
  data.append("password", password);
  return data;
}

async function connectToKeycloak(kcURL, bodyData) {
  return await fetch(
    kcURL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    body: bodyData
  });
}

async function parseResponse(response) {
  if (!response.ok) {
    throw new Error(response.status);
  }
  try {
    return await response.json();
  } catch (err) {
    console.error("Error parsing JSON", err);
  }
}

function parseError(error) {
  switch(error.message){
    case "403": {
      return {
        code: 403,
        message: "Forbidden"
      }
    }
    case "404":
      return {
        code: 404, 
        message: "Error while getting user infos : not found"
      }
    default:
      return {
        code: 500,
        message: "Something unexpected happened"
    }
  }
}

module.exports = {
    connectToAdminCLI,
    loadUserInfo,
    connectToHasura,
    deleteUser,
    modifyUserInfos,
    searchByEmail,
    createUserInKc,
    addUserArmadacarRole
}