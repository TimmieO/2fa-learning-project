import fetchHelper from './fetchHelper';
export default async function isLoggedIn(){
  let result = await fetchHelper('/api/user/login');

  return result;
}