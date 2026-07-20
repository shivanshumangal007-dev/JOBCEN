export function getNativeValueSetter(element) {
    let proto = Object.getPrototypeOf(element);
    while (proto) {
        const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
        if (descriptor?.set)
            return descriptor.set.bind(element);
        proto = Object.getPrototypeOf(proto);
    }
    return null;
}
export function setReactInputValue(element, value) {
    const setter = getNativeValueSetter(element);
    if (!setter) {
        console.error("CareerMatch: no native value setter found for", element);
        return;
    }
    setter(value);
    element.dispatchEvent(new Event("input", { bubbles: true }));
}
export async function simulateTyping(input, text) {
    // clear first
    setReactInputValue(input, "");
    input.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));
    let current = "";
    for (const char of text) {
        current += char;
        input.dispatchEvent(new KeyboardEvent("keydown", { key: char, bubbles: true }));
        setReactInputValue(input, current);
        input.dispatchEvent(new KeyboardEvent("keyup", { key: char, bubbles: true }));
        await new Promise((res) => setTimeout(res, 60)); // mimic natural typing speed
    }
}
export function simulateFullClick(element) {
    const opts = { bubbles: true, cancelable: true, view: window, button: 0 };
    element.dispatchEvent(new PointerEvent("pointerdown", opts));
    element.dispatchEvent(new MouseEvent("mousedown", opts));
    element.dispatchEvent(new PointerEvent("pointerup", opts));
    element.dispatchEvent(new MouseEvent("mouseup", opts));
    element.dispatchEvent(new MouseEvent("click", opts));
}
export function waitForElement(selector, timeoutMs = 3000, intervalMs = 100) {
    return new Promise((resolve) => {
        const start = Date.now();
        const check = () => {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                resolve(elements);
                return;
            }
            if (Date.now() - start >= timeoutMs) {
                resolve(null); // timed out, caller handles the null
                return;
            }
            setTimeout(check, intervalMs);
        };
        check();
    });
}
