import {Container, Inject, Service} from "typedi";
import {Server, Socket} from "socket.io";
import { v4 as uuid } from 'uuid';
import {validateJWT} from "../helpers/jwt";
import UserService from "./user";
import RouletteService from "./roulette";
import SettingsService from "./settings";
import ResultService from "./result";


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

            socket.on('spin-roulette', () => this.ioClient.to(twitchName).emit('spin-roulette'));
            socket.on('spin-roulette-state', () => this.ioClient.to(twitchName).emit('spin-roulette-state'));

            socket.on('add-user-button', (user) => {
                const rouletteInstance = Container.get(RouletteService);
                rouletteInstance.addUser(userId, user);
                this.ioClient.to(twitchName).emit('add-user-roulette', user);
                this.ioClient.to(twitchName).emit('add-user-state', user);
            }) ;

            socket.on('remove-user-button', (userUid: string) => {
               const rouletteInstance = Container.get(RouletteService);
               rouletteInstance.removeUser(userId, userUid);
               this.ioClient.to(twitchName).emit('remove-user-roulette', userUid);
               this.ioClient.to(twitchName).emit('remove-user-state', userUid);
            });

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
            socket.on('hide-winner', () => this.ioClient.to(twitchName).emit('hide-winner'));

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

            socket.on('new-instance-roulette', () => socket.to(twitchName).emit('new-instance-roulette'));

        });

    }

    public async addUserEvent(channelName: string, name: string, subscriber: boolean, fromMod: boolean) {
        const rouletteInstance = Container.get(RouletteService);
        const newUser = { name, fromMod, uid: uuid() };
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

}