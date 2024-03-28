
import type { AnonCredsRevocationRegistryDefinition } from '@credo-ts/anoncreds';
import type { AgentContext } from '@credo-ts/core';

import { BasicTailsFileService } from '@credo-ts/anoncreds';
import fs from 'fs';
import { Client } from 'minio';


export class S3TailsFileService extends BasicTailsFileService {
  private tailsServerBaseUrl: string;
  private tailsServerBucketName: string;
  private s3Secrets: {
    s3AccessKey: string;
    s3Secret: string;
  };

  public constructor(options: {
    tailsDirectoryPath?: string;
    tailsServerBaseUrl: string;
    tailsServerBucketName: string;
    s3AccessKey: string;
    s3Secret: string;
  }) {
    super(options);
    this.tailsServerBaseUrl = options.tailsServerBaseUrl;
    this.tailsServerBucketName = options.tailsServerBucketName;
    this.s3Secrets = {
      s3AccessKey: options.s3AccessKey,
      s3Secret: options.s3Secret,
    };
  }

  public override async uploadTailsFile(
    agentContext: AgentContext,
    options: {
      revocationRegistryDefinition: AnonCredsRevocationRegistryDefinition;
    },
  ) {
    const url = new URL(this.tailsServerBaseUrl);
    const useSSL = url.protocol === 'https:';
    const [endPoint, port] = url.host.split(':');

    const client = new Client({
      endPoint,
      port: port ? Number(port) : undefined,
      useSSL,
      accessKey: this.s3Secrets.s3AccessKey,
      secretKey: this.s3Secrets.s3Secret,
    });

    const revocationRegistryDefinition = options.revocationRegistryDefinition;
    const localTailsFilePath = revocationRegistryDefinition.value.tailsLocation;
    const pathParts = localTailsFilePath.split('/');
    const tailsFileId = pathParts[pathParts.length - 1];

    const readStream = fs.createReadStream(localTailsFilePath);

    const tailsFileUrl = `${this.tailsServerBaseUrl}/${this.tailsServerBucketName}/${tailsFileId}`;

    console.log(
      `Uploading tails file to: ${tailsFileUrl}`,
    );

    await client.putObject(this.tailsServerBucketName, tailsFileId, readStream);

    return {
      tailsFileUrl,
    };
  }
}