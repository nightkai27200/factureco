import api from "@/lib/api";


export async function getMySubscription(){

const response =
await api.get(
"/subscription/me"
);


return response.data;

}



export async function upgradePlan(
plan:string
){


const response =
await api.post(
`/subscription/upgrade/${plan}`
);


return response.data;


}