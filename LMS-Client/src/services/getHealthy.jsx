import axios from "../api/axiosClient";

export const getHealthy = async () => {
    return axios.get("/healthy");
}