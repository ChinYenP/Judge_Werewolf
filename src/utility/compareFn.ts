import { t_role_id } from '../declare_type/type_guard.js';

function compareRoleId(a: t_role_id, b: t_role_id): number {
    const category_arr: string[] = ['W', 'V', 'G'];
    if (category_arr.indexOf(a[0] ?? '') < category_arr.indexOf(b[0] ?? '')) {
        return (-1);
    } else if (category_arr.indexOf(a[0] ?? '') > category_arr.indexOf(b[0] ?? '')) {
        return (1);
    }
    if (Number(`${a[1]}${a[2]}`) < Number(`${b[1]}${b[2]}`)) {
        return (-1);
    } else if (Number(`${a[1]}${a[2]}`) > Number(`${b[1]}${b[2]}`)) {
        return (1);
    }
    return (0);
}

function compareRoleCount(a: [t_role_id, number], b: [t_role_id, number]): number {
    return (compareRoleId(a[0], b[0]));
}

export { compareRoleId, compareRoleCount }