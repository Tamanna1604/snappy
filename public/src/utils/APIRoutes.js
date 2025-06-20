const backendUrl = process.env.REACT_APP_BACKEND_URL ||"http://localhost:5000";

export const host = backendUrl;
export const loginRoute = `${host}/api/auth/login`;
export const registerRoute = `${host}/api/auth/register`;
export const logoutRoute = `${host}/api/auth/logout`;
export const allUsersRoute = `${host}/api/auth/allusers`;
export const sendMessageRoute = `${host}/api/messages/addmsg`;
export const recieveMessageRoute = `${host}/api/messages/getmsg`;
export const getAnonymousChatForSenderRoute = `${host}/api/messages/get-anonymous-chat`;
export const getAnonymousInboxForReceiverRoute = `${host}/api/messages/anonymous-inbox`;
export const requestIdentityRevelationRoute = `${host}/api/messages/request-identity-revelation`;
export const revealIdentityRoute = `${host}/api/messages/reveal-identity`;
export const stopReceivingRoute = `${host}/api/messages/stop-receiving`;
export const getRevealedSenderInfoRoute = `${host}/api/messages/revealed-sender-info`;
export const setAvatarRoute = `${host}/api/auth/setavatar`;
export const topFriendsRoute = `${host}/api/messages/top-friends`;
