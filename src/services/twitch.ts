import {Container, Inject, Service} from "typedi";
import {ChatUserstate} from "tmi.js";
import SocketService from "./socket";


@Service()
export default class TwitchService {

    rouletteSubMode = false;

    constructor(
    ) {
    }

    onMessageHandler(channel: string, user: ChatUserstate, msg: string, self: boolean, ) {

        const socketService = Container.get(SocketService);

        if (self) { return };

        const command = msg.trim().toLowerCase();

        if (command === '!yo' ) {

            if(!user.username) return;

            if (!this.rouletteSubMode) {
                socketService.addUserEvent(user.username, false);
            } else {

                if (user.subscriber) {
                    socketService.addUserEvent(user.username, false);
                }

            }



        }

        if (command.substring(0, 4) === '!yoa') {

            if (user.mod || user['user-type'] === 'mod' || user.username === channel.substring(1)) {

                const commandArg = command.split(' ')[1].replace('@', ' ');

                if (!commandArg) return;

                socketService.addUserEvent(commandArg, true);

            }

        }

        if (command.startsWith('!ruletasubs')) {

            if (user.mod || user['user-type'] === 'mod' || user.username === channel.substring(1)) {

                const commandArg = command.split(' ')[1];

                if (!commandArg) return;

                if (commandArg === 'on') {
                    this.rouletteSubMode = true;
                } else if(commandArg === 'off') {
                    this.rouletteSubMode = false;
                }
            }

        }
    }

}