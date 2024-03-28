import {
  Agent,
  AutoAcceptCredential,
  AutoAcceptProof,
  BaseEvent,
  ConnectionsModule,
  CredentialEventTypes,
  CredentialsModule,
  CredentialState,
  CredentialStateChangedEvent,
  DidDocument,
  DidsModule,
  EncryptedMessage,
  JsonTransformer,
  Key,
  KeyDidResolver,
  KeyType,
  OutOfBandState,
  PeerDidResolver,
  ProofEventTypes,
  ProofExchangeRecord,
  ProofsModule,
  ProofState,
  ProofStateChangedEvent,
  TypedArrayEncoder,
  V2CredentialProtocol,
  V2ProofProtocol,
  W3cCredentialsModule,
  WalletError,
  WalletKeyExistsError,
  WebDidResolver,
  JwkDidResolver,
} from "@credo-ts/core";
import {
  AnonCredsCredentialFormatService,
  AnonCredsModule,
  AnonCredsProofFormatService,
} from "@credo-ts/anoncreds";
import {
  IndyVdrAnonCredsRegistry,
  IndyVdrIndyDidRegistrar,
  IndyVdrIndyDidResolver,
  IndyVdrModule,
} from "@credo-ts/indy-vdr";
import { indyVdr } from "@hyperledger/indy-vdr-nodejs";
import { anoncreds } from '@hyperledger/anoncreds-nodejs'
import { AskarModule } from "@credo-ts/askar";
import { ariesAskar } from "@hyperledger/aries-askar-nodejs";
import { Key as AskarKey, KeyAlgs } from "@hyperledger/aries-askar-shared";
import { IConfAgent } from "@ocm-engine/config";
import axios, { AxiosResponse } from "axios";
import {
  catchError,
  filter,
  lastValueFrom,
  map,
  Observable,
  BehaviorSubject,
  Subject,
  take,
  timeout,
} from "rxjs";
import { SubjectInboundTransport } from "./askar/transports/agent.subject.inbound.transport";
import { SubjectOutboundTransport } from "./askar/transports/agent.subject.outbound.transport";
import { S3TailsFileService } from './credo/revocation/TailFileService';

export type EventBehaviorSubject = BehaviorSubject<BaseEvent>;
export type SubjectMessage = {
  message: EncryptedMessage;
  replySubject?: Subject<SubjectMessage>;
};
import { Request, Response, Express } from "express";
import url from "url";
import { JsonLdCredentialFormatService } from "./credo/JsonLdCredentialFormatService";
import { AskarService } from ".";
import { OfferCredentialRequestDto } from "@ocm-engine/dtos";
import { uuid } from "@credo-ts/core/build/utils/uuid";
import { GenericRecord } from "@credo-ts/core/build/modules/generic-records/repository/GenericRecord";



export interface AnonCredsCredentialMetadata {
  schemaId?: string;
  credentialDefinitionId?: string;
  revocationRegistryId?: string;
  credentialRevocationId?: string;
}


export const importDidsToWallet = async (
  agent: Agent,
  dids: Array<string>,
): Promise<void> => {
  for (const did in dids) {
    try {
      await agent.dids.import({
        did: dids[did],
        overwrite: false,
      });
    } catch (e) {
      console.log((e as Error).message);
    }
  }
};

export const generateKey = async ({
  seed,
  agent,
}: {
  seed: string;
  agent: Agent;
}): Promise<Key> => {
  if (!seed) {
    throw Error("No seed provided");
  }

  const seedBuffer = TypedArrayEncoder.fromString(seed);

  try {
    return await agent.wallet.createKey({
      seed: seedBuffer,
      keyType: KeyType.Ed25519,
    });
  } catch (e) {
    if (e instanceof WalletKeyExistsError) {
      const c = AskarKey.fromSeed({
        algorithm: KeyAlgs.Ed25519,
        seed: seedBuffer,
      });

      return Key.fromPublicKey(c.publicBytes, KeyType.Ed25519);
    }

    if (e instanceof WalletError) {
      throw new Error(`Failed to create key - ${e.message}`);
    }

    throw new Error("Unknown");
  }
};

