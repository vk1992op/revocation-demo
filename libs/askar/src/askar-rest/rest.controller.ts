import {
  Body,
  Query,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseFilters,
  UseGuards,
  Patch,
} from "@nestjs/common";

import { AgentService } from "../askar/agent.service";
import {
  CreateCredentialDefinitionRequestDto,
  OfferCredentialRequestDto,
  CreateSchemaRequestDto,
  IdReqDto,
  CredentialFilterDto,
  AcceptCredentialDto,
  CreateInvitationRequestDto,
  InvitationFilterDto,
  AcceptInvitationRequestDto,
  DidRecordDto,
} from "@ocm-engine/dtos";
import { AllExceptionsHandler } from "./exception.handler";
import { DidResolutionResult } from "@credo-ts/core";
import { AuthGuard } from "./auth/auth.guard";

@UseFilters(AllExceptionsHandler)
@Controller("v1")
@UseGuards(AuthGuard)
export class RestController {
  constructor(private readonly agentService: AgentService) {}

  @Get("/invitations")
  async fetchInvitations(@Query() filter: InvitationFilterDto) {
    return this.agentService.fetchInvitations(filter);
  }

  @Post("/invitations")
  createInvitation(
    @Body() createInvitationRequestDto: CreateInvitationRequestDto,
  ) {
    return this.agentService.createInvitation(createInvitationRequestDto);
  }

  @Get("/invitations/:id")
  getInvitationById(@Param("id") id: string) {
    return this.agentService.getInvitationById(id);
  }

  @Post("/invitations/accept")
  async acceptInvitation(
    @Body() createInvitationDto: AcceptInvitationRequestDto,
  ) {
    const url =
      createInvitationDto.invitationUrl ||
      createInvitationDto.shortInvitationUrl;

    return this.agentService.acceptInvitation(url);
  }

  @Get("/connections")
  async fetchConnections() {
    return this.agentService.fetchConnections();
  }

  @Get("/connections/:id")
  async getConnectionById(@Param("id") id: string) {
    return this.agentService.getConnectionById(id);
  }

  @Get("/connections/oob/:id")
  async getConnectionByOobId(@Param("id") id: string) {
    return this.agentService.getConnectionByOobId(id);
  }

  @Post("/schemas")
  async createSchema(@Body() schemaDto: CreateSchemaRequestDto) {
    return this.agentService.createSchema(schemaDto);
  }

  @Post("/schemas/get-by-id")
  async getSchemaById(@Body() dto: IdReqDto) {
    return this.agentService.getSchemaById(dto.id);
  }

  @Get("/schemas")
  async fetchSchemas() {
    return this.agentService.fetchSchemas();
  }

  @Get("/definitions")
  async fetchCredentialDefinitions() {
    return this.agentService.fetchCredentialDefinitions();
  }

  @Post("/definitions/get-by-id")
  async getCredentialDefinitionById(@Body() dto: IdReqDto) {
    return this.agentService.getCredentialDefinitionById(dto.id);
  }

  @Post("/definitions")
  async createCredentialDefinition(
    @Body() credentialDefinitionDto: CreateCredentialDefinitionRequestDto,
  ) {
    return this.agentService.createCredentialDefinition(
      credentialDefinitionDto,
    );
  }

  @Post("/credentials/offers")
  async offerCredential(@Body() dto: OfferCredentialRequestDto) {
    return this.agentService.offerCredential(dto);
  }

  @Get("/credentials")
  async fetchCredentials(@Query() credentialFilterDto: CredentialFilterDto) {
    return this.agentService.fetchCredentials(credentialFilterDto);
  }

  @Get("/credentials/:id")
  async getCredentialById(@Param("id") credentialId: string) {
    return this.agentService.getCredentialById(credentialId);
  }

  @Get("/credentials/:id/status")
  async getCredentialStatusById(@Param("id") credentialId: string) {
    return this.agentService.getCredentialStatus(credentialId);
  }

  @Patch("/credentials/:id/revoke")
  async revokeCredentialById(@Param("id") credentialId: string) {
    return this.agentService.revokeCredentialById(credentialId);
  }

  @Post("/credentials/offers/accept")
  async acceptCredential(@Body() dto: AcceptCredentialDto) {
    return this.agentService.acceptCredential(dto);
  }

  @Post("/credentials/offers/:credential_record_id/decline")
  async declineCredential(
    @Param("credential_record_id") credentialRecordId: string,
  ) {
    return this.agentService.declineCredential(credentialRecordId);
  }

  @Get("/created-dids")
  async getCreatedDids(): Promise<DidRecordDto[]> {
    return this.agentService.getCreatedDids();
  }

  @Post("/resolve-did")
  async resolveDid(@Body() dto: IdReqDto): Promise<DidResolutionResult> {
    return this.agentService.resolve(dto.id);
  }
}
