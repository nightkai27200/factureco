import axios from "axios";


const API_URL = "http://localhost:3000";



interface LoginResponse {

  access_token: string;

}




export async function login(

  email: string,

  password: string

): Promise<string> {



  const response = await axios.post<LoginResponse>(

    `${API_URL}/auth/login`,

    {

      email,

      password,

    }

  );



  const token = response.data.access_token;



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


  return token !== null;


}