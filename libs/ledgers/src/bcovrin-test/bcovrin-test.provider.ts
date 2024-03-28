import { Injectable, Logger } from "@nestjs/common";
import { IRegistrator } from "../IRegistrator";
import genesisFile from "./genesis-file";
import axios, { AxiosError } from "axios";
import { IndyVdrPoolConfig } from "@credo-ts/indy-vdr";
import { LedgerProviderFailRegistrationError } from "@ocm-engine/dtos";

const NAME = "BCOVRIN_TEST";
const URL = "http://test.bcovrin.vonx.io/register";

@Injectable()
export class BcovrinTestProvider implements IRegistrator {
  private readonly logger: Logger = new Logger(BcovrinTestProvider.name);

  getName = (): string => {
    return NAME;
  };

  register = async (
    unqualifiedIndyDid: string,
    verkey: string,
  ): Promise<string> => {
    const did = `did:indy:bcovrin:test:${unqualifiedIndyDid}`;

    this.logger.log(`Trying to register ${did} to bcovrin test`);
    try {
      await axios.post(URL, {
        did: unqualifiedIndyDid,
        verkey,
        role: "ENDORSER",
      });

      this.logger.log("Registration successful");
      return did;
    } catch (e) {
      this.logger.log("Registration failed");
      this.logger.log("BCOVRIN Registration failed");

      if (e instanceof Error || e instanceof AxiosError) {
        throw new LedgerProviderFailRegistrationError(e.message);
      }
      throw new Error("BCOVRIN registration fail - Reason UNKNOWN");
    }
  };

  getNetworkConf = (): IndyVdrPoolConfig => {
    return {
      transactionAuthorAgreement: {
        version: "1",
        acceptanceMechanism: "accept",
      },
      genesisTransactions: genesisFile,
      indyNamespace: "bcovrin:test",
      isProduction: false,
      connectOnStartup: true,
    };
  };
}
