// import React from 'react';
import { useParams } from 'react-router-dom';
// import type { ActivationRequest } from "@campus/api";
import { activate } from "./../../actions/activate"
import { useNavigate } from 'react-router-dom';
import { paths } from '@/settings/routes';

const Activation = () => {
    const { uuid, token } = useParams();
    const navigate = useNavigate();
    
    const sendActivationRequest = async ({ uid, token }) => {
        const response = await activate({ uid, token });
        if (response.status === 204) {
            navigate(paths.public.auth.signIn);
        } else {
            console.log("Activation failed");
        }
    };

  return (
    <div>
        <button onClick={() => sendActivationRequest({ uid: uuid!, token: token! })}>Activate</button>
    </div>
  )
}

export default Activation