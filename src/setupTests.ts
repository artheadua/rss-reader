import { TextDecoder, TextEncoder } from 'text-encoding';

class LocalStorageMock {
    store: Record<string, string>;

    constructor() {
        this.store = {};
    }

    get length(): number {
        return Object.keys(this.store).length;
    }

    clear(): void {
        this.store = {};
    }

    getItem(key: string) {
        console.log('getItem', key, this.store[key])
        return this.store[key] || null;
    }

    setItem(key: string, value: string) {
        this.store[key] = String(value);
    }

    removeItem(key: string) {
        delete this.store[key];
    }

    key(index: number): string | null {
        const keys = Object.keys(this.store);
        return keys[index] || null;
    }
}

global.localStorage = new LocalStorageMock();
global.confirm = () => true;
global.fetch = jest.fn((input: RequestInfo | URL, init?: RequestInit | undefined) => {
    return Promise.resolve({
        clone: jest.fn(),
        json: () => Promise.resolve({
        }),
        text: () => Promise.resolve('')
    } as any);
}) as any;
// mock clone of Request, Response, TextEncoder, TextDecoder
global.Request = jest.fn() as any;
global.Response = jest.fn() as any;
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;