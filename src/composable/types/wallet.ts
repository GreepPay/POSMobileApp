export interface BridgeKYCInitiaionResponse {
  created_at: string;
  customer_id: string;
  email: string;
  full_name: string;
  id: string;
  kyc_link: string;
  kyc_status: string;
  persona_inquiry_type: string;
  provider: string;
  rejection_reasons: any[];
  tos_link: string;
  tos_status: string;
  type: string;
}

export interface MyKoboInitiationResponse {
  success: boolean;
  message: string;
  data: {
    id: null;
    account: null;
    memo: null;
    type: null;
    status: string;
    fields: {
      first_name: {
        type: string;
        description: string;
      };
      last_name: {
        type: string;
        description: string;
      };
      email_address: {
        type: string;
        description: string;
      };
      mobile_number: {
        type: string;
        description: string;
      };
      bank_account_number: {
        type: string;
        description: string;
      };
      photo_id_front: {
        type: string;
        description: string;
      };
      photo_proof_residence: {
        type: string;
        description: string;
      };
      proof_of_liveness: {
        type: string;
        description: string;
      };
    };
    provided_fields: null;
    message: null;
  };
  errors: null;
  provider: string;
}