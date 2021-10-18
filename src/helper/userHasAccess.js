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

  console.log(result);

  let access = result.hasAccess;

  return access;
}