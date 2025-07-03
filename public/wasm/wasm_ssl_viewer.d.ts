/* tslint:disable */
/* eslint-disable */
export function parse_certificate(cert_der: Uint8Array): CertificateInfo;
export class CertificateInfo {
  private constructor();
  free(): void;
  readonly subject: string;
  readonly issuer: string;
  readonly valid_from: string;
  readonly valid_to: string;
  readonly serial_number: string;
  readonly version: number;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_certificateinfo_free: (a: number, b: number) => void;
  readonly certificateinfo_subject: (a: number) => [number, number];
  readonly certificateinfo_issuer: (a: number) => [number, number];
  readonly certificateinfo_valid_from: (a: number) => [number, number];
  readonly certificateinfo_valid_to: (a: number) => [number, number];
  readonly certificateinfo_serial_number: (a: number) => [number, number];
  readonly certificateinfo_version: (a: number) => number;
  readonly parse_certificate: (a: number, b: number) => [number, number, number];
  readonly __wbindgen_export_0: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
