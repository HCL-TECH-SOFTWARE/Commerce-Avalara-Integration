package com.hcl.commerce.tax.avalara.commands;

import com.ibm.commerce.command.ControllerCommand;

public interface ACAvaTaxSettingsCmd extends ControllerCommand {

	String defaultCommandClassName = ACAvaTaxSettingsCmdImpl.class.getName();
	
}

