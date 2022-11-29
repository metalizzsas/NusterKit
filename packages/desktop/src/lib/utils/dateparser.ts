
export const parseTime = (date: number): { hours: number, minutes: number, seconds: number } => 
{
    let hours = Math.floor(date / 3600);
    let minutes = Math.floor((date - hours * 3600) / 60);
    let seconds = Math.floor(date - (minutes * 60 + hours * 3600));

   const isTimeNegative = hours < 0 || minutes < 0 || seconds < 0;

    hours = !isTimeNegative ? hours : 0;
    minutes = !isTimeNegative ? minutes : 0;
    seconds = !isTimeNegative ? seconds : 0;

    return {
        hours, minutes, seconds
    };
}

export const parseDuration = (start: number, end: number, translateKey: (arg0: string) => string) => {
    const diff = end - start;

    const hours = new Date(diff).getHours() - 1;
    const minutes = new Date(diff).getMinutes();
    const seconds = new Date(diff).getSeconds();

    const hoursShown = hours > 0;
    const hoursPlural = hours != 1;
    const minutesPlural = minutes != 1;
    const secondsPlural = seconds != 1;

    return (
        (hoursShown ? `${hours} ${translateKey(hoursPlural ? 'date.hours' : 'date.hour')}` : ``) +
        ` ${minutes} ${translateKey(minutesPlural ? 'date.minutes' : 'date.minute')} ${seconds} ${translateKey(
            secondsPlural ? 'date.seconds' : 'date.second',
        )}`
    );
};
