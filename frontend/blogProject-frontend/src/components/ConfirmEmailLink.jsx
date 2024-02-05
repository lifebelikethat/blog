import { useParams } from "react-router-dom";
import { axiosInstance } from "../axios";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";

export default function ConfirmEmailLink() {
  const emailToken = useParams().emailToken;
  const { navigate } = useAuth();

  useEffect(() => {
    axiosInstance
      .post(`api-auth/confirm/${emailToken}/`)
      .then((response) => {
        console.log(response);
        navigate("/");
      })
      .catch((error) => {
        console.log(error);
      });
  });
}
