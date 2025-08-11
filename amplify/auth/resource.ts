import { defineAuth } from "@aws-amplify/backend";
import { UserAttributeKey } from 'aws-amplify/auth'; 

/**
 * Define and configure your auth resource
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      saml: {
        name: "MicrosoftEntraIDSAML",
        metadata: {
          metadataType: "URL",
         // metadataContent: "https://login.microsoftonline.com/d15c4d53-31f8-40bb-9e0e-558a898413c7/federationmetadata/2007-06/federationmetadata.xml?appid=f9ddd13c-5089-426f-8bea-4b007ddbf91a",
          metadataContent: "https://login.microsoftonline.com/d15c4d53-31f8-40bb-9e0e-558a898413c7/federationmetadata/2007-06/federationmetadata.xml?appid=3d29958a-cea7-48fe-8065-6622d56844c8"
        },
        attributeMapping: {
          email: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
          familyName: "http://schemas.microsoft.com/ws/2008/06/identity/claims/groups",
        },
      },
      logoutUrls: ["http://localhost:3001/", "https://main.dcw3c22itgwlj.amplifyapp.com/"],
      callbackUrls: ["http://localhost:3001/", "https://main.dcw3c22itgwlj.amplifyapp.com/"],
    },
  },
});
