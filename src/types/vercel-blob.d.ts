declare module '@vercel/blob' {
  export function put(pathname: string, body: Blob | ReadableStream | ArrayBuffer | string, options: {
    access: 'private' | 'public';
    addRandomSuffix?: boolean;
    contentType?: string;
  }): Promise<{ pathname: string; url: string }>;

  export function get(urlOrPathname: string, options: { access: 'private' | 'public' }): Promise<null | {
    statusCode: number;
    stream: ReadableStream<Uint8Array> | null;
    blob: {
      contentType: string | null;
      contentDisposition: string;
    };
  }>;
}
