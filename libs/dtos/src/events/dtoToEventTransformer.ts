import {
  ALL_EVENTS,
  BasicMessageEvent,
  ConnectionEvent,
  CredentialEvent,
  ProofEvent,
  SchemaEvent,
} from "./types";
import { CloudEventDto } from "./event";
import { ConnectionUnsupportedTypeError } from "../errors/connection.unsupported.type.error";
import { CreateCredentialDefinitionRequestDto } from "../dtos/requests/create.credential.definition.request.dto";
import { CreateInvitationResponseDto } from "../dtos/responses/create.invitation.response.dto";
import { CreateSchemaRequestDto } from "../dtos/requests/create.schema.request.dto";
import { OfferCredentialRequestDto } from "../dtos/requests/offer.credential.request.dto";
import { RequestProofDto } from "../dtos/requests/request.proof.dto";
import { MessageRecordDto } from "../dtos/generics/message.record.dto";
import { MakeBasicMessageRequestDto } from "../dtos/requests/make.basic.message.request.dto";
import { AcceptProofDto } from "../dtos/requests/accept.proof.dto";
import { ProofRecordDto } from "../dtos/generics/proof.record.dto";
import { IdReqDto } from "../dtos/requests/id.req.dto";

export const makeEvent = (payload: {
  data:
    | null
    | RequestProofDto
    | CreateInvitationResponseDto
    | CreateSchemaRequestDto
    | AcceptProofDto
    | IdReqDto
    | CreateCredentialDefinitionRequestDto
    | ProofRecordDto
    | OfferCredentialRequestDto
    | MessageRecordDto
    | MakeBasicMessageRequestDto;
  type:
    | SchemaEvent
    | CredentialEvent
    | ProofEvent
    | ConnectionEvent
    | BasicMessageEvent;
  source: string;
}) => {
  if (!ALL_EVENTS.includes(payload.type)) {
    throw new ConnectionUnsupportedTypeError();
  }

  const event = new CloudEventDto<typeof payload.data>();
  event.subject = payload.type;
  event.source = payload.source;
  event.type = payload.type;
  event.data = payload.data;

  return event;
};