export const generateDidWeb = async ({
  seed,
  agent,
  peerAddress,
}: {
  seed: string;
  agent: Agent;
  peerAddress: string;
}) => {
  console.log("Generating did web");
  const pubKey = await generateKey({ seed, agent });

  const parsedUrl = url.parse(peerAddress);
  let hostname = parsedUrl.hostname!;
  const port = parsedUrl.port;
  const pathname = parsedUrl.pathname?.replace(/^\/+|\/+$/g, "");

  // If port is specified, encode it
  if (port) {
    hostname += `%3A${port}`;
  }
  // Convert URLs to 'did:web' form
  let didWeb = `did:web:${hostname}`;
  if (pathname) {
    didWeb += `:${pathname.replace(/\//g, ":")}`;
  }

  const verificationMethodKey0Id = `${didWeb}#jwt-key0`;

  const jsonDidDoc = {
    "@context": [
      "https://www.w3.org/ns/did/v1",
      "https://w3id.org/security/suites/ed25519-2018/v1",
    ],
    id: didWeb,
    verificationMethod: [
      {
        id: verificationMethodKey0Id,
        type: "Ed25519VerificationKey2018",
        controller: didWeb,
        publicKeyBase58: pubKey.publicKeyBase58,
      },
    ],
    authentication: [verificationMethodKey0Id],
    assertionMethod: [verificationMethodKey0Id],
    keyAgreement: [verificationMethodKey0Id],
  };

  const didDocumentInstance = JsonTransformer.fromJSON(jsonDidDoc, DidDocument);

  const recordId = "did:web";
  const existingRecord = await agent.genericRecords.findById(recordId);
  if (existingRecord) {
    await agent.genericRecords.deleteById(recordId);
  }
  await agent.genericRecords.save({
    id: recordId,
    content: jsonDidDoc,
  });

  await agent.dids.import({
    did: didWeb,
    didDocument: didDocumentInstance,
    overwrite: false,
  });

  console.log("Generated did:web");
  console.log(didWeb);
  console.log(JSON.stringify(didDocumentInstance.toJSON(), null, 2));
};

export const generateDidFromKey = (key: Key): string => {
  if (!key) {
    throw new Error("Key not provided");
  }

  return TypedArrayEncoder.toBase58(key.publicKey.slice(0, 16));
};

//eslint-disable-next-line
export const getAskarAnonCredsIndyModules = (networks: any, config: IConfAgent) => {
  return {
    connections: new ConnectionsModule({
      autoAcceptConnections: true,
    }),
    credentials: new CredentialsModule({
      autoAcceptCredentials: AutoAcceptCredential.ContentApproved,
      credentialProtocols: [
        new V2CredentialProtocol({
          credentialFormats: [
            new AnonCredsCredentialFormatService(),
            new JsonLdCredentialFormatService(),
          ],
        }),
      ],
    }),
    proofs: new ProofsModule({
      autoAcceptProofs: AutoAcceptProof.ContentApproved,
      proofProtocols: [
        new V2ProofProtocol({
          proofFormats: [new AnonCredsProofFormatService()],
        }),
      ],
    }),
    anoncreds: new AnonCredsModule({
      registries: [new IndyVdrAnonCredsRegistry()],
      anoncreds,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      autoCreateLinkSecret: true,
      tailsFileService: new S3TailsFileService({
        tailsServerBaseUrl: config.tailsServerBaseUrl,
        s3AccessKey: config.s3AccessKey,
        s3Secret: config.s3Secret,
        tailsServerBucketName: config.tailsServerBucketName,
      }),
    }),
    indyVdr: new IndyVdrModule({
      indyVdr,
      networks,
    }),
    dids: new DidsModule({
      registrars: [new IndyVdrIndyDidRegistrar()],
      resolvers: [
        new IndyVdrIndyDidResolver(),
        new KeyDidResolver(),
        new PeerDidResolver(),
        new WebDidResolver(),
        new JwkDidResolver(),
      ],
    }),
    askar: new AskarModule({
      ariesAskar,
    }),
    w3c: new W3cCredentialsModule(),
  } as const;
};

const INITIAL_EVENT: BaseEvent = {
  type: "unknown",
  payload: {},
  metadata: {
    contextCorrelationId: "-1",
  },
};

export const setupEventBehaviorSubjects = (
  agents: Agent[],
  eventTypes: string[],
): BehaviorSubject<BaseEvent>[] => {
  const behaviorSubjects: EventBehaviorSubject[] = [];

  for (const agent of agents) {
    const behaviorSubject = new BehaviorSubject<BaseEvent>(INITIAL_EVENT);

    for (const eventType of eventTypes) {
      agent.events.observable(eventType).subscribe(behaviorSubject);
    }

    behaviorSubjects.push(behaviorSubject);
  }

  return behaviorSubjects;
};

