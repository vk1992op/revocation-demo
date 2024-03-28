import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";

import {
  Agent,
  BaseEvent,
  ConsoleLogger,
  CredentialEventTypes,
  HttpOutboundTransport,
  InitConfig,
  ProofEventTypes,
  TypedArrayEncoder,
  WsOutboundTransport,
} from "@credo-ts/core";
import { agentDependencies, HttpInboundTransport } from "@credo-ts/node";
import { ConfigService } from "@nestjs/config";
import { LedgersService } from "@ocm-engine/ledgers";
import {
  generateDidFromKey,
  generateKey,
  getAskarAnonCredsIndyModules,
  importDidsToWallet,
  attachShortUrlHandler,
  attachDidWebHandler,
  setupEventBehaviorSubjects,
  setupSubjectTransports,
  generateDidWeb,
} from "../agent.utils";
import { IConfAgent } from "@ocm-engine/config";
import { BehaviorSubject } from "rxjs";
import express from "express";

@Injectable()
export class AskarService implements OnModuleInit, OnModuleDestroy {
  public agent: Agent<ReturnType<typeof getAskarAnonCredsIndyModules>>;
  public agentB: BehaviorSubject<BaseEvent>;
  public agentConfig: IConfAgent;
  private readonly logger: Logger = new Logger(AskarService.name);
  private readonly server = express();

  constructor(
    private readonly configService: ConfigService,
    private readonly ledgersService: LedgersService,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.agentConfig = this.configService.get<IConfAgent>("agent")!;

    const config = {
      label: this.agentConfig.agentName,
      logger: new ConsoleLogger(this.agentConfig.logLevel),
      walletConfig: {
        storage: {
          type: "postgres",
          config: {
            host: this.agentConfig.agentDbHost,
          },
          credentials: {
            account: this.agentConfig.agentDbUser,
            password: this.agentConfig.agentDbPass,
          },
        },
        id: this.agentConfig.agentName,
        key: this.agentConfig.agentKey,
      },
      endpoints: [this.agentConfig.agentPeerAddress],
    } satisfies InitConfig;

    this.agent = new Agent({
      config,
      dependencies: agentDependencies,
      modules: getAskarAnonCredsIndyModules(
        this.ledgersService.ledgersConfig(),
        this.agentConfig
      ),
    });

    //handler for short url invitations, look at agent service createInvitation
    attachShortUrlHandler(this.server, this.agent);
    attachDidWebHandler(
      this.server,
      this.agent,
      this.agentConfig.agentPeerAddress,
    );

    this.agent.registerInboundTransport(
      new HttpInboundTransport({
        app: this.server,
        port: this.agentConfig.agentPeerPort,
      }),
    );

    this.agent.registerOutboundTransport(new WsOutboundTransport());
    this.agent.registerOutboundTransport(new HttpOutboundTransport());

    setupSubjectTransports([this.agent]);

    const [agentB] = setupEventBehaviorSubjects(
      [this.agent],
      [
        ProofEventTypes.ProofStateChanged,
        CredentialEventTypes.CredentialStateChanged,
      ],
    );

    this.agentB = agentB;
    this.logger.log("Agent setup completed");
  }

  async onModuleInit(): Promise<void> {
    this.logger.debug("initializing");
    await this.agent.initialize();

    if (!this.agent.isInitialized) {
      throw new Error("agent not initialized");
    }

    const didWebs = await this.agent.dids.getCreatedDids({ method: "web" });
    if (didWebs.length) {
      for (const didsKey in didWebs) {
        this.logger.debug(
          `agent already have ${didWebs[didsKey].did} registered`,
        );
      }
    } else {
      await generateDidWeb({
        agent: this.agent,
        seed: this.agentConfig.agentDidSeed,
        peerAddress: this.agentConfig.agentPeerAddress,
      });
    }

    const dids = await this.agent.dids.getCreatedDids({ method: "indy" });

    if (dids.length) {
      for (const didsKey in dids) {
        this.logger.debug(`agent already have ${dids[didsKey].did} registered`);
      }

      return;
    }

    this.logger.debug("No dids found for agent");

    const key = await generateKey({
      agent: this.agent,
      seed: this.agentConfig.agentDidSeed,
    });

    const unqualifiedIndyDid = generateDidFromKey(key);

    this.logger.debug(
      `generated did ${unqualifiedIndyDid} from the public key ${TypedArrayEncoder.toBase58(
        key.publicKey,
      )}`,
    );

    const registeredDids = await this.ledgersService.register({
      did: unqualifiedIndyDid,
      verkey: TypedArrayEncoder.toBase58(key.publicKey),
    });

    await importDidsToWallet(this.agent, registeredDids);

    this.logger.debug("registering dids");
    this.logger.debug("did registration completed");
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log("shutting down the agent");
    await this.agent.shutdown();
  }
}
