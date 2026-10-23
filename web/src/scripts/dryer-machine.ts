// Dryer No.3 as a state machine (docs/DRYER-FLOW.md §2). There is ONE state;
// every event moves it to the next phase, and render() paints the whole screen
// from that state alone. Nothing else decides what is visible.
import { DownloadLink } from "../lib/download";
import {
  checkBeforeUpload,
  compressedName,
  type Cycle,
  CYCLES,
  DEFAULT_CYCLE,
  type DryerErrorCode,
  type DryerState,
  elapsedLabel,
  OUT_OF_ORDER,
  SLOW_DRYING_MS,
} from "../lib/dryer";
import { startDryer, warmUp } from "../lib/dryer-request";
import { formatBytes, savingsLabel } from "../lib/format";
import { DROPZONE_EVENT, type DropzoneFilesEvent } from "./dropzone";

// Step shown for each phase (StepIndicator: 1 Load · 2 Cycle · 3 Dry · 4 Take home).
const STEP: Record<DryerState["phase"], number> = { empty: 0, loaded: 1, uploading: 2, drying: 2, done: 3, error: 1 };

// Full class names, so Tailwind (which reads this file as text) generates them.
const GLASS: Record<DryerState["phase"], string> = {
  empty: "bg-surface",
  loaded: "bg-glass-image",
  uploading: "bg-glass-image",
  drying: "bg-glass-dryer",
  done: "bg-glass-sort",
  error: "bg-surface",
};

const cycleName = (cycle: Cycle) => CYCLES.find((item) => item.value === cycle)?.name ?? "Normal";