export const setupSubjectTransports = (agents: Agent[]) => {
  const subjectMap: Record<string, Subject<SubjectMessage>> = {};

  for (const agent of agents) {
    const messages = new Subject<SubjectMessage>();
    subjectMap[agent.config.endpoints[0]] = messages;
    agent.registerInboundTransport(new SubjectInboundTransport(messages));
    agent.registerOutboundTransport(new SubjectOutboundTransport(subjectMap));
  }
};


export const isProofStateChangedEvent = (
  e: BaseEvent,
): e is ProofStateChangedEvent => e.type === ProofEventTypes.ProofStateChanged;

export const isCredentialStateChangedEvent = (
  e: BaseEvent,
): e is CredentialStateChangedEvent =>
  e.type === CredentialEventTypes.CredentialStateChanged;

export const waitForProofExchangeRecordSubject = (
  subject: BehaviorSubject<BaseEvent> | Observable<BaseEvent>,
  {
    proofRecordId,
    threadId,
    parentThreadId,
    state,
    previousState,
    timeoutMs = 10000,
    count = 1,
  }: {
    proofRecordId?: string;
    threadId?: string;
    parentThreadId?: string;
    state?: ProofState;
    previousState?: ProofState | null;
    timeoutMs?: number;
    count?: number;
  },
): Promise<ProofExchangeRecord> => {
  const observable: Observable<BaseEvent> =
    subject instanceof BehaviorSubject ? subject.asObservable() : subject;
  return lastValueFrom(
    observable.pipe(
      filter(isProofStateChangedEvent),
      filter(
        (e) =>
          (proofRecordId === undefined ||
            e.payload.proofRecord.id === proofRecordId) &&
          (previousState === undefined ||
            e.payload.previousState === previousState) &&
          (threadId === undefined ||
            e.payload.proofRecord.threadId === threadId) &&
          (parentThreadId === undefined ||
            e.payload.proofRecord.parentThreadId === parentThreadId) &&
          (state === undefined || e.payload.proofRecord.state === state),
      ),
      timeout(timeoutMs),
      catchError(() => {
        throw new Error(
          `ProofStateChangedEvent event not emitted within specified timeout: ${timeoutMs}
          previousState: ${previousState},
          threadId: ${threadId},
          parentThreadId: ${parentThreadId},
          state: ${state}
        }`,
        );
      }),
      take(count),
      map((e) => e.payload.proofRecord),
    ),
  );
};

export const waitForCredentialExchangeRecordSubject = (
  subject: BehaviorSubject<BaseEvent> | Observable<BaseEvent>,
  {
    credentialRecordId,
    threadId,
    parentThreadId,
    state,
    previousState,
    timeoutMs = 10000,
    count = 1,
  }: {
    credentialRecordId?: string;
    threadId?: string;
    parentThreadId?: string;
    state?: CredentialState;
    previousState?: CredentialState | null;
    timeoutMs?: number;
    count?: number;
  },
) => {
  const observable: Observable<BaseEvent> =
    subject instanceof BehaviorSubject ? subject.asObservable() : subject;
  return lastValueFrom(
    observable.pipe(
      filter(isCredentialStateChangedEvent),
      filter(
        (e) =>
          (credentialRecordId === undefined ||
            e.payload.credentialRecord.id === credentialRecordId) &&
          (previousState === undefined ||
            e.payload.previousState === previousState) &&
          (threadId === undefined ||
            e.payload.credentialRecord.threadId === threadId) &&
          (parentThreadId === undefined ||
            e.payload.credentialRecord.parentThreadId === parentThreadId) &&
          (state === undefined || e.payload.credentialRecord.state === state),
      ),
      timeout(timeoutMs),
      catchError(() => {
        throw new Error(
          `CredentialStateChanged event not emitted within specified timeout: ${timeoutMs}
          previousState: ${previousState},
          threadId: ${threadId},
          parentThreadId: ${parentThreadId},
          state: ${state}
        }`,
        );
      }),
      take(count),
      map((e) => e.payload.credentialRecord),
    ),
  );
};

