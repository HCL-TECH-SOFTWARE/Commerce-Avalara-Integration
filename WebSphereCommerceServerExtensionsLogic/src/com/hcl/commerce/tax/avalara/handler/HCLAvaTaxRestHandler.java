package com.hcl.commerce.tax.avalara.handler;

import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import com.ac.commerce.util.logging.ACLogger;
import com.hcl.commerce.tax.avalara.commands.ACAvaTaxSettingsCmdImpl;
import com.ibm.commerce.datatype.TypedProperty;
import com.ibm.commerce.rest.classic.core.AbstractConfigBasedClassicHandler;
import com.ibm.commerce.rest.javadoc.ResponseSchema;

@Path("avalara/{storeId}")
public class HCLAvaTaxRestHandler extends AbstractConfigBasedClassicHandler {
	
	private static final String RESOURCE_NAME = "avalara";
	private static final String AVALARA_RESOLVE_ADDRESS = "resolveAddress";
	private static final String CLASS_NAME_PARAMETER_RESLOVE_ADDRESS = "com.ac.commerce.usermanagement.commands.ACAvalaraAddressVerificationCmd";
	private static final String AVALARA_PAGE_SETTINGS = "pageSettings";
	private static final String CLASS_NAME_PARAMETER_PAGE_SETTINGS = "com.hcl.commerce.tax.avalara.commands.ACAvaTaxSettingsCmd";
	private static final ACLogger LOGGER = new ACLogger(HCLAvaTaxRestHandler.class);
	
	@Override
	public String getResourceName() {
		return RESOURCE_NAME;
	}
	
	@Path(AVALARA_RESOLVE_ADDRESS)
	@POST
	@Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML, MediaType.APPLICATION_XHTML_XML,MediaType.APPLICATION_ATOM_XML })
	@ResponseSchema(parameterGroup = RESOURCE_NAME, responseCodes = {
			@com.ibm.commerce.rest.javadoc.ResponseCode(code = 200, reason = "The requested completed successfully."),
			@com.ibm.commerce.rest.javadoc.ResponseCode(code = 400, reason = "Bad request. Some of the inputs provided to the request aren't valid."),
			@com.ibm.commerce.rest.javadoc.ResponseCode(code = 401, reason = "Not authenticated. The user session isn't valid."),
			@com.ibm.commerce.rest.javadoc.ResponseCode(code = 403, reason = "The user isn't authorized to perform the specified request."),
			@com.ibm.commerce.rest.javadoc.ResponseCode(code = 404, reason = "The specified resource couldn't be found."),
			@com.ibm.commerce.rest.javadoc.ResponseCode(code = 500, reason = "Internal server error. Additional details will be contained on the server logs.") })
	public Response resolveAddress(@PathParam("storeId") String storeId,
			@QueryParam(value = "responseFormat") String responseFormat) throws Exception {

		String METHODNAME = "resolveAddress";
		LOGGER.entering(METHODNAME);

		Response response = null;
		try{
			TypedProperty requestProperties = initializeRequestPropertiesFromRequestMap(responseFormat);
			if (responseFormat == null)
				responseFormat = "application/json";

			response = executeControllerCommandWithContext(storeId, CLASS_NAME_PARAMETER_RESLOVE_ADDRESS, requestProperties, responseFormat);
			
		}catch (Exception e){
			LOGGER.error(METHODNAME, e.getMessage(), e);
			e.printStackTrace();
		}
		LOGGER.exiting(METHODNAME);
		return response;
	}


	@Path(AVALARA_PAGE_SETTINGS)
	@GET
	@Produces({ MediaType.APPLICATION_JSON, MediaType.APPLICATION_XML, MediaType.APPLICATION_XHTML_XML,MediaType.APPLICATION_ATOM_XML })
	@ResponseSchema(parameterGroup = RESOURCE_NAME, responseCodes = {
			@com.ibm.commerce.rest.javadoc.ResponseCode(code = 200, reason = "The requested completed successfully."),
			@com.ibm.commerce.rest.javadoc.ResponseCode(code = 400, reason = "Bad request. Some of the inputs provided to the request aren't valid."),
			@com.ibm.commerce.rest.javadoc.ResponseCode(code = 401, reason = "Not authenticated. The user session isn't valid."),
			@com.ibm.commerce.rest.javadoc.ResponseCode(code = 403, reason = "The user isn't authorized to perform the specified request."),
			@com.ibm.commerce.rest.javadoc.ResponseCode(code = 404, reason = "The specified resource couldn't be found."),
			@com.ibm.commerce.rest.javadoc.ResponseCode(code = 500, reason = "Internal server error. Additional details will be contained on the server logs.") })
	public Response pageSettings(@PathParam("storeId") String storeId,
			@QueryParam(value = "responseFormat") String responseFormat) throws Exception {

		String METHODNAME = "pageSettings";
		LOGGER.entering(METHODNAME);

		Response response = null;
		try{
			TypedProperty requestProperties = initializeRequestPropertiesFromRequestMap(responseFormat);
			if (responseFormat == null)
				responseFormat = "application/json";

			response = executeControllerCommandWithContext(storeId, CLASS_NAME_PARAMETER_PAGE_SETTINGS, requestProperties, responseFormat);
			
		}catch (Exception e){
			LOGGER.error(METHODNAME, e.getMessage(), e);
			e.printStackTrace();
		}
		LOGGER.exiting(METHODNAME);
		return response;
	}

}
