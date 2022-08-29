import Contentstack from "contentstack";
import axios from "axios";


const delivery_token : string = process.env.REACT_APP_CS_DELIVERY_TOKEN || '';
const environment : string = process.env.REACT_APP_CS_ENVIRONMENT || '';
const api_key : string = process.env.REACT_APP_CS_API_KEY || '';


export const Stack = Contentstack.Stack({
  api_key: api_key,
  delivery_token: delivery_token,
  environment: environment,
});

export async function getEntries(contentType : string) {
  let entries = await Stack.ContentType(contentType)
    .Query()
    .toJSON()
    .find();
  return entries[0];
}

export async function getContentTypes() {
  let data = Stack.getContentTypes({"include_global_field_schema": true})
     data
     .then(function(result) {
          return result;    
     }, function(error) {
          return error;
     })
}
