import { stringCleanse } from "./stringCleanse";

test('Basic Test Number One: Should return same output', () => {
    expect(stringCleanse('hello world')).toBe('hello world');
});

test('hello world => hello world', () => {
    expect(stringCleanse('hello world')).toBe('hello world')
});

test('hello%world => hello world', () => {
    expect(stringCleanse('hello%world')).toBe('hello world');
});

test('!hello world => hello world', () => {
    expect(stringCleanse('!hello world')).toBe('hello world');
});

test(';hello?world! => hello world', () => {
    expect(stringCleanse(';hello?world!')).toBe('hello world');
});

test('hello;world => hello world', () => {
    expect(stringCleanse('hello;world')).toBe('hello world');
});

test('hello world? => hello world', () => {
    expect(stringCleanse('hello world?')).toBe('hello world');
});