export function initDryer(root: HTMLElement): void {
  const $ = <T extends Element>(selector: string) => root.querySelector<T>(selector)!;
  const led = $<HTMLElement>("[data-dryer-led]");
  const lamp = $<HTMLElement>("[data-dryer-lamp]");
  const glass = $<HTMLElement>("[data-dryer-glass]");
  const announce = $<HTMLElement>("[data-dryer-announce]");
  const steps = [...document.querySelectorAll<HTMLLIElement>("[data-steps] li")];
  const download = new DownloadLink($<HTMLAnchorElement>("[data-dryer-download]"));

  let state: DryerState = { phase: "empty" };
  let cycle: Cycle = DEFAULT_CYCLE;
  let abort: (() => void) | undefined;
  let clock: number | undefined;

  // ---------- Painting ----------

  const render = (): void => {
    const { phase } = state;
    for (const panel of root.querySelectorAll<HTMLElement>("[data-panel]")) panel.hidden = panel.dataset.panel !== phase;

    // Machine: LED, lamp and glass.
    led.textContent =
      phase === "uploading"
        ? `LOADING ${state.percent}%`
        : phase === "drying"
          ? `DRYING ${elapsedLabel(Date.now() - state.startedAt)}`
          : phase === "done"
            ? "DONE"
            : phase === "error"
              ? OUT_OF_ORDER[state.code].led
              : "READY";
    lamp.toggleAttribute("data-running", phase === "uploading" || phase === "drying");
    glass.classList.remove(...Object.values(GLASS));
    glass.classList.add(GLASS[phase]);
    $<HTMLElement>("[data-dryer-pdf]").hidden = !(phase === "loaded" || phase === "uploading");
    $<HTMLElement>("[data-dryer-papers]").hidden = phase !== "drying";
    $<HTMLElement>("[data-dryer-check]").hidden = phase !== "done";

    // Steps.
    steps.forEach((step, index) => {
      if (index === STEP[phase]) step.setAttribute("aria-current", "step");
      else step.removeAttribute("aria-current");
      step.toggleAttribute("data-done", index < STEP[phase] || phase === "done");
    });

    if (phase === "loaded") {
      // textContent, never innerHTML: the file name comes from the user.
      $<HTMLElement>("[data-dryer-file]").textContent = state.file.name;
      $<HTMLElement>("[data-dryer-file-meta]").textContent = `${formatBytes(state.file.size)} · loaded`;
      for (const option of root.querySelectorAll<HTMLButtonElement>("[data-cycle]")) {
        option.setAttribute("aria-pressed", String(option.dataset.cycle === state.cycle));
      }
    }
    if (phase === "uploading") {
      $<HTMLElement>("[data-dryer-upload-line]").textContent = `${cycleName(state.cycle)} cycle · sending ${state.file.name} (${formatBytes(state.file.size)})`;
      $<HTMLElement>("[data-dryer-upload-bar]").setAttribute("aria-valuenow", String(state.percent));
      $<HTMLElement>("[data-dryer-upload-fill]").style.width = `${state.percent}%`;
      $<HTMLElement>("[data-dryer-upload-note]").textContent = `${state.percent}% in the drum. Drying starts as soon as it's all in.`;
    }
    if (phase === "drying") {
      $<HTMLElement>("[data-dryer-dry-line]").textContent = `${cycleName(state.cycle)} cycle · recompressing photos, keeping every word.`;
      $<HTMLElement>("[data-dryer-dry-note]").textContent =
        Date.now() - state.startedAt > SLOW_DRYING_MS
          ? "Heavy load. Still drying — big PDFs can take up to a minute."
          : "Please don't open the door. It only takes a few seconds.";
    }
    if (phase === "done") {
      const { originalSize, compressedSize, alreadyOptimized } = state;
      const pct = savingsLabel(originalSize, compressedSize).replace("−", "");
      $<HTMLElement>("[data-dryer-result-title]").textContent = alreadyOptimized ? "Already as light as it gets" : `Your PDF shrank ${pct}`;
      const line = $<HTMLElement>("[data-dryer-result-line]");
      if (alreadyOptimized) {
        line.textContent =
          state.cycle === "extreme" ? "We gave you back the original." : "We gave you back the original. Heavy duty may squeeze a little more.";
      } else {
        line.replaceChildren(
          `${formatBytes(originalSize)} → `,
          Object.assign(document.createElement("strong"), { className: "text-ink", textContent: formatBytes(compressedSize) }),
          ` · you saved ${formatBytes(originalSize - compressedSize)}`,
        );
      }
      $<HTMLElement>("[data-dryer-care-cycle]").textContent = cycleName(state.cycle);
    }
    if (phase === "error") {
      const card = OUT_OF_ORDER[state.code];
      $<HTMLElement>("[data-dryer-error-led]").textContent = card.led;
      $<HTMLElement>("[data-dryer-error-title]").textContent = card.title;
      $<HTMLElement>("[data-dryer-error-body]").textContent = card.body;
      const link = $<HTMLAnchorElement>("[data-dryer-error-link]");
      const button = $<HTMLButtonElement>("[data-dryer-error-button]");
      const isLink = "href" in card.action;
      link.hidden = !isLink;
      button.hidden = isLink;
      if ("href" in card.action) {
        link.href = card.action.href;
        link.textContent = card.action.label;
      } else {
        button.textContent = card.action.label;
        button.dataset.kind = card.action.kind;
      }
    }
  };

  /** Move to a new state; announce only phase changes, never each % or second (§9). */
  const go = (next: DryerState): void => {
    const changed = next.phase !== state.phase;
    state = next;
    render();
    if (!changed) return;
    const messages: Partial<Record<DryerState["phase"], string>> = {
      loaded: "PDF loaded. Pick a cycle, then start the dryer.",
      uploading: "Loading the dryer.",
      drying: "Drying.",
      done: "Done. Your PDF is ready to take home.",
    };
    announce.textContent = next.phase === "error" ? OUT_OF_ORDER[next.code].title : (messages[next.phase] ?? "");
    if (next.phase === "done") $<HTMLAnchorElement>("[data-dryer-download]").focus();
    if (next.phase === "error") $<HTMLElement>("[data-dryer-error-title]").focus();
  };

  // ---------- Transitions ----------

  const fail = (file: File | null, code: DryerErrorCode, retryAfter?: number): void => go({ phase: "error", file, cycle, code, retryAfter });

  const load = async (file: File): Promise<void> => {
    if (state.phase === "uploading" || state.phase === "drying") return; // §7: no swapping mid-cycle.
    download.clear();
    const problem = await checkBeforeUpload(file);
    if (problem) return fail(file, problem);
    warmUp(); // §8: wake Cloud Run while the user picks a cycle.
    go({ phase: "loaded", file, cycle });
  };

  const stopClock = (): void => {
    window.clearInterval(clock);
    clock = undefined;
  };

  const start = async (): Promise<void> => {
    if (state.phase !== "loaded") return; // §7: ignore double clicks.
    const { file } = state;
    const run = startDryer(file, state.cycle, {
      onUploadProgress: (percent) => {
        if (state.phase === "uploading") go({ ...state, percent });
      },
      onUploadDone: () => {
        if (state.phase !== "uploading") return;
        go({ phase: "drying", file, cycle: state.cycle, startedAt: Date.now() });
        clock = window.setInterval(render, 1000); // DRYING 0:12, once a second.
      },
    });
    abort = run.abort;
    go({ phase: "uploading", file, cycle: state.cycle, percent: 0 });

    const outcome = await run.outcome;
    stopClock();
    abort = undefined;
    if (outcome.ok) {
      download.set(outcome.result, compressedName(file.name));
      go({ phase: "done", file, cycle, ...outcome });
    } else if (outcome.code === "aborted") {
      go({ phase: "loaded", file, cycle }); // §6: stopping is not an error.
      announce.textContent = "Dryer stopped. Your PDF is still loaded.";
    } else {
      fail(file, outcome.code, "retryAfter" in outcome ? outcome.retryAfter : undefined);
    }
  };

  const reset = (): void => {
    download.clear(); // §4: free the result's memory.
    go({ phase: "empty" });
  };

  // ---------- Events ----------

  root.addEventListener(DROPZONE_EVENT, (event) => {
    const [file] = (event as DropzoneFilesEvent).detail;
    if (file) void load(file);
  });
  for (const option of root.querySelectorAll<HTMLButtonElement>("[data-cycle]")) {
    option.addEventListener("click", () => {
      if (state.phase !== "loaded") return;
      cycle = option.dataset.cycle as Cycle;
      go({ ...state, cycle });
    });
  }
  $<HTMLButtonElement>("[data-dryer-start]").addEventListener("click", () => void start());
  for (const stop of root.querySelectorAll<HTMLButtonElement>("[data-dryer-stop]")) stop.addEventListener("click", () => abort?.());
  $<HTMLButtonElement>("[data-dryer-swap]").addEventListener("click", reset);
  $<HTMLButtonElement>("[data-dryer-again]").addEventListener("click", reset);
  $<HTMLButtonElement>("[data-dryer-error-button]").addEventListener("click", (event) => {
    const kind = (event.currentTarget as HTMLButtonElement).dataset.kind;
    if (state.phase !== "error") return;
    // "Try again" resends the same file and cycle without asking for it again (§5).
    if (kind === "retry" && state.file) {
      go({ phase: "loaded", file: state.file, cycle: state.cycle });
      void start();
    } else {
      reset();
    }
  });

  // §7: warn before leaving only while a load is in the machine.
  window.addEventListener("beforeunload", (event) => {
    if (state.phase === "uploading" || state.phase === "drying") event.preventDefault();
  });

  render();
}
