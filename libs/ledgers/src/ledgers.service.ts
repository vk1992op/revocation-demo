import { Injectable, Logger } from "@nestjs/common";
import { BcovrinTestProvider } from "./bcovrin-test/bcovrin-test.provider";
import { IRegistrator } from "./IRegistrator";
import { IndyVdrPoolConfig } from "@credo-ts/indy-vdr";
import { ConfigService } from "@nestjs/config";
import { ILedgers } from "@ocm-engine/config";

@Injectable()
export class LedgersService {
  private providers: Array<IRegistrator>;
  private config: ILedgers;
  private readonly logger: Logger = new Logger(LedgersService.name);

  constructor(
    private bcovrin: BcovrinTestProvider,
    private configService: ConfigService,
  ) {
    this.providers = [bcovrin];

    //FIXME: properly check for null
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.config = configService.get<ILedgers>("ledgers")!;
  }

  register = async ({
    did,
    verkey,
  }: {
    did: string;
    verkey: string;
  }): Promise<Array<string>> => {
    const promises = this.providers
      .filter((provider) => this.config.ledgers.includes(provider.getName()))
      .map((p) => {
        return p.register(did, verkey);
      });

    return Promise.all(promises);
  };

  ledgersConfig = (): Array<IndyVdrPoolConfig> => {
    return this.providers
      .map((provider) => {
        if (this.config.ledgers.includes(provider.getName())) {
          this.logger.log(`setup network for ${provider.getName()}`);

          return provider.getNetworkConf();
        }
        return undefined;
      })
      .filter((p): p is IndyVdrPoolConfig => p !== undefined);
  };
}
