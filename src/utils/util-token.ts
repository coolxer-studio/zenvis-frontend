import md5 from 'js-md5';
import { getSalt, getToken } from '@u/ls';

const getTokenSign = (param: Record<string, unknown> = {}): Record<string, string> => {
  let token = '';
  let salt = '';
  if (!token) {
    token = getToken();
  }
  if (!salt) {
    salt = getSalt();
  }
  const signatureContent = md5(JSON.stringify(param) + token) + new Date().getTime() + salt;
  const clientSign = md5(signatureContent);
  return {
    token,
    clientSign,
    signatureContent,
  };
};

export { getTokenSign };
