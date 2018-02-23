export function range(start: number, end: number): number[] {
    return new Array(end - start)
        .fill(0)
        .map((_, i) => i + start);
}

export function delay(time: number): Promise<void> {
    return new Promise(_ => setTimeout(_, time))
}