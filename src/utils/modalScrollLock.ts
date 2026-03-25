type ScrollLockSnapshot = {
  scrollY: number;
  bodyPosition: string;
  bodyTop: string;
  bodyLeft: string;
  bodyRight: string;
  bodyWidth: string;
};

let lockCount = 0;
let snapshot: ScrollLockSnapshot | null = null;

export const lockBodyScrollKeepScrollbar = () => {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  lockCount += 1;

  if (lockCount === 1) {
    const { body } = document;
    const scrollY = window.scrollY;

    snapshot = {
      scrollY,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
  }

  let released = false;

  return () => {
    if (released) {
      return;
    }

    released = true;
    lockCount = Math.max(0, lockCount - 1);

    if (lockCount > 0 || !snapshot) {
      return;
    }

    const { body } = document;

    body.style.position = snapshot.bodyPosition;
    body.style.top = snapshot.bodyTop;
    body.style.left = snapshot.bodyLeft;
    body.style.right = snapshot.bodyRight;
    body.style.width = snapshot.bodyWidth;

    window.scrollTo(0, snapshot.scrollY);
    snapshot = null;
  };
};