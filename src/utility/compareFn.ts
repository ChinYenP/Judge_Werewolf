import { t_role_id } from '../global/types/other_types.js';
import { assertCharIndex } from './assert.js';

function compareRoleId(a: t_role_id, b: t_role_id): number {
    if (a.length != 3 || b.length != 3) return (0);
    const [a0, a1, a2] = [assertCharIndex(a,0), assertCharIndex(a,1), assertCharIndex(a,2)];
    const [b0, b1, b2] = [assertCharIndex(b,0), assertCharIndex(b,1), assertCharIndex(b,2)];
    const category_arr: string[] = ['W', 'V', 'G'];
    if (category_arr.indexOf(a0) < category_arr.indexOf(b0)) {
        return (-1);
    } else if (category_arr.indexOf(a0) > category_arr.indexOf(b0)) {
        return (1);
    }
    if (Number(`${a1}${a2}`) < Number(`${b1}${b2}`)) {
        return (-1);
    } else if (Number(`${a1}${a2}`) > Number(`${b1}${b2}`)) {
        return (1);
    }
    return (0);
}

function compareRoleCount(a: [t_role_id, number], b: [t_role_id, number]): number {
    return (compareRoleId(a[0], b[0]));
}

export { compareRoleId, compareRoleCount }