import {Container, Service} from "typedi";
import {ChatUserstate} from "tmi.js";
import SocketService from "./socket";
import UserService from "./user";
import {tmiClient} from "../loaders/tmi";


@Service()
export default class TmiService {

    constructor() {
    }

    public async connectToChannels() {
        const userInstance = Container.get(UserService);
        const users = await userInstance.getTwitchUserNameFromVerified();
        users.forEach( username => tmiClient.join(username) );
    }

    public async onMessageHandler(channel: string, user: ChatUserstate, msg: string, self: boolean,) {

        const socketService = Container.get(SocketService);

        if (self) {
            return
        }


        const command = msg.trim().toLowerCase();
        const channelFixed = channel.replace('#', '');

        if (command === '!yo') {

            if (!user.username) return;

            if (user.username === channel.substring(1)) user.subscriber = true;

            await socketService.addUserEvent(channelFixed, user.username, user.subscriber || false, false);

        }

        if (command.substring(0, 4) === '!yoa') {

            if (user.mod || user['user-type'] === 'mod' || user.username === channel.substring(1)) {

                const commandArg = command.split(' ')[1];

                if (!commandArg) return;

                const commandArgFixed = commandArg.replace('@', '');

                await socketService.addUserEvent(channelFixed, commandArgFixed, true, true);

            }

        }

        if (command.startsWith('!ruletasubs')) {

            if (user.mod || user['user-type'] === 'mod' || user.username === channel.substring(1)) {

                const commandArg = command.split(' ')[1];

                if (!commandArg) return;

                if (commandArg === 'on') {
                    await socketService.updateSubMode(channelFixed, true);
                } else if (commandArg === 'off') {
                    await socketService.updateSubMode(channelFixed, false);
                }
            }

        }

        if (command.startsWith('!ruletasong')) {
            if (user.mod || user['user-type'] === 'mod' || user.username === channel.substring(1)) {

                const commandArg = command.split(' ')[1];

                if (!commandArg) return;

                if (commandArg === 'on') {
                    await socketService.updateSong(channelFixed, true);
                } else if (commandArg === 'off') {
                    await socketService.updateSong(channelFixed, false);
                }
            }
        }

        if (command === '!tirar') {

            if (user.mod || user['user-type'] === 'mod' || user.username === channel.substring(1))
                await socketService.spinRoulette(channelFixed);

        }

        if (command === '!reiniciar') {
            if (user.mod || user['user-type'] === 'mod' || user.username === channel.substring(1))
                await socketService.resetRoulette(channelFixed);
        }
    }

}
