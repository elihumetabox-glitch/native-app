import dayjs from "dayjs";

export const formatCurrency = (value: number, currency = "USD"): string => {
    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    } catch {
        return value.toFixed(2);
    }
};

export const convertCurrency = (amount: number, from: string, to: string): number => {
    // Placeholder conversion. In a real app, this would use real rates.
    // Assuming 1:1 conversion for now as no conversion rates are available.
    return amount;
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