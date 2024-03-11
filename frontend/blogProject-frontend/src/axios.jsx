import axios from "axios";
import { useAuth } from "./contexts/AuthContext";

const baseURL = "api/";

export const axiosInstance = axios.create(
  {
    baseURL: baseURL,
    timeout: 20000,
  },
  {
    headers: {
      "content-type": "application/json",
    },
  }
);
