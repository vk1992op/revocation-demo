import { Injectable, Logger } from "@nestjs/common";
import { AskarService } from "./askar.service";
import {
  ConnectionRecordDto,
  CreateCredentialDefinitionRequestDto,
  CreddefRecordDto,
  CreateInvitationResponseDto,
  CreateSchemaRequestDto,
  SchemaRecordDto,
  CredentialNotCreatedError,
  OfferCredentialRequestDto,
  CredentialRecordDto,
  SchemaNotCreatedError,
  CredentialFilterDto,
  CredentialOfferResponseDto,
  EntityNotFoundError,
  AcceptCredentialDto,
  CreateInvitationRequestDto,
  InvitationFilterDto,
  DidRecordDto,
  RevocationStatusResponseDto,
} from "@ocm-engine/dtos";
import {
  AutoAcceptCredential,
  CredentialExchangeRecord,
  CredentialState,
  Query,
  OutOfBandRecord,
} from "@credo-ts/core";
import {
  getRevocationDetails,
  handleRevocationForCredDef,
  waitForCredentialExchangeRecordSubject,
} from "../agent.utils";



@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);
  constructor(private readonly askar: AskarService) {}

  createInvitation = async (
    createInvitationRequestDto?: CreateInvitationRequestDto,
  ) => {
    const outOfBoundRecord = await this.askar.agent.oob.createInvitation(
      createInvitationRequestDto,
    );

    const response = new CreateInvitationResponseDto();

    let longUrl = outOfBoundRecord.outOfBandInvitation.toUrl({
      domain: this.askar.agentConfig.agentPeerAddress,
    });

    if (this.askar.agentConfig.agentOobUrl) {
      longUrl = longUrl.replace(
        this.askar.agentConfig.agentPeerAddress,
        this.askar.agentConfig.agentOobUrl,
      );
    }

    //TODO: should we replace the short url with agentOobUrl if we do this we should have a redirect in ingress
    response.shortInvitationUrl = `${this.askar.agentConfig.agentPeerAddress}/invitations/${outOfBoundRecord.outOfBandInvitation.id}`;
    response.outOfBandId = outOfBoundRecord.id;
    response.createdAt = outOfBoundRecord.createdAt;
    response.updatedAt = outOfBoundRecord.updatedAt;
    response.role = outOfBoundRecord.role;
    response.state = outOfBoundRecord.state;
    response.invitationUrl = longUrl;

    return response;
  };

  acceptInvitation = async (
    invitationUrl: string,
  ): Promise<ConnectionRecordDto> => {
    const { connectionRecord } =
      await this.askar.agent.oob.receiveInvitationFromUrl(invitationUrl);

    if (typeof connectionRecord === "undefined") {
      throw new EntityNotFoundError();
    }

    const response = new ConnectionRecordDto();
    response.connectionName = connectionRecord.theirLabel;
    response.state = connectionRecord.state;
    response.id = connectionRecord.id;
    response.did = connectionRecord.did;
    response.invitationDid = connectionRecord.invitationDid;
    response.outOfBandId = connectionRecord.outOfBandId;
    response.createdAt = connectionRecord.createdAt;
    response.updatedAt = connectionRecord.updatedAt;
    response.imageUrl = connectionRecord.imageUrl;

    return response;
  };

  deleteInvitationById = async (id: string) => {
    return this.askar.agent.oob.deleteById(id);
  };

  fetchInvitations = async (filter: InvitationFilterDto) => {
    const query: Query<OutOfBandRecord>[] = [];

    if (filter.states) {
      const stateQuery: Query<OutOfBandRecord> = {
        $or: filter.states.map((state) => ({ state })),
      };
      query.push(stateQuery);
    }

    if (filter.roles) {
      const roleQuery: Query<OutOfBandRecord> = {
        $or: filter.roles.map((role) => ({ role })),
      };

      query.push(roleQuery);
    }

    let invitations = await this.askar.agent.oob.findAllByQuery({
      $and: query,
    });
    invitations = invitations.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const invitationsResponse = invitations.map((invitation) => {
      const response = new CreateInvitationResponseDto();
      response.invitationUrl = invitation.outOfBandInvitation.toUrl({
        domain: this.askar.agentConfig.agentPeerAddress,
      });
      response.shortInvitationUrl = `${this.askar.agentConfig.agentPeerAddress}/invitations/${invitation.outOfBandInvitation.id}`;
      response.outOfBandId = invitation.id;
      response.createdAt = invitation.createdAt;
      response.updatedAt = invitation.updatedAt;
      response.role = invitation.role;
      response.state = invitation.state;
      return response;
    });

    return invitationsResponse;
  };

  getInvitationById = async (oobId: string) => {
    const invitation = await this.askar.agent.oob.getById(oobId);

    const response = new CreateInvitationResponseDto();
    response.invitationUrl = invitation.outOfBandInvitation.toUrl({
      domain: this.askar.agentConfig.agentPeerAddress,
    });
    response.shortInvitationUrl = `${this.askar.agentConfig.agentPeerAddress}/invitations/${invitation.outOfBandInvitation.id}`;
    response.outOfBandId = invitation.id;
    response.createdAt = invitation.createdAt;
    response.updatedAt = invitation.updatedAt;
    response.role = invitation.role;
    response.state = invitation.state;
    return response;
  };

  async fetchConnections(): Promise<ConnectionRecordDto[]> {
    //TODO: no ordering in findAllByQuery
    const agentResponse = (await this.askar.agent.connections.getAll()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const connectionArray = agentResponse.map((singleConnectionRes) => {
      const connectionResponse = new ConnectionRecordDto();
      connectionResponse.id = singleConnectionRes.id;
      connectionResponse.state = singleConnectionRes.state;
      connectionResponse.connectionName = singleConnectionRes.theirLabel;
      connectionResponse.alias = singleConnectionRes.alias;
      connectionResponse.did = singleConnectionRes.did;
      connectionResponse.invitationDid = singleConnectionRes.invitationDid;
      connectionResponse.outOfBandId = singleConnectionRes.outOfBandId;
      connectionResponse.createdAt = singleConnectionRes.createdAt;
      connectionResponse.updatedAt = singleConnectionRes.updatedAt;
      connectionResponse.imageUrl = singleConnectionRes.imageUrl;

      return connectionResponse;
    });

    return connectionArray;
  }

  getConnectionByOobId = async (oobId: string) => {
    const connectionRecords =
      await this.askar.agent.connections.findAllByOutOfBandId(oobId);

    const connectionArray = connectionRecords.map((singleConnectionRes) => {
      const connectionResponse = new ConnectionRecordDto();
      connectionResponse.id = singleConnectionRes.id;
      connectionResponse.state = singleConnectionRes.state;
      connectionResponse.connectionName = singleConnectionRes.theirLabel;
      connectionResponse.alias = singleConnectionRes.alias;
      connectionResponse.did = singleConnectionRes.did;
      connectionResponse.invitationDid = singleConnectionRes.invitationDid;
      connectionResponse.outOfBandId = singleConnectionRes.outOfBandId;
      connectionResponse.createdAt = singleConnectionRes.createdAt;
      connectionResponse.updatedAt = singleConnectionRes.updatedAt;
      connectionResponse.imageUrl = singleConnectionRes.imageUrl;

      return connectionResponse;
    });

    return connectionArray;
  };

  getConnectionById = async (id: string): Promise<ConnectionRecordDto> => {
    const agentResponse = await this.askar.agent.connections.findById(id);

    if (!agentResponse) {
      throw new EntityNotFoundError();
    }

    const connectionResponse = new ConnectionRecordDto();
    connectionResponse.id = agentResponse.id;
    connectionResponse.state = agentResponse.state;
    connectionResponse.connectionName = agentResponse.theirLabel;
    connectionResponse.alias = agentResponse.alias;
    connectionResponse.did = agentResponse.did;
    connectionResponse.invitationDid = agentResponse.invitationDid;
    connectionResponse.outOfBandId = agentResponse.outOfBandId;
    connectionResponse.createdAt = agentResponse.createdAt;
    connectionResponse.updatedAt = agentResponse.updatedAt;
    connectionResponse.imageUrl = agentResponse.imageUrl;

    return connectionResponse;
  };

  fetchSchemas = async (): Promise<SchemaRecordDto[]> => {
    let schemaRecords =
      await this.askar.agent.modules.anoncreds.getCreatedSchemas({});
    schemaRecords = schemaRecords.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const schemaResponses = schemaRecords.map((singleSchemaRes) => {
      const schemaResponse = new SchemaRecordDto();
      schemaResponse.id = singleSchemaRes.schemaId;
      schemaResponse.createdAt = singleSchemaRes.createdAt;
      schemaResponse.updatedAt = singleSchemaRes.updatedAt;
      schemaResponse.name = singleSchemaRes.schema.name;
      schemaResponse.attributes = singleSchemaRes.schema.attrNames;
      schemaResponse.version = singleSchemaRes.schema.version;
      schemaResponse.issuerId = singleSchemaRes.schema.issuerId;
      schemaResponse.methodName = singleSchemaRes.methodName;

      return schemaResponse;
    });

    return schemaResponses;
  };

  getSchemaById = async (schemaId: string): Promise<SchemaRecordDto> => {
    const agentResponse = await this.askar.agent.modules.anoncreds.getSchema(
      schemaId,
    );

    if (!agentResponse || !agentResponse.schema) {
      throw new EntityNotFoundError();
    }

    const schemaResponse = new SchemaRecordDto();
    schemaResponse.id = agentResponse.schemaId;
    schemaResponse.name = agentResponse.schema.name;
    schemaResponse.attributes = agentResponse.schema.attrNames;
    schemaResponse.version = agentResponse.schema.version;
    schemaResponse.issuerId = agentResponse.schema.issuerId;

    return schemaResponse;
  };

  createSchema = async (
    schema: CreateSchemaRequestDto,
  ): Promise<SchemaRecordDto> => {
    const dids = await this.askar.agent.dids.getCreatedDids({ method: "indy" });

    const schemaResult =
      await this.askar.agent.modules.anoncreds.registerSchema({
        schema: {
          name: schema.name,
          issuerId: dids[0].did,
          attrNames: schema.attributes,
          version: schema.version,
        },
        options: {},
      });

    if (schemaResult.schemaState.state !== "finished") {
      throw new SchemaNotCreatedError();
    }

    const response = new SchemaRecordDto();

    response.name = schemaResult.schemaState.schema.name;
    response.id = schemaResult.schemaState.schemaId;
    response.issuerId = schemaResult.schemaState.schema.issuerId;
    response.version = schemaResult.schemaState.schema.version;
    response.attributes = schemaResult.schemaState.schema.attrNames;

    return response;
  };

  fetchCredentialDefinitions = async (): Promise<CreddefRecordDto[]> => {
    let credentialDefinitions =
      await this.askar.agent.modules.anoncreds.getCreatedCredentialDefinitions(
        {},
      );
    credentialDefinitions = credentialDefinitions.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const response: Array<CreddefRecordDto> = [];
    for (const credDef of credentialDefinitions) {
      const cd = new CreddefRecordDto();
      cd.id = credDef.credentialDefinitionId;
      cd.createdAt = credDef.createdAt;
      cd.updatedAt = credDef.updatedAt;
      cd.schemaId = credDef.credentialDefinition.schemaId;
      cd.issuerId = credDef.credentialDefinition.issuerId;
      cd.tag = credDef.credentialDefinition.tag;
      response.push(cd);
    }

    return response;
  };

  getCredentialDefinitionById = async (
    credentialDefinitionId: string,
  ): Promise<CreddefRecordDto> => {
    const credDefs =
      await this.askar.agent.modules.anoncreds.getCreatedCredentialDefinitions({
        credentialDefinitionId,
      });

    const credDef = credDefs[0] || null;
    if (!credDef) {
      throw new EntityNotFoundError();
    }

    const cd = new CreddefRecordDto();
    cd.id = credDef.credentialDefinitionId;
    cd.createdAt = credDef.createdAt;
    cd.updatedAt = credDef.updatedAt;
    cd.schemaId = credDef.credentialDefinition.schemaId;
    cd.issuerId = credDef.credentialDefinition.issuerId;
    cd.tag = credDef.credentialDefinition.tag;

    return cd;
  };

  createCredentialDefinition = async (
    credentialDefinitionDto: CreateCredentialDefinitionRequestDto,
  ): Promise<CreddefRecordDto> => {
    const dids = await this.askar.agent.dids.getCreatedDids({ method: "indy" });

    const supportRevocation = credentialDefinitionDto.supportRevocation ?? false;

    const credDef =
      await this.askar.agent.modules.anoncreds.registerCredentialDefinition({
        credentialDefinition: {
          tag: credentialDefinitionDto.tag,
          issuerId: dids[0].did,
          schemaId: credentialDefinitionDto.schemaId,
        },
        options: {
          supportRevocation,
        },
      });

    if (credDef.credentialDefinitionState.state !== "finished") {
      throw new CredentialNotCreatedError();
    }    

    const response = new CreddefRecordDto();

    response.id = credDef.credentialDefinitionState.credentialDefinitionId;
    response.schemaId =
      credDef.credentialDefinitionState.credentialDefinition.schemaId;
    response.issuerId =
      credDef.credentialDefinitionState.credentialDefinition.issuerId;
    response.tag = credDef.credentialDefinitionState.credentialDefinition.tag;
      
    return response;
  };

  offerCredential = async (
    offerCredentialDto: OfferCredentialRequestDto,
  ): Promise<CredentialOfferResponseDto> => {
    this.logger.log(
      "Incoming request",
      JSON.stringify(offerCredentialDto, null, 2),
    );

    let customRevocationRecord = undefined;
    let statusListIdx = undefined;
    let revocationRegistryDef = undefined;

    // REVIEW: it is possible that credential MUST be revocable if cred def is
    if (offerCredentialDto.revocable) {
      const { revocRecord, statusListIndex, revocationRegistryDefinitionId } = await handleRevocationForCredDef(this.askar, offerCredentialDto);
      customRevocationRecord = revocRecord;
      statusListIdx = statusListIndex;
      revocationRegistryDef = revocationRegistryDefinitionId;
    }

    if (!offerCredentialDto.connectionId) {
      const { credentialRecord, message } =
        await this.askar.agent.credentials.createOffer({
          protocolVersion: "v2",
          credentialFormats: {
            anoncreds: {
              credentialDefinitionId: offerCredentialDto.credentialDefinitionId,
              attributes: offerCredentialDto.attributes,
              revocationRegistryDefinitionId: revocationRegistryDef ? revocationRegistryDef : undefined,
              revocationRegistryIndex: typeof statusListIdx === 'undefined' ? undefined : Number(statusListIdx),
            },
          },
          autoAcceptCredential: AutoAcceptCredential.ContentApproved,
        });

      credentialRecord.setTag("xRole", "issuer");
      await this.askar.agent.credentials.update(credentialRecord);

      const outOfBandRecord = await this.askar.agent.oob.createInvitation({
        messages: [message],
        handshake: false,
      });

      const credentialUrl = outOfBandRecord.outOfBandInvitation.toUrl({
        domain: this.askar.agentConfig.agentPeerAddress,
      });

      const shortCredentialUrl = `${this.askar.agentConfig.agentPeerAddress}/invitations/${outOfBandRecord.outOfBandInvitation.id}`;

      const dto = new CredentialRecordDto();
      dto.id = credentialRecord.id;
      dto.state = credentialRecord.state;
      dto.connectionId = credentialRecord.connectionId;
      dto.attributes = credentialRecord.credentialAttributes;
      dto.createdAt = credentialRecord.createdAt;
      dto.tags = credentialRecord.getTags();

      return {
        credentialUrl: credentialUrl,
        shortCredentialUrl: shortCredentialUrl,
        credentialRecord: dto,
        revocationStatusListIndex: Number(statusListIdx),
        revocationRegistryId: revocationRegistryDef,
      };
    }
    const credentialExchangeRecord =
      await this.askar.agent.credentials.offerCredential({
        protocolVersion: "v2",
        connectionId: offerCredentialDto.connectionId,
        credentialFormats: {
          anoncreds: {
            credentialDefinitionId: offerCredentialDto.credentialDefinitionId,
            attributes: offerCredentialDto.attributes,
            revocationRegistryDefinitionId: revocationRegistryDef || undefined,
            revocationRegistryIndex: typeof statusListIdx === 'undefined' ? undefined : Number(statusListIdx),
          },
        },
      });

    credentialExchangeRecord.setTag("xRole", "issuer");
    await this.askar.agent.credentials.update(credentialExchangeRecord);

    const dto = new CredentialRecordDto();
    dto.id = credentialExchangeRecord.id;
    dto.state = credentialExchangeRecord.state;
    dto.connectionId = credentialExchangeRecord.connectionId;
    dto.attributes = credentialExchangeRecord.credentialAttributes;
    dto.createdAt = credentialExchangeRecord.createdAt;
    dto.tags = credentialExchangeRecord.getTags();

    return {
      credentialUrl: null,
      shortCredentialUrl: null,
      credentialRecord: dto,
      revocationStatusListIndex: Number(statusListIdx),
      revocationRegistryId: revocationRegistryDef,
    };
  };

  acceptCredential = async (
    acceptCredentialDto: AcceptCredentialDto,
  ): Promise<CredentialRecordDto> => {
    if (acceptCredentialDto.credentialUrl) {
      return this.acceptOobCredentials(acceptCredentialDto.credentialUrl);
    }
    return this.acceptConnectionCredential(acceptCredentialDto.credentialId);
  };

  acceptOobCredentials = async (url: string): Promise<CredentialRecordDto> => {
    // omit await in order to catch received record in the next line
    setTimeout(() => {
      this.askar.agent.oob.receiveInvitationFromUrl(url, {
        autoAcceptConnection: false,
        autoAcceptInvitation: true,
        // reuseConnection: true,
      });
    }, 20);

    const record = await waitForCredentialExchangeRecordSubject(
      this.askar.agentB,
      {
        state: CredentialState.OfferReceived,
      },
    );

    const acceptedRecord = await this.askar.agent.credentials.acceptOffer({
      credentialRecordId: record.id,
    });

    const response = new CredentialRecordDto();
    response.id = acceptedRecord.id;
    response.state = acceptedRecord.state;
    response.connectionId = acceptedRecord.connectionId;
    response.attributes = acceptedRecord.credentialAttributes;
    response.createdAt = acceptedRecord.createdAt;
    response.tags = acceptedRecord.getTags();

    return response;
  };

  acceptConnectionCredential = async (
    credentialRecordId: string,
  ): Promise<CredentialRecordDto> => {
    const credentialExchangeRecord =
      await this.askar.agent.credentials.acceptOffer({
        credentialRecordId,
      });

    const response = new CredentialRecordDto();
    response.id = credentialExchangeRecord.id;
    response.state = credentialExchangeRecord.state;
    response.connectionId = credentialExchangeRecord.connectionId;
    response.attributes = credentialExchangeRecord.credentialAttributes;
    response.createdAt = credentialExchangeRecord.createdAt;
    response.tags = credentialExchangeRecord.getTags();

    return response;
  };

  declineCredential = async (
    credentialRecordId: string,
  ): Promise<CredentialRecordDto> => {
    const credentialExchangeRecord =
      await this.askar.agent.credentials.declineOffer(credentialRecordId);

    // send request to the issuer that the request is declined, to mark it as Abondoned
    await this.askar.agent.credentials.sendProblemReport({
      credentialRecordId: credentialRecordId,
      description: "Decline offer",
    });

    const response = new CredentialRecordDto();
    response.id = credentialExchangeRecord.id;
    response.state = credentialExchangeRecord.state;
    response.connectionId = credentialExchangeRecord.connectionId;
    response.attributes = credentialExchangeRecord.credentialAttributes;
    response.createdAt = credentialExchangeRecord.createdAt;
    response.tags = credentialExchangeRecord.getTags();

    return response;
  };

  fetchCredentials = async (
    filter: CredentialFilterDto,
  ): Promise<CredentialRecordDto[]> => {
    const query: Query<CredentialExchangeRecord>[] = [];

    if (filter.states) {
      const stateQuery: Query<CredentialExchangeRecord> = {
        $or: filter.states.map((state) => ({ state })),
      };
      query.push(stateQuery);
    }

    if (filter.connectionId) {
      const connectionQuery: Query<CredentialExchangeRecord> = {
        connectionId: filter.connectionId,
      };
      query.push(connectionQuery);
    }

    let credentials = await this.askar.agent.credentials.findAllByQuery({
      $and: query,
    });
    credentials = credentials.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const response: CredentialRecordDto[] = [];
    for (const offer of credentials) {
      const t = new CredentialRecordDto();
      t.id = offer.id;
      t.state = offer.state;
      t.connectionId = offer.connectionId;
      t.createdAt = offer.createdAt;
      t.attributes = offer.credentialAttributes;
      t.tags = offer.getTags();
      response.push(t);
    }

    return response;
  };

  getCredentialById = async (
    credentialId: string,
  ): Promise<CredentialRecordDto> => {
    const credentialRecord = await this.askar.agent.credentials.findById(
      credentialId,
    );

    if (!credentialRecord) {
      throw new EntityNotFoundError();
    }

    const credential = new CredentialRecordDto();
    credential.id = credentialRecord.id;
    credential.state = credentialRecord.state;
    credential.connectionId = credentialRecord.connectionId;
    credential.createdAt = credentialRecord.createdAt;
    credential.attributes = credentialRecord.credentialAttributes;
    credential.tags = credentialRecord.getTags();

    return credential;
  };

  getCredentialStatus = async (
    credentialId: string
  ): Promise<RevocationStatusResponseDto | null> => {
    const {revocationStatusList, revocationRegistryId, credentialRevocationId} = await getRevocationDetails(
      this.askar,
      credentialId
    );

    const revocationStatus = revocationStatusList.revocationList[Number(credentialRevocationId)];

    const status = revocationStatus === 0
      ? true
      : false

    return {
      revocationRegistryId,
      revocationId: credentialRevocationId,
      valid: status,
    };
  };


  revokeCredentialById = async (
    credentialId: string
  ): Promise<RevocationStatusResponseDto> => {
    const {revocationStatusList, revocationRegistryId, credentialRevocationId} = await getRevocationDetails(
      this.askar,
      credentialId
    );

    if (revocationStatusList.revocationList[credentialRevocationId] === 1) {
      throw new Error(
        `Credential with id=${credentialId}, with revocation id=${credentialRevocationId}, is already in a revoked state.`,
      );
    }    

    const updatedList = await this.askar.agent.modules.anoncreds.updateRevocationStatusList({
      revocationStatusList: {
        revocationRegistryDefinitionId: revocationRegistryId,
        revokedCredentialIndexes: [credentialRevocationId]
      },
      options: {},
    })

    if (!updatedList || updatedList.revocationStatusListState.state !== 'finished') {
      throw new Error(
        `An error occurred while trying to update the revocation status list. Error: ${JSON.stringify(
          updatedList,
        )}`,
      );
    }
    

    try {
      const sentRevocationNotification = await this.askar.agent.credentials.sendRevocationNotification({
        credentialRecordId: credentialId,
        revocationId: `${revocationRegistryId}::${credentialRevocationId.toString()}`,
        revocationFormat: 'anoncreds',
      })
      console.log(sentRevocationNotification);
    } catch (err) {
      console.log(err);
    }
    // TODO: handle error from sentRevocationNotification

    

    return {
      revocationRegistryId: revocationRegistryId,
      revocationId: credentialRevocationId,
      valid: false,
      message: 'Credential Revocation Status Updated.',
    }
  }

  deleteCredentialById = async (id: string): Promise<void> => {
    await this.askar.agent.credentials.deleteById(id);
  };

  resolve = async (did: string) => {
    return this.askar.agent.dids.resolve(did);
  };

  getCreatedDids = async (): Promise<DidRecordDto[]> => {
    const didRecords = await this.askar.agent.dids.getCreatedDids();
    return didRecords.map((p) => {
      const dto = new DidRecordDto();
      const tags = p.getTags();

      dto.did = p.did;
      dto.role = p.role;
      dto.method = tags.method;
      dto.tags = tags;

      return dto;
    });
  };

}
