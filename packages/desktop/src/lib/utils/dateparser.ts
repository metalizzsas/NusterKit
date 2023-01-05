import type { ProductSeries } from "@metalizzsas/nuster-typings/build/spec/containers/products";

/**
 * Parses duration to an human readable translated string
 * @param date Date to parse
 * @returns Strigified duration
 */
export function parseDurationToString(date: number): string {

    let hours = Math.floor(date / 3600);
    let minutes = Math.floor((date - hours * 3600) / 60);
    let seconds = Math.floor(date - (minutes * 60 + hours * 3600));

    const isTimeNegative = hours < 0 || minutes < 0 || seconds < 0;

    hours = !isTimeNegative ? hours : 0;
    minutes = !isTimeNegative ? minutes : 0;
    seconds = !isTimeNegative ? seconds : 0;

    return `${hours > 0 ? `${hours}h` : ''} ${minutes > 0 ? `${minutes}m` : '0m'} ${seconds > 0 ? `${seconds}s` : '0s'}`;
}

/**
 * Transforms the product series remaining lifespan to humanly readable date
 * @param translatorKey svelte i18n `$_` function
 * @param date date to transform
 * @param productseries product series of the product we transform the date on
 * @returns transformed date
 */
export function transformDate(translatorKey: (arg0: string) => string, date: number, productseries: ProductSeries = "any"): string {
    if (date > 0) {

        const years = new Date(date).getFullYear() - 1970;

        const months = new Date(date).getMonth();
        const mappedMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        const daysToMonths = [...Array(months).keys()].map((_v, i) => mappedMonths[i]).reduce((p, c) => { return p + c }, 0)

        const days = (years * 365) + daysToMonths + new Date(date).getDate() - 1;
        const daysPlural = days != 1 ? translatorKey('date.days') : translatorKey('date.day');
        const hours = new Date(date).getHours();
        const hoursPlural = hours != 1 ? translatorKey('date.hours') : translatorKey('date.hour');

        return `${days} ${daysPlural}, ${hours} ${hoursPlural}`;
    } else if(productseries == "any"){
        return translatorKey('slots.product.unknownLifespan');
    } else {
        return translatorKey('slots.product.done');
    }
}