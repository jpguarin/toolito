// A download link backed by an in-memory file (Blob). Each new file frees the
// previous one, so memory does not grow while people keep trying things.
export class DownloadLink {
  private url: string | undefined;

  constructor(private readonly link: HTMLAnchorElement) {}

  set(blob: Blob, fileName: string): void {
    this.clear();
    this.url = URL.createObjectURL(blob);
    this.link.href = this.url;
    this.link.download = fileName;
  }

  clear(): void {
    if (this.url) URL.revokeObjectURL(this.url);
    this.url = undefined;
    this.link.removeAttribute("href");
  }
}
