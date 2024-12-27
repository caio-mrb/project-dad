export function useDateUtils() {
    const formatDateToISO = (date) => {
        return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
    };

    return { formatDateToISO };
}
