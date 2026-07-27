import axios from "axios";


const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://factureco-production.up.railway.app";



interface LoginResponse {

  access_token: string;

}



// Instance axios avec token automatique

export const api = axios.create({

  baseURL: API_URL,

});



/// Ajout automatique du JWT

api.interceptors.request.use(

  (config) => {


    const token =
      localStorage.getItem("token");


    if(token){

      config.headers = {

        ...(config.headers || {}),

        Authorization:
          `Bearer ${token}`,

      };

    }


    return config;

  },


  (error)=>{

    return Promise.reject(error);

  }

);





export async function login(

  email:string,

  password:string

):Promise<string>{



  const response =
 await api.post<LoginResponse>(

      `${API_URL}/auth/login`,

      {
        email,
        password,
      }

    );



  const token =
    response.data.access_token;



  localStorage.setItem(

    "token",

    token

  );



  return token;

}





export function logout(){


  localStorage.removeItem(

    "token"

  );


}





export function getToken(){


  return localStorage.getItem(

    "token"

  );


}





export function isAuthenticated(){


  const token = getToken();


  return !!token;


}