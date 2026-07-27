const TIMEZONE = 'America/El_Salvador';
const UTC_OFFSET = '-06:00';

const localDateStr = (date) => {
    const d = date || new Date();
    return d.toLocaleDateString('en-CA', { timeZone: TIMEZONE });
};

const startOfLocalDay = (dateStr) => {
    const str = dateStr || localDateStr();
    return new Date(`${str}T00:00:00${UTC_OFFSET}`);
};

const endOfLocalDay = (dateStr) => {
    const str = dateStr || localDateStr();
    return new Date(`${str}T23:59:59${UTC_OFFSET}`);
};

const localDate = (dateStr, hour = '12') => {
    return new Date(`${dateStr}T${hour.padStart(2, '0')}:00:00${UTC_OFFSET}`);
};

const nowLocal = () => {
    const str = localDateStr();
    return new Date(`${str}T12:00:00${UTC_OFFSET}`);
};

module.exports = {
    TIMEZONE,
    UTC_OFFSET,
    localDateStr,
    startOfLocalDay,
    endOfLocalDay,
    localDate,
    nowLocal
};