export const load = async ({ locals }) => {
    return { containers: locals.machine_status.containers };
}