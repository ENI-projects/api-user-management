# Welcome to api-user-management 👋

> API to manage our users from the apps in keycloak

## 🏠 [Homepage](https://gitlab.com/startfleet/api-user-management#readme)

The API is made in nodejs using hapi.

## Launching the API in local
> nodejs is required

```
export NODE_ENV=development
node server.js or npm start
```
This will launch a nodejs web server using the .env.development environment variable file and exposing the port 3000 of your computer.

## Endpoints

There are 5 endpoints that are used to manage the users between the database of the apps and keycloak :

### Getting the list of the users in the company
```
GET /users
```
__Rights :__ This endpoint is only available to connected users having the "adminentreprise" role into the armadacar app and will only retrive users that are in the company of the caller. It is also accessible by users in entreprise-management-admin role with nos restrictions.

### Getting the infos about 1 user
```
GET /user/{id}
```
__Rights :__ This endpoint is only available to connected users having the "adminentreprise" role into the armadacar app and will only retrive users that are in the company of the caller, otherwise a HTTP 404 is returned.

### Delete a user
```
DELETE /user/{id}
```
__Rights :__ This endpoint is only available to connected users having the "adminentreprise" role into the armadacar app and will only delete users that are in the company of the caller. It is also accessible by users in entreprise-management-admin role with nos restrictions.

### Update a user
```
PUT /user/{id}
```
__Rights :__ This endpoint is only available to connected users having the "adminentreprise" role into the armadacar app and will only delete users that are in the company of the caller. It is also accessible by users in entreprise-management-admin role with no restriction on any user, but it will always check that the user to modify is never moved from a company to a other.

__Payload :__ Payload should be this format :
```json
{
  "email": "$email",
  "first_name": "$last_name",
  "last_name": "$last_name",
  "id_entreprise": "$id_entreprise",
  "adress": "$adress",
  "ville": "$ville",
  "code_postal": "$code_postal",
  "phone": "$phone"
}
```

## Author

👤 **Startfleet**


## 🤝 Contributing

Contributions, issues and feature requests are welcome!

Feel free to check [issues page](https://gitlab.com/startfleet/api-user-management/issues). You can also take a look at the [contributing guide](ssh://git@gitlab.com/startfleet/api-user-management/blob/master/CONTRIBUTING.md).

## Show your support

Give a ⭐️ if this project helped you!


***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_