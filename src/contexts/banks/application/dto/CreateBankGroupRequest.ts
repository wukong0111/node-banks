export interface CreateBankGroupRequest {
	group_id: string;
	name: string;
	description?: string | null;
	logo_url?: string | null;
	website?: string | null;
}
