import dayjs from "dayjs";

export const formatCurrency = (value: number, currency = "USD"): string => {
    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
        }).format(value);
    } catch {
        return value.toFixed(2);
    }
};

export const convertCurrency = (amount: number, from: string, to: string): number => {
    if (from === to) return amount;
    throw new Error(`Conversion from ${from} to ${to} is not supported.`);
};

export const formatSubscriptionDateTime = (value?: string): string => {
    if (!value) return "Not provided";
    const parsedDate = dayjs(value);
    return parsedDate.isValid() ? parsedDate.format("MM/DD/YYYY") : "Not provided";
};

export const formatStatusLabel = (value?: string): string => {
    if (!value) return "Unknown";
    return value.charAt(0).toUpperCase() + value.slice(1);
};