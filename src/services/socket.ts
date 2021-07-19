import {Container, Inject, Service} from "typedi";
import {Server, Socket} from "socket.io";
import { v4 as uuid } from 'uuid';
import {validateJWT} from "../helpers/jwt";
import UserService from "./user";
import RouletteService from "./roulette";
import SettingsService from "./settings";
import ResultService from "./result";
import {ISettingsImageDTO} from "../interfaces/ISettings";


@Service()
export default class SocketService {

    constructor(
        @Inject('ioClient') private ioClient: Server
    ) {
        this.listenSocketEvents();
    }

    private listenSocketEvents() {

        const userInstance = Container.get(UserService);
        const rouletteInstance = Container.get(RouletteService);

        this.ioClient.on('connection', async (socket: Socket) => {

            // @ts-ignore todo handle this correctly
            const validateJWTResp = validateJWT( socket.handshake.query['x-token'] );
            // @ts-ignore
            const validateTokenRoulette = await rouletteInstance.validateToken(socket.handshake.query['roulette-token'])

            if ( (!validateJWTResp.ok || !validateJWTResp.id ) && (!validateTokenRoulette.ok || !validateTokenRoulette.id)  ) return socket.disconnect();

            // TODO: Handle this better

            const userId = validateJWTResp.id! || validateTokenRoulette.id;

            const { twitchName } = await userInstance.getUser(validateJWTResp.id! || validateTokenRoulette.id);

            socket.join(twitchName);

            socket.on('spin-roulette', () => {
                const rouletteInstance = Container.get(RouletteService);
                rouletteInstance.updateSpinning(userId, true);
                this.ioClient.to(twitchName).emit('spin-roulette')
            });
            socket.on('spin-roulette-state', () => this.ioClient.to(twitchName).emit('spin-roulette-state'));

            socket.on('add-user-button', (user) => {
                const rouletteInstance = Container.get(RouletteService);
                rouletteInstance.addUser(userId, user);
                this.ioClient.to(twitchName).emit('add-user-roulette', user);
                this.ioClient.to(twitchName).emit('add-user-state', user);
            }) ;

            socket.on('remove-user-button', async (userUid: string) => {
                const rouletteInstance = Container.get(RouletteService);
                const reset = await rouletteInstance.removeUser(userId, userUid);
                if (reset) {
                    this.ioClient.to(twitchName).emit('remove-all-users-roulette');
                    this.ioClient.to(twitchName).emit('remove-all-users-state');
                } else {
                    this.ioClient.to(twitchName).emit('remove-user-roulette', userUid);
                    this.ioClient.to(twitchName).emit('remove-user-state', userUid);
                }

            });

            socket.on('add-users-button', async (usersArr) => {
                const rouletteInstance = Container.get(RouletteService);
                this.ioClient.to(twitchName).emit('update-loading-manual-users', true);
                await rouletteInstance.addUsers(userId, usersArr, this.ioClient, twitchName);
                this.ioClient.to(twitchName).emit('update-loading-manual-users', false);

            })

            socket.on('remove-all-users-roulette', () => this.ioClient.to(twitchName).emit('remove-all-users-roulette'));
            socket.on('remove-all-users-state', () => {
                this.ioClient.to(twitchName).emit('remove-all-users-state');
                const rouletteInstance = Container.get(RouletteService);
                rouletteInstance.removeAllUsers(userId);
            });

            socket.on('update-default-roulette-active', (bool: boolean) => {
                this.ioClient.to(twitchName).emit('update-default-roulette-active', bool);
                const rouletteInstance = Container.get(RouletteService);
                rouletteInstance.updateDefaultRouletteActive(userId, bool);
            });

            socket.on('increment-color-index', (colorIndex: number) => {
                this.ioClient.to(twitchName).emit('increment-color-index');
                const rouletteInstance = Container.get(RouletteService);
                rouletteInstance.incrementColorIndex(userId, colorIndex);
            });

            socket.on('reset-color-index', () => {
                this.ioClient.to(twitchName).emit('reset-color-index');
                const rouletteInstance = Container.get(RouletteService);
                rouletteInstance.resetColorIndex(userId);
            });

            socket.on('reset-roulette', () => {
                const rouletteInstance = Container.get(RouletteService);
                rouletteInstance.resetRoulette(userId);
                this.ioClient.to(twitchName).emit('remove-all-users-roulette');
                this.ioClient.to(twitchName).emit('remove-all-users-state');
            });

            socket.on('set-winner', ({ text, fillStyle }: { text: string, fillStyle: string }) => this.ioClient.to(twitchName).emit('set-winner', { text, fillStyle }));
            socket.on('hide-winner', () => {
                const rouletteInstance = Container.get(RouletteService);
                rouletteInstance.updateSpinning(userId, false);
                this.ioClient.to(twitchName).emit('hide-winner')
            });

            socket.on('set-result', ({ winner, uid }: { winner: string, uid: string }) => {
                const resultInstance = Container.get(ResultService);
                resultInstance.createResult(winner, uid, userId);
                this.ioClient.to(twitchName).emit('set-result', { winner, uid });
            });

            socket.on('update-sub-mode', (bool: boolean) => {
               const rouletteInstance = Container.get(RouletteService);
               rouletteInstance.updateSubMode(userId, bool);
               this.ioClient.to(twitchName).emit('update-sub-mode', bool);
            });

            socket.on('update-song', (bool: boolean) => {
                const settingsInstance = Container.get(SettingsService);
                settingsInstance.updateSongBool(userId, bool);
                this.ioClient.to(twitchName).emit('update-song', bool);
            });

            socket.on('update-manual-mode', (bool: boolean) => {
                const rouletteInstance = Container.get(RouletteService);
                rouletteInstance.updateManualMode(userId, bool);
                this.ioClient.to(twitchName).emit('update-manual-mode', bool);
            });


            socket.on('update-basic-settings', async (values) => socket.to(twitchName).emit('update-basic-settings', values));

            socket.on('update-default-users', async (users: Array<string>) => {
                socket.to(twitchName).emit('update-default-users', users);
                socket.to(twitchName).emit('re-draw-default-roulette');
            });

            socket.on('update-colors', async (colors: Array<string>) => {
                socket.to(twitchName).emit('update-colors', colors);
                socket.to(twitchName).emit('force-re-draw-roulette');
            })

            socket.on('update-image-url', (imageUrl: string | null) => socket.to(twitchName).emit('update-image-url', imageUrl));
            socket.on('update-song-url', (songUrl: string | null) => socket.to(twitchName).emit('update-song-url', songUrl));

            socket.on('update-image-settings', (data: ISettingsImageDTO) => socket.to(twitchName).emit('update-image-settings', data));

            socket.on('new-instance-roulette', () => {
                const rouletteInstance = Container.get(RouletteService);
                rouletteInstance.updateSpinning(userId, false);
                socket.to(twitchName).emit('new-instance-roulette')
            });

            socket.on('viewed-news', () => {
                const userInstance = Container.get(UserService);
                userInstance.updateViewedNews(userId, true);
            });

            socket.on('add-waiting-users', () => {
                const rouletteInstance = Container.get(RouletteService);
                rouletteInstance.addUsersWaitingToRoulette(userId, twitchName, this.ioClient);
            })

        });

    }

