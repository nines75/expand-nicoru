// ==UserScript==
// @name        拡張ニコる
// @version     0.1.0
// @author      nines
// @description ニコニコ動画でニコるの数に応じてコメントを装飾します
// @namespace   https://github.com/nines75/expand-nicoru
// @match       https://www.nicovideo.jp/*
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_registerMenuCommand
// @downloadURL https://github.com/nines75/expand-nicoru/raw/refs/heads/main/src/expand-nicoru.user.js
// @updateURL   https://github.com/nines75/expand-nicoru/raw/refs/heads/main/src/expand-nicoru.user.js
// @supportURL  https://github.com/nines75/expand-nicoru/issues
// ==/UserScript==

// @ts-check

(() => {
  "use strict";

  // -------------------------------------------------------------------------------------------
  // config
  // -------------------------------------------------------------------------------------------

  /** @type {boolean} */
  const isExtra = GM_getValue("isExtra", false);
  /** @type {boolean} */
  const isBodyHighlighted = GM_getValue("isBodyHighlighted", false);

  // 降順になっている必要がある
  const nicoruCounts = [...(isExtra ? [300, 200] : []), 100, 50, 30, 15];

  /** @type {Record<number, {primary?: string, secondary?: string, isGradient?: boolean} | undefined>} */
  const nicoruColors = {
    15: {
      primary: "#fcc442",
    },
    30: {
      primary: "#fcb242",
    },
    50: {
      primary: "#fc9f42",
    },
    100: {
      primary: "#ffee9d",
      secondary: "#d9a300",
      isGradient: true,
    },
    200: {
      primary: "#ffcccc",
      secondary: "#ff8080",
      isGradient: true,
    },
    300: {
      primary: "#ff8080",
      secondary: "#ff0000",
      isGradient: true,
    },
  };

  // -------------------------------------------------------------------------------------------
  // observer
  // -------------------------------------------------------------------------------------------

  const observer = new MutationObserver(observerCallback);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  /**
   * @param {MutationRecord[]} records
   */
  function observerCallback(records) {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (
          !(node instanceof Element) ||
          !location.href.startsWith("https://www.nicovideo.jp/watch/")
        )
          continue;

        // コメント要素
        {
          if (node.hasAttribute("data-index")) {
            renderComment(node);
            continue;
          }
        }

        // コメント要素の直下
        {
          const parent = node.parentElement;
          if (parent?.hasAttribute("data-index") === true) {
            renderComment(parent);
            continue;
          }
        }
      }
    }
  }

  // -------------------------------------------------------------------------------------------
  // レンダリング
  // -------------------------------------------------------------------------------------------

  /**
   * @param {Element} element
   */
  function renderComment(element) {
    const content = getCommentContent(element);
    if (content === undefined) return;

    const { nicoruElement, bodyElement, timeElement } = content;
    const currentCount = Number(content.nicoruCount);

    const id = nicoruCounts.find((count) => currentCount >= count);
    if (id === undefined) return; // 装飾対象外のコメントを弾く

    const subElement = element.querySelector(":scope > div");
    if (!(subElement instanceof HTMLElement)) return;

    const color = nicoruColors[id];
    if (color === undefined) return;

    // 文字色を変更
    nicoruElement.style.color = "black";
    bodyElement.style.color = "black";
    timeElement.style.color = "dimgray";

    // コメント本文を強調
    if (isBodyHighlighted) bodyElement.style.fontSize = "16px";

    const primary = color.primary ?? "";
    const secondary = color.secondary ?? "";
    const isGradient = color.isGradient ?? false;

    // 背景色を変更
    if (isGradient) {
      subElement.style.background = `linear-gradient(to bottom right, ${primary}, ${secondary})`;
    } else {
      subElement.style.background = primary;
    }
  }

  /**
   * @param {Element} element
   */
  function getCommentContent(element) {
    const bodyElement = element.querySelector(":scope > div > div > p");
    const nicoruElement = element.querySelector(":scope > div > button > p");
    const timeElement = element.querySelector(":scope > div > div > p > span");

    if (
      !(bodyElement instanceof HTMLParagraphElement) ||
      !(nicoruElement instanceof HTMLParagraphElement) ||
      !(timeElement instanceof HTMLSpanElement)
    )
      return;

    const nicoruCount = nicoruElement.textContent;

    return {
      bodyElement,
      timeElement,
      nicoruElement,
      nicoruCount,
    };
  }

  // -------------------------------------------------------------------------------------------
  // メニュー
  // -------------------------------------------------------------------------------------------

  /**
   * @param {string} name
   * @param {boolean} isEnabled
   */
  function getMenuName(name, isEnabled) {
    return `${name}${isEnabled ? "：✅ON" : "：❌OFF"}`;
  }

  GM_registerMenuCommand(
    getMenuName("基準値を追加", isExtra),
    () => GM_setValue("isExtra", !isExtra),
    { title: "デフォルトの基準値に加え、200+と300+の装飾を追加します" }
  );

  GM_registerMenuCommand(
    getMenuName("コメント本文を強調", isBodyHighlighted),
    () => GM_setValue("isBodyHighlighted", !isBodyHighlighted),
    { title: "追加の装飾対象となったコメントの本文を強調します" }
  );
})();
