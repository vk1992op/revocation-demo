export interface IConfAgent {
  agentDbHost: string;
  agentDbUser: string;
  agentDbPass: string;
  agentPeerPort: number;
  agentPeerAddress: string;
  agentName: string;
  agentKey: string;
  agentDidSeed: string;
  agentIsRest: boolean;
  agentConsumerName: string;
  agentConsumerMaxMessages: number;
  agentConsumerRateLimit: number;
  agentPort: number;
  agentOobGoals: Array<string>;

  agentIsSVDX: boolean;
  agentSVDXWebHook: string;
  agentSVDXBasicUser: string;
  agentSVDXBasicPass: string;

  agentAuthBasicEnabled: boolean;
  agentAuthBasicUser: string;
  agentAuthBasicPass: string;
  agentAuthJwtEnabled: boolean;
  agentAuthJwtPublicKey: string;

  logLevel: number;
  agentWebHook: string;
  agentOobUrl: string | undefined;

  tailsServerBaseUrl: string;
  s3AccessKey: string;
  s3Secret: string;
  tailsServerBucketName: string;

  revocationListSize: number;
}
