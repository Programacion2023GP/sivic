import { Penalties } from "../penalties/penalties.model";
import { Public_Securrity } from "../security/security";
import { Traffic } from "../traffic/traffic";

export interface AlcoholCase {
   alcohol_level: string;
   active?: boolean;
   requires_confirmation: boolean;
   updated_at?: string;
   created_at?: string;
   id?: number;
   current_process_id?: number;
   residence_folio?:number;
   [key: string]: any;
   // data?: Penalties | Court | Traffic | Public_Securrity
}
