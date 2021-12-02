package com.hcl.commerce.tax.avalara.commands;

import org.apache.commons.lang3.StringUtils;

import com.ac.avalara.order.bean.ACAvalaraConfigurationDataBean;
import com.ac.avalara.settings.ACAvalaraSettings;
import com.ac.avalara.settings.ACAvalaraSettingsUtils;
import com.ac.avatax.rest.logger.AvalaraLogger;
import com.ac.avatax.rest.logger.AvalaraLoggerSettings;
import com.ac.commerce.util.logging.ACLogger;
import com.ibm.commerce.command.ControllerCommandImpl;
import com.ibm.commerce.datatype.TypedProperty;
import com.ibm.commerce.exception.ECException;


public class ACAvaTaxSettingsCmdImpl extends ControllerCommandImpl implements ACAvaTaxSettingsCmd {

	private static final String CLASSNAME = ACAvaTaxSettingsCmdImpl.class.getName();
	private static final ACLogger LOGGER = new ACLogger(ACAvaTaxSettingsCmdImpl.class);
	private static final AvalaraLogger AVA_LOGGER =  new AvalaraLogger();	
	private ACAvalaraSettings settings;
	private AvalaraLoggerSettings loggerSettings;
	TypedProperty responseProperty = new TypedProperty();
	
	public void performExecute() throws ECException {
	
		String methodName = "performExecute";
		// tracing method entry
		LOGGER.entering(methodName);
		//AVA_LOGGER.init(loggerSettings);
		TypedProperty responseProperty = new TypedProperty();
		
		
		
		try {
			ACAvalaraConfigurationDataBean bean = new ACAvalaraConfigurationDataBean();
			bean.setCommandContext(commandContext);
			bean.populate();
						
			responseProperty.put("addrValidationRegPage", bean.isAddrValidationRegPage());
			responseProperty.put("addrValidationCheckout", bean.isAddrValidationCheckout());
			responseProperty.put("addrValidationQP", bean.isAddrValidationQP());
			responseProperty.put("addrValidationMyAcc", bean.isAddrValidationMyAcc());
			responseProperty.put("orderItemTaxesDisplayed", bean.isOrderItemTaxesDisplayed());
			responseProperty.put("addrCountries", bean.getAddrCountries());
			
		
		} catch (Exception e) {
			LOGGER.error(methodName, e.getMessage(), e);
			responseProperty.put("Exception", StringUtils.isEmpty(e.getMessage()) ? "Error in Avalara Settings" : e.getMessage());
			
		}
		
		setResponseProperties(responseProperty);
		LOGGER.exiting(methodName);
	}
	
}
