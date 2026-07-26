import axios from "axios";


const api = axios.create({

  baseURL:
   "https://factureco-production.up.railway.app",

  headers:{
    "Content-Type":"application/json",
  },

});



api.interceptors.request.use(

(config)=>{


if(typeof window !== "undefined"){


const token =
localStorage.getItem("token");


if(token){


config.headers =
config.headers ?? {};


config.headers.Authorization =
`Bearer ${token}`;


}


}


return config;


},


(error)=>{

return Promise.reject(error);

}


);



export default api;