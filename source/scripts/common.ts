export function delay(time: number): Promise<void> {
    return new Promise(_ => setTimeout(_, time))
}