    public async addUserEvent(channelName: string, name: string, subscriber: boolean, fromMod: boolean) {
        const rouletteInstance = Container.get(RouletteService);

        const loadingUsers = await rouletteInstance.getLoadingUserWithTwitchName(channelName);
        if (loadingUsers) return;

        const spinning = await rouletteInstance.getSpinningWithTwitchName(channelName);

        const newUser = { name, fromMod, uid: uuid() };

        if (spinning) {
            rouletteInstance.addUserWaitingToDB(channelName, { ...newUser, subscriber});
            return;
        }

        const ok = await rouletteInstance.addUserFromTwitch(channelName, { ...newUser, subscriber });

        if (ok) {
            this.ioClient.to(channelName).emit('add-user-roulette', newUser );
            this.ioClient.to(channelName).emit('add-user-state', newUser);
        }
    }

    public async updateSubMode(channelName: string, bool: boolean) {
        const rouletteInstance = Container.get(RouletteService);
        await rouletteInstance.updateSubModeFromTwitch(channelName, bool);
        this.ioClient.to(channelName).emit('update-sub-mode', bool);
    }

    public async updateManualMode(channelName: string, bool: boolean) {
        const rouletteInstance = Container.get(RouletteService);
        await rouletteInstance.updateManualModeFromTwitch(channelName, bool);
        this.ioClient.to(channelName).emit('update-manual-mode', bool);
    }

    public async updateSong(channelName: string, bool: boolean) {
        const rouletteInstance = Container.get(RouletteService);
        await rouletteInstance.updateSongFromTwitch(channelName, bool);
        this.ioClient.to(channelName).emit('update-song', bool);
    }

    public async spinRoulette(channelName: string) {
        const rouletteInstance = Container.get(RouletteService);
        const canAddUser = await rouletteInstance.canAddUser(channelName);
        if  (!canAddUser) return;
        await rouletteInstance.updateSpinningWithTwitchName(channelName, true);
        this.ioClient.to(channelName).emit('spin-roulette');
    }

    public async resetRoulette(channelName: string) {
        const rouletteInstance = Container.get(RouletteService);
        const canAddUser = await rouletteInstance.canAddUser(channelName);
        if  (!canAddUser) return;
        await rouletteInstance.resetRouletteFromTwitch(channelName);
        this.ioClient.to(channelName).emit('remove-all-users-roulette');
        this.ioClient.to(channelName).emit('remove-all-users-state');
    }

}