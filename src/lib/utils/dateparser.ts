
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