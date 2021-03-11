import Axios from 'axios';
import config from "../config";

export const getTwitchToken = async(code: string) => {
    const { data } = await Axios.post('https://id.twitch.tv/oauth2/token', null, {
        params: {
            'client_id': config.twitch.client,
            'client_secret': config.twitch.secret,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': config.twitch.redirect_uri,
        } });

    return data;
}

export const getTwitchUser = async(token: string) => {
    const { data: {data} } = await Axios.get('https://api.twitch.tv/helix/users', {
        headers: {
            'Authorization': `Bearer ${ token }`,
            'Client-Id': config.twitch.client
        }
    });

    return data[0];
}