import { StyleSheet } from "react-native";
import i18n from "i18next";

const RTL_LANGS = new Set(["fa", "ar", "he", "ur", "ps", "ckb"]);

const langIsRTL = (lang) =>
  RTL_LANGS.has((lang || "").toLowerCase().split("-")[0]);

const currentlyRTL = () => langIsRTL(i18n?.resolvedLanguage ?? i18n?.language ?? "fa");

/**
 * A module-level `StyleSheet.create({...})` is evaluated once, at import time,
 * so any `textAlign: 'right'` / `flexDirection: 'row-reverse'` baked into it is
 * frozen to Persian and comes out wrong in English.
 *
 * This wraps such a sheet in a factory that takes `isRTL`, and returns a proxy
 * that resolves against the *current* language every time a style is read. The
 * sheet stays a module-level binding — sub-components declared outside the
 * screen component can still close over it — but its direction-sensitive values
 * now follow the language.
 *
 * Usage:
 *   const styles = createDirectionalStyles((isRTL) => ({
 *     label: { textAlign: isRTL ? 'right' : 'left' },
 *   }));
 *
 * Each direction is built once and memoised, so style object identity is stable
 * across renders and React Native's style diffing stays cheap.
 */
export const createDirectionalStyles = (factory) => {
  const cache = new Map();

  const resolve = () => {
    const key = currentlyRTL() ? "rtl" : "ltr";
    let sheet = cache.get(key);
    if (!sheet) {
      sheet = StyleSheet.create(factory(key === "rtl"));
      cache.set(key, sheet);
    }
    return sheet;
  };

  return new Proxy(
    {},
    {
      get: (_target, prop) => resolve()[prop],
      has: (_target, prop) => prop in resolve(),
      ownKeys: () => Reflect.ownKeys(resolve()),
      getOwnPropertyDescriptor: (_target, prop) => {
        const value = resolve()[prop];
        if (value === undefined) return undefined;
        return { value, enumerable: true, configurable: true, writable: false };
      },
    }
  );
};

export default createDirectionalStyles;