export const attachShortUrlHandler = (server: Express, agent: Agent): void => {
  server.get(
    "/invitations/:invitationId",
    async (req: Request, res: Response) => {
      try {
        const { invitationId } = req.params;

        const outOfBandRecord = await agent.oob.findByCreatedInvitationId(
          invitationId,
        );

        if (
          !outOfBandRecord ||
          outOfBandRecord.state !== OutOfBandState.AwaitResponse
        ) {
          return res.status(404).send("Not found");
        }

        const invitationJson = outOfBandRecord.outOfBandInvitation.toJSON();

        return res
          .header("Content-Type", "application/json")
          .send(invitationJson);
      } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
      }
    },
  );
};

export const attachDidWebHandler = (
  server: Express,
  agent: Agent,
  agentPeerAddress: string,
): void => {
  const parsedUrl = url.parse(agentPeerAddress);
  const pathname = parsedUrl.pathname?.replace(/^\/+|\/+$/g, "");

  let serverDidWebPath: string;
  if (pathname) {
    serverDidWebPath = `/did.json`;
  } else {
    serverDidWebPath = "/.well-known/did.json";
  }

  console.log("Listen did web requests on path " + serverDidWebPath);
  server.get(serverDidWebPath, async (req: Request, res: Response) => {
    try {
      const didWebRecord = await agent.genericRecords.findById("did:web");

      if (!didWebRecord) {
        return res.status(404).send("Not found");
      }

      const didWebDoc = didWebRecord.content;

      return res.header("Content-Type", "application/json").send(didWebDoc);
    } catch (error) {
      console.error(error);
      return res.status(500).send("Internal Server Error");
    }
  });
};
export const webHookHandler = async <T>(
  addr: string,
  webHookTopic: string,
  payload: T,
) => {
  const promises: Promise<AxiosResponse>[] = [];

  const tokenUrlPairs = addr.split(";");

  for (const pair of tokenUrlPairs) {
    const [token, url] = pair.split("@");

    const promise = axios.post(`${url}/topic/${webHookTopic}`, payload, {
      headers: {
        "X-Api-Key": token,
      },
    });

    promises.push(promise);
  }

  const promiseResults = await Promise.allSettled(promises);
  for (let index = 0; index < promiseResults.length; index++) {
    const promiseResult = promiseResults[index];
    const [_, url] = tokenUrlPairs[index].split("@");

    if (promiseResult.status === "rejected") {
      console.log(
        `Failed to send web hook to ${url}/topic/${webHookTopic}. Reason ${promiseResult.reason}`,
      );
      continue;
    }
    console.log(`Successfully sent web hook to ${url}/topic/${webHookTopic}`);
  }
};


