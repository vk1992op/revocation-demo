import { IndyVdrPoolConfig } from "@credo-ts/indy-vdr";

export interface IRegistrator {
  getName: () => string;
  register: (did: string, verkey: string) => Promise<string>;
  getNetworkConf: () => IndyVdrPoolConfig;
}
