import { ProofRecordDto } from "../generics/proof.record.dto";

export class RequestProofResponseDto {
  public proofUrl: string | null;
  public shortProofUrl: string | null;
  public proofRecord: ProofRecordDto;
}
