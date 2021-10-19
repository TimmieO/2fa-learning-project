import fetchHelper from './fetchHelper';
export default async function checkAccess(data){
  const dataVal = {
    path: data
  }

  const settings = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dataVal)
  }

  let result = await fetchHelper('/api/user/access', settings);

  let newRoute = result.reRoute;
  let access = result.hasAccess;

  if(access == false){
    window.location.href = newRoute;
  }
  if(access == true){
    return true
  }

  return access;
}