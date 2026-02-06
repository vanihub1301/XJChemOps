export const formatDateCustom = (
    dateString: string,
    options?: { format?: string } | Intl.DateTimeFormatOptions
) => {
    try {
        const date = parseDate(dateString);

        if (!date || isNaN(date.getTime())) {
            return '';
        }

        if (options && 'format' in options && options.format) {
            return formatWithPattern(date, options.format);
        }

        return new Intl.DateTimeFormat(options).format(date);
    } catch (error) {
        return '';
    }
};

const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;

    let date = new Date(dateString);
    if (!isNaN(date.getTime())) return date;

    const ddMMyyyyHHmmss = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})$/;
    let match = dateString.match(ddMMyyyyHHmmss);
    if (match) {
        const [, day, month, year, hour, minute, second] = match;
        date = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(hour),
            parseInt(minute),
            parseInt(second)
        );
        if (!isNaN(date.getTime())) return date;
    }

    const ddMMyyyyHHmm = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/;
    match = dateString.match(ddMMyyyyHHmm);
    if (match) {
        const [, day, month, year, hour, minute] = match;
        date = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(hour),
            parseInt(minute)
        );
        if (!isNaN(date.getTime())) return date;
    }

    const ddMMyyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    match = dateString.match(ddMMyyyy);
    if (match) {
        const [, day, month, year] = match;
        date = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day)
        );
        if (!isNaN(date.getTime())) return date;
    }

    const yyyyMMdd = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
    match = dateString.match(yyyyMMdd);
    if (match) {
        const [, year, month, day] = match;
        date = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day)
        );
        if (!isNaN(date.getTime())) return date;
    }

    return null;
};

export const formatWithPattern = (date: Date, pattern: string, locale: string = 'vi'): string => {
    const pad = (num: number, size: number = 2) =>
        String(num).padStart(size, '0');

    const tokens: Record<string, string> = {
        'yyyy': String(date.getFullYear()),
        'yy': String(date.getFullYear()).slice(-2),
        'MM': pad(date.getMonth() + 1),
        'M': String(date.getMonth() + 1),
        'dd': pad(date.getDate()),
        'd': String(date.getDate()),
        'HH': pad(date.getHours()),
        'H': String(date.getHours()),
        'hh': pad(date.getHours() % 12 || 12),
        'h': String(date.getHours() % 12 || 12),
        'mm': pad(date.getMinutes()),
        'm': String(date.getMinutes()),
        'ss': pad(date.getSeconds()),
        's': String(date.getSeconds()),
        'SSS': pad(date.getMilliseconds(), 3),
        'A': date.getHours() >= 12 ? 'PM' : 'AM',
        'a': date.getHours() >= 12 ? 'pm' : 'am',
    };

    const sortedTokens = Object.keys(tokens).sort((a, b) => b.length - a.length);

    let formatted = pattern;
    sortedTokens.forEach(token => {
        formatted = formatted.replace(new RegExp(token, 'g'), tokens[token]);
    });

    return formatted;
};

export const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const parseDateTime = (dateTime: string) => {
    const [date, time] = dateTime.split(' ');
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute, second] = time.split(':').map(Number);

    return new Date(year, month - 1, day, hour, minute, second).getTime();
};
