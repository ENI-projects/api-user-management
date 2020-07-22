package org.ApiManagerUser;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import org.apache.commons.codec.binary.Base64;

import org.json.JSONException;
import org.json.JSONObject;

@Path("/jwtDecoder")
public class JwtDecoderResource {
    @GET
    @Path("/id/{token}")
    @Produces(MediaType.TEXT_PLAIN)
    public String getUserIdWithToken(@PathParam("token") String token) {
        String[] split_string = token.split("\\.");
        String base64EncodedBody = split_string[1];
        Base64 base64Url = new Base64(true);
        String body = new String(base64Url.decode(base64EncodedBody)); 
        JSONObject jsonObj = new JSONObject(body);
        String name = jsonObj.getString("id");
        return name;
    }

    @GET
    @Path("/name/{token}")
    @Produces(MediaType.TEXT_PLAIN)
    public String getUserNameWithToken(@PathParam("token") String token) {
        String[] split_string = token.split("\\.");
        String base64EncodedBody = split_string[1];
        Base64 base64Url = new Base64(true);
        String body = new String(base64Url.decode(base64EncodedBody)); 
        JSONObject jsonObj = new JSONObject(body);
        String name = jsonObj.getString("nom");
        return name;
    }

    @GET
    @Path("/company/{token}")
    @Produces(MediaType.TEXT_PLAIN)
    public String getUserCompanyWithToken(@PathParam("token") String token) {
        String[] split_string = token.split("\\.");
        String base64EncodedBody = split_string[1];
        Base64 base64Url = new Base64(true);
        String body = new String(base64Url.decode(base64EncodedBody)); 
        JSONObject jsonObj = new JSONObject(body);
        String name = jsonObj.getString("entreprise");
        return name;
    }
}