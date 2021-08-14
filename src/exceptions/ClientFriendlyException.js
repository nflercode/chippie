import API_STATUS_CODES from "../constants/api-status-codes.js";

export function ClientFriendlyException(
  message = 'Unknown error occured',
  statusCode = API_STATUS_CODES.INTERNAL_ERROR) {
  this.message = message;
  this.statusCode = statusCode;
}
