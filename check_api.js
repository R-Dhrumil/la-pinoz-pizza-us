const https = require('https');

https.get('https://api.nsenterprise.net/swagger/v1/swagger.json', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const swagger = JSON.parse(data);
      console.log("=== /api/Auth/login ===");
      const loginResp = swagger.paths['/api/Auth/login']?.post?.responses['200']?.content['application/json']?.schema;
      if (loginResp && loginResp.$ref) {
        const refName = loginResp.$ref.split('/').pop();
        console.log("Response Schema:", swagger.components.schemas[refName]);
      } else {
        console.log("Response Schema:", loginResp);
      }
      
      console.log("\n=== /api/User/profile/{id} ===");
      const profileResp = swagger.paths['/api/User/profile/{id}']?.get?.responses['200']?.content['application/json']?.schema;
      if (profileResp && profileResp.$ref) {
        const refName = profileResp.$ref.split('/').pop();
        console.log("Response Schema:", swagger.components.schemas[refName]);
      } else {
        console.log("Response Schema:", profileResp);
      }
      
    } catch(e) {
      console.error(e);
    }
  });
});
