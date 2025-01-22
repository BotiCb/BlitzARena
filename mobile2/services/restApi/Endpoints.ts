export const API_BASE_URL = 'https://example.com';


const ROUTES = {
    AUTH: '/auth',
    USERS: '/users',
}

export const AUTH_ENDPOINTS = {
    LOGIN: `${ROUTES.AUTH}/login`,
    REGISTER: `${ROUTES.AUTH}/register`,
    LOGOUT: `${ROUTES.AUTH}/logout`,
    REFRESH: `${ROUTES.AUTH}/refresh`,
}

export const USER_ENDPOINTS = {
    GET_PROFILE: `${ROUTES.USERS}/profile`,
}
    
