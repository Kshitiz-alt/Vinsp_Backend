export function getPaginated<T>(data:T[],page:number = 1 , limit: number = 10):T[] {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return data.slice(startIndex, endIndex)
};
