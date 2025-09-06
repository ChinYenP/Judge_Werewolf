import { CommandCooldownInstance, COMMAND_COOLDOWN } from '../../global/sqlite_db.js';
import { t_command_cooldown_type } from '../../global/types/list_str.js';
import { t_cooldown_status } from '../../global/types/other_types.js';

async function check_cooldown(clientId: string, cooldown_type: t_command_cooldown_type, time_sec: number): Promise<t_cooldown_status> {

    const command_cooldown: CommandCooldownInstance | null = await COMMAND_COOLDOWN.findOne({ where: { clientId: clientId, command_type: cooldown_type } });
    if (command_cooldown !== null) {
        //data exist
        const expired_date: bigint = command_cooldown.expired_date;
        const date_now: number = Date.now();
        if (date_now < expired_date) {
            return ({
                status: 'cooldown',
                remaining_sec: time_sec
            });
        }
    }

    //Update cooldown
    const expired_date: number = Date.now() + (time_sec * 1000);
    if (command_cooldown !== null) {
        //data exist
        const [affectedCount]: [number] = await COMMAND_COOLDOWN.update({ expired_date: BigInt(expired_date) }, { where: { clientId: clientId, command_type: cooldown_type } });
        if (affectedCount > 0) {
            return ({status: 'ok'});
        }
        return ({
            status: 'fatal',
            error_code: 'D3'
        });
    }
    //Data not exist
    try {
        await COMMAND_COOLDOWN.create({
            clientId: clientId,
            command_type: cooldown_type,
            expired_date: BigInt(expired_date)
        })
        return ({status: 'ok'});
    }
    catch (error) {
        console.log(error);
        return ({
            status: 'fatal',
            error_code: 'D1'
        });
    }
}

export { check_cooldown }