import type { DataFn } from "libskynet";
import { ipnsPath, ipfsPath } from "is-ipfs";

const IPFS_MODULE = "AQC1H912TbJ8BcSqdz_YWvK6msA0eJOsp2UcfJAq6hdKWA";

let callModule: any, connectModule: any;

async function loadLibs() {
  if (callModule && connectModule) {
    return;
  }
  if (typeof window !== "undefined" && window?.document) {
    const pkg = await import("libkernel");
    callModule = pkg.callModule;
    connectModule = pkg.connectModule;
  } else {
    const pkg = await import("libkmodule");
    callModule = pkg.callModule;
    connectModule = pkg.connectModule;
  }
}

export async function refreshGatewayList() {
  const [resp, err] = await doCall("refreshGatewayList");

  if (err) {
    throw new Error(err);
  }

  return resp;
}

export async function fetchIpfs(
  hash: string,
  path = "",
  headers = {},
  receiveUpdate: DataFn
) {
  if (!ipfsPath(`/ipfs/{${hash}`)) {
    throw new Error("Invalid hash");
  }
  return doFetch("fetchIpfs", { hash, path, headers }, receiveUpdate);
}

export async function isIpfs(hash: string, path = "", headers = {}) {
  if (!ipfsPath(`/ipfs/{${hash}`)) {
    throw new Error("Invalid hash");
  }
  return doFetch("isIpfs", { hash, path, headers });
}

export async function fetchIpns(
  hash: string,
  path = "",
  headers = {},
  receiveUpdate: DataFn
) {
  if (!ipnsPath(`/ipns/{${hash}`)) {
    throw new Error("Invalid hash");
  }
  return doFetch("fetchIpns", { hash, path, headers }, receiveUpdate);
}

export async function isIpns(hash: string, path = "", headers = {}) {
  if (!ipnsPath(`/ipns/{${hash}`)) {
    throw new Error("Invalid hash");
  }
  return doFetch("isIpns", { hash, path, headers });
}

async function doFetch(method: string, data: any, receiveUpdate?: DataFn) {
  let [resp, err] = await doCall(method, data, receiveUpdate);

  if (typeof err?.then === "function") {
    [resp, err] = await err;
  }

  if (err) {
    throw new Error(err);
  }

  return resp;
}

async function doCall(method: string, data?: any, receiveUpdate?: DataFn) {
  await loadLibs();
  if (receiveUpdate) {
    return connectModule(IPFS_MODULE, method, data, receiveUpdate);
  }

  return callModule(IPFS_MODULE, method, data);
}
