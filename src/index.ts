import type { DataFn } from "libskynet";
import { ipnsPath, ipfsPath } from "is-ipfs";

const IPFS_MODULE = "AQC1H912TbJ8BcSqdz_YWvK6msA0eJOsp2UcfJAq6hdKWA-A";

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
  headers = {},
  receiveUpdate: DataFn
) {
  if (!ipfsPath(`/ipfs/{${hash}`)) {
    throw new Error("Invalid hash");
  }
  return doFetch("fetchIpfs", { hash, headers }, receiveUpdate);
}

export async function fetchIpns(
  hash: string,
  headers = {},
  receiveUpdate: DataFn
) {
  if (!ipnsPath(`/ipns/{${hash}`)) {
    throw new Error("Invalid hash");
  }
  return doFetch("fetchIpns", { hash, headers }, receiveUpdate);
}

async function doFetch(method: string, data: any, receiveUpdate: DataFn) {
  await loadLibs();
  const [resp, err] = await doCall(method, data, receiveUpdate);

  if (err) {
    throw new Error(err);
  }

  return resp;
}

async function doCall(method: string, data?: any, receiveUpdate?: DataFn) {
  await loadLibs();
  if (receiveUpdate) {
    return await connectModule(IPFS_MODULE, method, data, receiveUpdate);
  }

  return callModule(IPFS_MODULE, method, data);
}
