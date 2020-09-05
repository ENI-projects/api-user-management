const API_URL = process.env.APP_HASURA_URL;
const fetch = require("node-fetch");

const fetcher = (token, query, variables) => {
  return fetch(API_URL, {
    method: "POST",
    headers: {
      "content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      query,
      variables
    })
  });
};

const fetchAsync = async (token, fetcher, query, variables) => {    
  const response = await fetcher(token, query, variables);
  if (!response.ok) {
    throw response;
  }
  try {
    return await response.json();
  } catch (err) {
    console.error("Error parsing JSON", err);
  }
};

module.exports = {
  fetcher,
  fetchAsync
}