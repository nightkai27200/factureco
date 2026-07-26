import api from "./api";


interface CheckoutResponse {

  url:string;

}



export async function createCheckout(
  plan:string
):Promise<CheckoutResponse>{


const response =
await api.post<CheckoutResponse>(
"/stripe/create-checkout",
{
plan,
}
);


return response.data;


}