export const getRevocationDetails = async (
  askar: AskarService,
  credentialId: string,
) => {
  const credential = await askar.agent.credentials.getById(credentialId);

  // const metadata = credential.metadata.get<AnonCredsCredentialMetadata>(
  //   '_anoncreds/credential',
  // );
  
  const credentialRevocationRegistryDefinitionId = credential.getTag(
    'anonCredsRevocationRegistryId'
  ) as string
  const credentialRevocationIndex = credential.getTag('anonCredsCredentialRevocationId') as string

  if (
    !credentialRevocationRegistryDefinitionId ||
    !credentialRevocationIndex
  ) {
    throw new Error(
      `Credential with id=${credentialId} has no metadata, likely issued without support for revocation.`,
    );
  }

  const { revocationRegistryDefinition } =
    await askar.agent.modules.anoncreds.getRevocationRegistryDefinition(
      credentialRevocationRegistryDefinitionId,
    );

  if (!revocationRegistryDefinition) {
    throw new Error(
      `Could not find the revocation registry definition for id=${credentialRevocationRegistryDefinitionId}.`,
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const { revocationStatusList } =
    await askar.agent.modules.anoncreds.getRevocationStatusList(
      credentialRevocationRegistryDefinitionId,
      timestamp,
    );

  if (!revocationStatusList) {
    throw new Error(
      `Could not find the revocation status list for revocation registry definition id: ${credentialRevocationRegistryDefinitionId} and timestamp: ${timestamp}.`,
    );
  }

  return {
    credentialRevocationId: Number(credentialRevocationIndex),
    revocationStatusList,
    revocationRegistryId: credentialRevocationRegistryDefinitionId,
  };
}


export const handleRevocationForCredDef = async (
  context: AskarService,
  offerCredentialDto: OfferCredentialRequestDto
): Promise<{
  revocRecord: GenericRecord[],
  statusListIndex: string | number,
  revocationRegistryDefinitionId: string | undefined,
}> => {
  let statusListIndex = undefined;
  let customRevocRecord = undefined;
  let revocationRegistryDefinitionId = undefined;
  
  console.log('Issuing revocable credential.');

  customRevocRecord = await context.agent.genericRecords.findAllByQuery({
    credentialDefinitionId: offerCredentialDto.credentialDefinitionId,
  })
  
  console.log('Using saved revocation custom record.');

  if (!customRevocRecord || customRevocRecord.length < 1 || !customRevocRecord[0]) {
    console.log("Registering new revocation records.");
    
    const {
      revocStatusList,
      revocReg,
    } = await registerRevocationDefAndList(context, offerCredentialDto.credentialDefinitionId);

    customRevocRecord = await context.agent.genericRecords.save({
      id: uuid(),
      tags: {
        credentialDefinitionId: offerCredentialDto.credentialDefinitionId,
        revocationRegistryDefinitionId: revocReg.revocationRegistryDefinitionState.revocationRegistryDefinitionId,
        latestIndex: '0',
      },
      content: {
        credentialDefinitionId: offerCredentialDto.credentialDefinitionId,
        revocationRegistryDefinitionId: revocReg.revocationRegistryDefinitionState.revocationRegistryDefinitionId,
      }
    })

    customRevocRecord = [customRevocRecord]
    
    if (!customRevocRecord) {
      throw new Error("Could not save generic record for revocation status tracking.");
    }
  }

  statusListIndex = Number(customRevocRecord[0].getTags()['latestIndex'])
  revocationRegistryDefinitionId = customRevocRecord[0].getTags()['revocationRegistryDefinitionId'] as string;

  if (
    statusListIndex && 
    statusListIndex >= context.agentConfig.revocationListSize
  ) {
    const {
      revocStatusList,
      revocReg,
    } = await registerRevocationDefAndList(context, offerCredentialDto.credentialDefinitionId);

    customRevocRecord[0].setTag("latestIndex", "0")
    customRevocRecord[0].setTag("revocationRegistryDefinitionId", revocReg.revocationRegistryDefinitionState.revocationRegistryDefinitionId)
    await context.agent.genericRecords.update(customRevocRecord[0])

    revocationRegistryDefinitionId = revocReg.revocationRegistryDefinitionState.revocationRegistryDefinitionId;
    statusListIndex = "0";
  }


  if (
    customRevocRecord &&
    customRevocRecord.length > 0 &&
    typeof statusListIndex !== 'undefined'
  ) {
    customRevocRecord[0].setTag("latestIndex", (Number(statusListIndex)+1).toString())
    await context.agent.genericRecords.update(customRevocRecord[0])
  }


  return {
    revocRecord: customRevocRecord,
    statusListIndex: statusListIndex,
    revocationRegistryDefinitionId,
  }
}


export function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms))
}

export const registerRevocationDefAndList = async (
  context: AskarService,
  credentialDefinitionId: string
) => {
  const dids = await context.agent.dids.getCreatedDids({ method: "indy" });

  let revocReg = await context.agent.modules.anoncreds.registerRevocationRegistryDefinition({
    revocationRegistryDefinition: {
      maximumCredentialNumber: context.agentConfig.revocationListSize,
      issuerId: dids[0].did,
      tag: uuid(),
      credentialDefinitionId: credentialDefinitionId,
    },
    options: {}
  });

  await sleep(1000)
  
  if (
    !revocReg || 
    revocReg.revocationRegistryDefinitionState.state !== 'finished'
  ) {
    throw new Error("Failed to register revocation definition on ledger."+revocReg)
  }

  const revocationRegistryDefinitionId = revocReg.revocationRegistryDefinitionState.revocationRegistryDefinitionId;

  let revocStatusList = await context.agent.modules.anoncreds.registerRevocationStatusList({
    revocationStatusList: {
      revocationRegistryDefinitionId,
      issuerId: dids[0].did,
    },
    options: {}
  })

  await sleep(1000)

  if (!revocStatusList || revocStatusList.revocationStatusListState.state !== 'finished') {
    throw new Error("Failed to register revocation status list on ledger."+revocStatusList);
  }

  return {
    revocStatusList,
    revocReg,
  }
}